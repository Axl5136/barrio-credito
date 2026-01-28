import { ArrowRight, Package, Plus } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";


// Helper to assign images based on product name
const getProductImage = (name) => {
    const n = name.toLowerCase();
    if (n.includes('refresco') || n.includes('coca') || n.includes('soda') || n.includes('bebida')) return "https://images.unsplash.com/photo-1641244955612-bf0a643f5ae7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('papas') || n.includes('sabritas') || n.includes('chips') || n.includes('fritura')) return "https://images.unsplash.com/photo-1641693148759-843d17ceac24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('pan') || n.includes('bimbo') || n.includes('bollo') || n.includes('galleta')) return "https://images.unsplash.com/photo-1617859047277-9f47d2bd9696?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('dulce') || n.includes('chocolate') || n.includes('caramelo')) return "https://images.unsplash.com/photo-1613191371521-c6736587728e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    if (n.includes('fruta') || n.includes('verdura') || n.includes('limon') || n.includes('aguacate')) return "https://images.unsplash.com/photo-1556011284-54aa6466d402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";
    return "https://images.unsplash.com/photo-1556011284-54aa6466d402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"; // Fallback
};

export default function VoiceCartResults({ 
    detectedCategories, 
    productos, 
    onBack, 
    onAddToCart 
}) {

    // Filter products by category/keyword
    const getProductsByCategory = (category) => {
        const keyword = category.toLowerCase();
        // Simple mock matching logic
        return productos.filter(p => 
            p.nombre.toLowerCase().includes(keyword) || 
            (keyword === 'refresco' && (p.nombre.toLowerCase().includes('coca') || p.nombre.toLowerCase().includes('soda'))) ||
            (keyword === 'papas' && (p.nombre.toLowerCase().includes('sabritas') || p.nombre.toLowerCase().includes('chips'))) ||
            (keyword === 'pan' && (p.nombre.toLowerCase().includes('bimbo')))
        );
    };

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
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Pedido por Voz</h2>
                    <p className="text-gray-500">Resultados para: {detectedCategories.join(", ")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {detectedCategories.map((category, idx) => {
                    const matchedProducts = getProductsByCategory(category);
                    return (
                        <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[400px]">
                            <div className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 border-b border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-800 capitalize">{category}</h3>
                                <p className="text-sm text-gray-500">{matchedProducts.length} productos encontrados</p>
                            </div>
                            
                            <div className="flex-1 p-4 bg-gray-50 overflow-y-hidden">
                                {matchedProducts.length > 0 ? (
                                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                                        {matchedProducts.map(prod => (
                                            <div key={prod.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 shrink-0">
                                                <img 
                                                    src={getProductImage(prod.nombre)} 
                                                    alt={prod.nombre} 
                                                    className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-sm truncate">{prod.nombre}</h4>
                                                    <p className="text-green-600 font-bold">${prod.precio}</p>
                                                </div>
                                                <button 
                                                    onClick={() => onAddToCart(prod)}
                                                    className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-500 hover:text-white transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <Package size={48} className="mb-2 opacity-20" />
                                        <p className="text-center text-sm">No se encontraron productos para "{category}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
