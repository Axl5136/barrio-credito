import { ArrowRight, Package, Plus } from "lucide-react";
import { motion } from "framer-motion";

// Helper to assign images based on product name
const getProductImage = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("refresco") || n.includes("coca") || n.includes("soda") || n.includes("bebida"))
    return "https://images.unsplash.com/photo-1641244955612-bf0a643f5ae7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
  if (n.includes("papas") || n.includes("sabritas") || n.includes("chips") || n.includes("fritura"))
    return "https://images.unsplash.com/photo-1641693148759-843d17ceac24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
  if (n.includes("pan") || n.includes("bimbo") || n.includes("bollo") || n.includes("galleta"))
    return "https://images.unsplash.com/photo-1617859047277-9f47d2bd9696?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
  if (n.includes("dulce") || n.includes("chocolate") || n.includes("caramelo"))
    return "https://images.unsplash.com/photo-1613191371521-c6736587728e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
  if (n.includes("fruta") || n.includes("verdura") || n.includes("limon") || n.includes("aguacate") || n.includes("manzana"))
    return "https://images.unsplash.com/photo-1556011284-54aa6466d402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
  return "https://images.unsplash.com/photo-1556011284-54aa6466d402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
};

export default function VoiceCartResults({
  voiceResult,          // objeto completo del backend (opcional)
  voiceItems = [],      // voiceResult.normalized_order.items
  onBack,
  onAddToCart,          // aquí le pasas addVoiceItemToCart (adapter)
}) {
  const total = voiceItems.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowRight className="transform rotate-180" />
        </button>

        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800">Pedido por Voz</h2>

          {voiceResult?.raw_transcription ? (
            <p className="text-gray-500">
              Dijiste: <span className="font-medium text-gray-700">"{voiceResult.raw_transcription}"</span>
            </p>
          ) : (
            <p className="text-gray-500">Productos detectados del audio</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Total estimado</p>
          <p className="text-2xl font-black text-green-600">${total.toFixed(2)}</p>
        </div>
      </div>

      {voiceItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 flex flex-col items-center justify-center text-gray-400">
          <Package size={56} className="mb-3 opacity-20" />
          <p className="text-center text-sm">
            No se encontraron productos en tu pedido por voz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {voiceItems.map((item, idx) => (
            <div
              key={`${item.product_id}-${idx}`}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-100 flex items-center gap-4">
                <img
                  src={getProductImage(item.product_name)}
                  alt={item.product_name}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-200"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 truncate">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">
                    Cantidad: <span className="font-semibold text-gray-700">{item.quantity}</span>
                  </p>
                </div>

                <button
                  onClick={() => onAddToCart(item)}
                  className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                  title="Agregar al carrito"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Precio unitario</p>
                  <p className="text-green-700 font-bold">${Number(item.unit_price).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Subtotal</p>
                  <p className="text-gray-900 font-extrabold">${Number(item.subtotal).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
