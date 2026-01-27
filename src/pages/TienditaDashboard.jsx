import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../services/supabase';
import { ShoppingCart, Plus, Minus, Trash2, X, LogOut, Store, Mic } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

import VoiceCartResults from './VoiceCartResults';

// Helper to assign images based on product name (mocking real product images)
const getProductImage = (name) => {
    const n = name.toLowerCase();
    if (n.includes('refresco') || n.includes('coca') || n.includes('soda') || n.includes('bebida')) return "https://images.unsplash.com/photo-1641244955612-bf0a643f5ae7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('papas') || n.includes('sabritas') || n.includes('chips') || n.includes('fritura')) return "https://images.unsplash.com/photo-1641693148759-843d17ceac24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('pan') || n.includes('bimbo') || n.includes('bollo') || n.includes('galleta')) return "https://images.unsplash.com/photo-1617859047277-9f47d2bd9696?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('dulce') || n.includes('chocolate') || n.includes('caramelo')) return "https://images.unsplash.com/photo-1613191371521-c6736587728e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('fruta') || n.includes('verdura') || n.includes('limon') || n.includes('aguacate')) return "https://images.unsplash.com/photo-1556011284-54aa6466d402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    return "https://images.unsplash.com/photo-1556011284-54aa6466d402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"; // Fallback
};

export default function TienditaDashboard() {
    const { user, signOut } = useAuth();
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [showCarrito, setShowCarrito] = useState(false);
    
    // Voice Shopping State
    const [isListening, setIsListening] = useState(false);
    const [detectedText, setDetectedText] = useState("");
    const [detectedCategories, setDetectedCategories] = useState([]);
    const [view, setView] = useState('store');
    
    useEffect(() => {
        cargarProductos();

        // Supabase Realtime
        const channel = supabase
            .channel('productos-cambios')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'productos'
            }, (payload) => {
                cargarProductos();
                if (payload.eventType === 'UPDATE' && payload.new) {
                    setCarrito(prevCarrito =>
                        prevCarrito.map(item =>
                            item.id === payload.new.id
                                ? { ...item, cantidad: payload.new.cantidad }
                                : item
                        ).filter(item => item.cantidad > 0)
                    );
                }
            })
            .subscribe();

        return () => {
            if (channel && channel.unsubscribe) {
                channel.unsubscribe();
            }
        };
    }, []);

    const cargarProductos = async () => {
        const { data } = await supabase
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });
        setProductos(data || []);
    };

    const agregarAlCarrito = (producto) => {
        if (producto.cantidad === 0) return;
        const existe = carrito.find(item => item.id === producto.id);
        if (existe) {
            if (existe.cantidadCarrito < producto.cantidad) {
                setCarrito(carrito.map(item =>
                    item.id === producto.id
                        ? { ...item, cantidadCarrito: item.cantidadCarrito + 1 }
                        : item
                ));
            } else {
                alert('No hay suficiente inventario disponible');
            }
        } else {
            setCarrito([...carrito, { ...producto, cantidadCarrito: 1 }]);
        }
    };

    const modificarCantidad = (id, cantidad) => {
        const producto = productos.find(p => p.id === id);
        if (!producto) return;
        if (cantidad === 0) {
            setCarrito(carrito.filter(item => item.id !== id));
        } else if (cantidad > producto.cantidad) {
            alert('No hay suficiente inventario disponible');
        } else {
            setCarrito(carrito.map(item =>
                item.id === id ? { ...item, cantidadCarrito: cantidad } : item
            ));
        }
    };

    const finalizarCompra = async () => {
        if (carrito.length === 0) return;
        try {
            for (const item of carrito) {
                const { error } = await supabase.rpc('comprar_producto', {
                    p_producto_id: item.id,
                    p_cantidad: item.cantidadCarrito
                });
                if (error) throw error;
            }
            alert('¡Compra realizada con éxito!');
            setCarrito([]);
            setShowCarrito(false);
            setView('store'); // Reset to store
            cargarProductos();
        } catch (error) {
            alert('Error al procesar la compra: ' + error.message);
            cargarProductos();
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    // Voice Interaction Handlers
    const startListening = () => {
        setIsListening(true);
        setDetectedText("");
        setDetectedCategories([]);
        
        // Simulate detection delay
        setTimeout(() => {
            setDetectedText("refresco, papas, pan");
        }, 1500);
    };

    const confirmVoiceOrder = () => {
        setIsListening(false);
        // Parse the text into categories
        const categories = detectedText.split(',').map(s => s.trim()).filter(Boolean);
        setDetectedCategories(categories);
        setView('voice-cart');
    };

    const cancelVoiceOrder = () => {
        setIsListening(false);
        setDetectedText("");
    };

    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidadCarrito), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 relative overflow-x-hidden">
            {/* Header */}
            <nav className="bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('store')}>
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Store className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    Panel Tiendita 🏪
                                </h1>
                                <p className="text-white/90 text-sm hidden sm:block">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button
                                onClick={() => setShowCarrito(true)}
                                className="px-4 py-2 bg-white text-orange-600 rounded-xl font-bold shadow-lg flex items-center gap-2 relative hover:bg-orange-50 transition-colors"
                            >
                                <ShoppingCart size={20} />
                                <span className="hidden sm:inline">Carrito</span>
                                {carrito.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-bounce">
                                        {carrito.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mb-24">
                {view === 'store' ? (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                Mercado Disponible <span className="text-2xl">🌶️</span>
                            </h2>
                        </div>

                        {productos.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center shadow-xl border-4 border-dashed border-pink-200">
                                <span className="text-6xl mb-4 block">🌵</span>
                                <p className="text-gray-500 text-xl mb-2">No hay productos en el mercado</p>
                                <p className="text-gray-400">¡Vuelve más tarde para ver qué hay de nuevo!</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {productos.map((producto) => (
                                    <div 
                                        key={producto.id} 
                                        className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-b-8 border-orange-500"
                                    >
                                        <div className="relative mb-4 overflow-hidden rounded-xl h-48 bg-gray-100">
                                            <img 
                                                src={getProductImage(producto.nombre)} 
                                                alt={producto.nombre}
                                                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                            />
                                            {producto.cantidad === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold transform -rotate-12">AGOTADO</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-800">{producto.nombre}</h3>
                                                <p className="text-green-600 font-bold text-2xl">${producto.precio}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg inline-block">
                                            Disponible: <span className="font-bold">{producto.cantidad}</span>
                                        </p>

                                        {producto.cantidad > 0 ? (
                                            <button
                                                onClick={() => agregarAlCarrito(producto)}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl font-bold shadow-md hover:from-pink-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <ShoppingCart size={18} />
                                                Agregar
                                            </button>
                                        ) : (
                                            <button disabled className="w-full px-4 py-3 bg-gray-200 text-gray-500 rounded-xl font-bold cursor-not-allowed">
                                                Agotado
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Voice Cart View Component
                    <VoiceCartResults 
                        detectedCategories={detectedCategories}
                        productos={productos}
                        onBack={() => setView('store')}
                        onAddToCart={agregarAlCarrito}
                    />
                )}
            </main>

            {/* Floating Action Button (FAB) */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startListening}
                className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl z-50 flex items-center justify-center transition-all duration-300 ${
                    isListening 
                        ? 'bg-red-500 text-white shadow-red-500/50' 
                        : 'bg-green-600 text-white shadow-green-600/50 hover:bg-green-500'
                }`}
            >
                <div className={`absolute inset-0 rounded-full ${isListening ? 'animate-ping bg-red-400 opacity-75' : ''}`}></div>
                <Mic size={28} className="relative z-10" />
            </motion.button>

            {/* Listening Modal */}
            <AnimatePresence>
                {isListening && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="mb-6 relative h-24 flex items-center justify-center">
                                {/* Wave Animation */}
                                <div className="flex gap-2 items-end h-16">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [20, 60, 20] }}
                                            transition={{ 
                                                repeat: Infinity, 
                                                duration: 1, 
                                                delay: i * 0.1,
                                                ease: "easeInOut"
                                            }}
                                            className="w-3 bg-gradient-to-t from-pink-500 to-orange-500 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Te estoy escuchando...</h3>
                            <p className="text-gray-500 mb-6">Di los productos que quieres agregar al carrito.</p>
                            
                            <div className="bg-gray-50 p-4 rounded-xl mb-6 min-h-[80px] flex items-center justify-center border border-gray-100">
                                {detectedText ? (
                                    <p className="text-xl font-medium text-gray-800 capitalize">{detectedText}</p>
                                ) : (
                                    <p className="text-gray-400 italic">Escuchando...</p>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={cancelVoiceOrder}
                                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmVoiceOrder}
                                    disabled={!detectedText}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Carrito (Original) */}
            {showCarrito && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-4 border-white animate-in zoom-in-95 duration-200">
                        <div className="p-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🛒</span>
                                <h2 className="text-2xl font-bold">Mi Canasta</h2>
                            </div>
                            <button
                                onClick={() => setShowCarrito(false)}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {carrito.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-6xl block mb-4">🤔</span>
                                    <p className="text-gray-500 text-xl font-medium">Tu canasta está vacía</p>
                                    <p className="text-gray-400 mt-2">¡Agrega algunos productos deliciosos!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {carrito.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex-1 text-center sm:text-left">
                                                <h3 className="font-bold text-lg text-gray-800">{item.nombre}</h3>
                                                <p className="text-orange-600 font-medium">${item.precio} c/u</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                                <button
                                                    onClick={() => modificarCantidad(item.id, item.cantidadCarrito - 1)}
                                                    className="p-2 bg-white rounded-md text-gray-600 hover:text-pink-600 shadow-sm transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold w-8 text-center">{item.cantidadCarrito}</span>
                                                <button
                                                    onClick={() => modificarCantidad(item.id, item.cantidadCarrito + 1)}
                                                    disabled={item.cantidadCarrito >= item.cantidad}
                                                    className="p-2 bg-white rounded-md text-gray-600 hover:text-green-600 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-xl text-green-600 min-w-[5rem] text-right">
                                                    ${(item.precio * item.cantidadCarrito).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => modificarCantidad(item.id, 0)}
                                                    className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {carrito.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-xl text-gray-600">Total a Pagar:</span>
                                    <span className="text-3xl font-bold text-green-600">
                                        ${totalCarrito.toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={finalizarCompra}
                                    className="w-full px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all flex justify-center items-center gap-2 active:scale-98"
                                >
                                    <span>💸</span> Finalizar Compra
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
