import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'

function App() {
  const [mensaje, setMensaje] = useState('Esperando conexión...')

  useEffect(() => {
    console.log("Probando conexión a:", import.meta.env.VITE_SUPABASE_URL)
    if (supabase) {
      setMensaje('¡Conexión Exitosa con Supabase! 🚀')
    }
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">{mensaje}</h1>
    </div>
  )
}

export default App