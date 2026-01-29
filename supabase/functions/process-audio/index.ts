import OpenAI from "https://esm.sh/openai@4.28.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

type CartItem = {
  product_id: string        // uuid (para response)
  db_product_id: number     // bigint (para insertar)
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

type VoicePromptOutput = {
  orden: Array<{
    producto: string
    cantidad: number
    unidad: string
    nota_original: string
  }>
  confianza: "baja" | "media" | "alta"
  duda_posible: string | null
}

type AudioToCartResponse = {
  intent: "add_to_cart" | "clarification_required"
  confidence: number
  raw_transcription: string
  voice_prompt_output: VoicePromptOutput
  normalized_order: {
    items: CartItem[]
    order_total: number
    currency: "MXN"
  }
  metadata: {
    input_method: "voice"
    language: "es-MX"
    processed_at: string
    model: string
  }
}

type DBProduct = {
  id: number        // int8
  productor_id: string // uuid
  nombre: string
  precio: number
}

const MODEL_CHAT = "gpt-4o-mini"
const MODEL_WHISPER = "whisper-1"

const SYSTEM_PROMPT = `
ROL:
Eres un asistente experto en inventario para "Barrio-Crédito", una App B2B para tienditas en México. Tu trabajo es interpretar pedidos dictados por voz y convertirlos en datos estructurados.

OBJETIVO:
Extraer la intención de compra del usuario y formatearla estrictamente como un objeto JSON.

REGLAS DE FORMATO (CRÍTICO):
Tu respuesta debe ser SOLO un objeto JSON válido. Nada de texto antes ni después.
No uses Markdown (\`\`\`json). Solo el raw JSON.
Si el usuario menciona marcas coloquiales (ej. "Coca"), asocia con el nombre real del producto.
Si falta la cantidad, asume "1".

ESQUEMA JSON ESPERADO:
{
  "orden": [
    {
      "producto": "string (nombre estandarizado)",
      "cantidad": integer,
      "unidad": "string (cajas, piezas, paquetes)",
      "nota_original": "string (lo que dijo exactamente el usuario para referencia)"
    }
  ],
  "confianza": "baja" | "media" | "alta",
  "duda_posible": "string o null (si algo no se entendió bien)"
}
`.trim()

function nowISO() {
  return new Date().toISOString()
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function confidenceToNumber(c: VoicePromptOutput["confianza"]): number {
  if (c === "alta") return 0.9
  if (c === "media") return 0.7
  return 0.5
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function tokenize(s: string) {
  return normalize(s).split(/\s+/).filter(Boolean)
}

function matchProduct(products: DBProduct[], spoken: string): DBProduct | null {
  const n = normalize(spoken)

  // 1) exact
  let p = products.find((x) => normalize(x.nombre) === n)
  if (p) return p

  // 2) contains directo
  p = products.find((x) => normalize(x.nombre).includes(n) || n.includes(normalize(x.nombre)))
  if (p) return p

  // 3) match por tokens (>=2 palabras en común)
  const tSpoken = new Set(tokenize(spoken))
  let best: { prod: DBProduct; score: number } | null = null

  for (const prod of products) {
    const tName = tokenize(prod.nombre)
    const score = tName.reduce((acc, w) => acc + (tSpoken.has(w) ? 1 : 0), 0)
    if (!best || score > best.score) best = { prod, score }
  }

  // mínimo 2 tokens compartidos para aceptar
  return best && best.score >= 2 ? best.prod : null
}

const supabase = createClient(
  Deno.env.get("SB_URL")!,
  Deno.env.get("SB_SERVICE_ROLE_KEY")!
)

async function loadProducts(): Promise<DBProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, productor_id, nombre, precio")

  if (error) throw error
  return (data ?? []) as DBProduct[]
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  // LOGS DE CONEXION PARA DEBUG (mantener comentados en PR)
  // console.log("SB_URL:", Deno.env.get("SB_URL"))
  // console.log("SB_SERVICE_ROLE_KEY prefix:", (Deno.env.get("SB_SERVICE_ROLE_KEY") ?? "").slice(0, 10))

  try {
    // ✅ Preflight CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders })
    }

    // ✅ Aceptar solo POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not found" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // Para demo/local: comprador_id fijo (uuid)
    const comprador_id = Deno.env.get("DEMO_COMPRADOR_ID")
    if (!comprador_id) {
      return new Response(
        JSON.stringify({ error: "Missing DEMO_COMPRADOR_ID env var (must be a UUID from profiles.id)" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    // 1) Recibir audio
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File | null
    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "No audio file provided (field name must be: audio)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    const openai = new OpenAI({ apiKey })

    // 2) Whisper
    const whisper = await openai.audio.transcriptions.create({
      file: audioFile,
      model: MODEL_WHISPER,
      language: "es",
    })

    const raw_transcription = (whisper.text ?? "").trim()
    if (!raw_transcription) {
      return new Response(JSON.stringify({ error: "Empty transcription" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // 3) GPT -> VoicePromptOutput
    const completion = await openai.chat.completions.create({
      model: MODEL_CHAT,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: raw_transcription },
      ],
      response_format: { type: "json_object" },
    })

    const jsonText = completion.choices[0]?.message?.content ?? "{}"
    const voiceOut = safeJsonParse<VoicePromptOutput>(jsonText)

    if (!voiceOut || !Array.isArray(voiceOut.orden)) {
      return new Response(
        JSON.stringify({ error: "Prompt output invalid", raw_output: jsonText }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    // 4) Load products UNA vez
    const products = await loadProducts()

    // 5) Normalizar items usando schema real de products
    const items: CartItem[] = []
    for (const o of voiceOut.orden) {
      const prodName = String(o.producto ?? "")
      const qty = Number(o.cantidad ?? 1)

      if (!prodName) continue
      const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1

      const prod = matchProduct(products, prodName)
      if (!prod) continue

      const unit_price = Number(prod.precio)
      const subtotal = Number((unit_price * quantity).toFixed(2))

      items.push({
        product_id: prod.productor_id,   // uuid para response
        db_product_id: Number(prod.id),  // bigint para order_items (interno)
        product_name: prod.nombre,
        quantity,
        unit_price,
        subtotal,
      })
    }

    const order_total = Number(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2))

    const confidence = confidenceToNumber(voiceOut.confianza)
    const intent: AudioToCartResponse["intent"] =
      items.length === 0 || voiceOut.duda_posible ? "clarification_required" : "add_to_cart"

    const response: AudioToCartResponse = {
      intent,
      confidence,
      raw_transcription,
      voice_prompt_output: voiceOut,
      normalized_order: {
        items,
        order_total,
        currency: "MXN",
      },
      metadata: {
        input_method: "voice",
        language: "es-MX",
        processed_at: nowISO(),
        model: MODEL_CHAT,
      },
    }

    // ✅ Si no hay items o hay duda, NO creamos orden (evita basura en BD)
    if (intent === "clarification_required") {
      const responseItems = items.map(({ db_product_id, ...rest }) => rest)
      return new Response(
        JSON.stringify({
          ...response,
          normalized_order: { ...response.normalized_order, items: responseItems },
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    // 6) INSERT a orders (schema real)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        comprador_id,
        total: response.normalized_order.order_total,
        status: "pendiente",
        detalles_ia: response, // guarda evidencia completa (incluye db_product_id)
      })
      .select("id")
      .single()

    if (orderError) {
      console.error("orders insert error:", orderError)
      return new Response(JSON.stringify({ error: "orders insert failed", orderError }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    const order_id = order.id as string

    // 7) INSERT a order_items (schema real)
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        items.map((i) => ({
          order_id,
          product_id: i.db_product_id,     // BIGINT
          cantidad: i.quantity,            // int4
          precio_unitario: i.unit_price,   // numeric
        }))
      )

    if (itemsError) {
      console.error("order_items insert error:", itemsError)
      return new Response(JSON.stringify({ error: "order_items insert failed", itemsError }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // 8) Decrementar stock en products
    for (const i of items) {
      const { error: stockErr } = await supabase.rpc("decrement_stock", {
        p_product_id: i.db_product_id,
        p_qty: i.quantity,
      })

      if (stockErr) {
        console.error("stock update failed:", stockErr)
        return new Response(JSON.stringify({ error: "stock update failed", stockErr }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      }
    }

    // ✅ Respuesta limpia (sin db_product_id)
    const responseItems = items.map(({ db_product_id, ...rest }) => rest)

    return new Response(
      JSON.stringify({
        ...response,
        normalized_order: { ...response.normalized_order, items: responseItems },
        order_id,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  } catch (err) {
    console.error("process-audio error:", err)

    const details =
      err instanceof Error ? { message: err.message, stack: err.stack } : err

    return new Response(JSON.stringify({ error: "Internal error", details }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }
})


