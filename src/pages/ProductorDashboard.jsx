import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../services/supabase';
import { Plus, Minus, Trash2, Package, LogOut, TrendingUp } from 'lucide-react';

export default function ProductorDashboard() {
    const { user, signOut } = useAuth();
    const [productos, setProductos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        cantidad: '',
        descripcion: ''
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        if (!user?.id) return;
        
        const { data } = await supabase
            .from('productos')
            .select('*')
            .eq('productor_id', user.id)
            .order('created_at', { ascending: false });

        setProductos(data || []);
    };

    const handleSubmit = async () => {
        if (!formData.nombre || !formData.precio || !formData.cantidad) {
            alert('Por favor completa todos los campos');
            return;
        }

        if (!user?.id) {
            alert('Error: Usuario no identificado');
            return;
        }

        const nuevoProducto = {
            nombre: formData.nombre,
            precio: parseFloat(formData.precio),
            cantidad: parseInt(formData.cantidad),
            descripcion: formData.descripcion || '',
            productor_id: user.id
        };

        const { error } = await supabase
            .from('productos')
            .insert([nuevoProducto]);

        if (error) {
            alert('Error al guardar: ' + error.message);
            return;
        }

        setFormData({ nombre: '', precio: '', cantidad: '', descripcion: '' });
        setShowForm(false);
        cargarProductos();
    };

    const actualizarCantidad = async (id, nuevaCantidad) => {
        if (nuevaCantidad < 0) return;

        const { error } = await supabase
            .from('productos')
            .update({ cantidad: nuevaCantidad })
            .eq('id', id);

        if (!error) {
            cargarProductos();
        }
    };

    const eliminarProducto = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id);

        if (!error) {
            cargarProductos();
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const totalProductos = productos.reduce((sum, p) => sum + p.cantidad, 0);
    const valorInventario = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 overflow-y-auto">
            {/* Header Mexicano */}
            <nav className="bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    Panel Productor 🌮
                                </h1>
                                <p className="text-white/90 text-sm">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-12">
                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-pink-100 text-sm font-medium">Total Productos</p>
                                <p className="text-4xl font-bold mt-2">{productos.length}</p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-xl">
                                <Package className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Unidades en Stock</p>
                                <p className="text-4xl font-bold mt-2">{totalProductos}</p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-xl">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Valor Inventario</p>
                                <p className="text-4xl font-bold mt-2">${valorInventario.toFixed(2)}</p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-xl">
                                <span className="text-3xl">💰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header de Productos */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        Mis Productos <span className="text-2xl">🛒</span>
                    </h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg px-4 py-2 rounded-lg transition-all"
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                </div>

                {/* Formulario de Agregar Producto */}
                {showForm && (
                    <div className="bg-white border-4 border-pink-300 rounded-2xl p-6 mb-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🌺</span>
                            <h3 className="text-2xl font-bold text-gray-800">Agregar Producto</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Nombre del Producto</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-pink-200 focus:border-pink-500 rounded-lg focus:outline-none transition-colors h-12"
                                    placeholder="Ej: Tomate, Aguacate..."
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Precio ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precio}
                                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-orange-200 focus:border-orange-500 rounded-lg focus:outline-none transition-colors h-12"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Cantidad Disponible</label>
                                <input
                                    type="number"
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-yellow-200 focus:border-yellow-500 rounded-lg focus:outline-none transition-colors h-12"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-gray-700 font-medium mb-1">Descripción del Producto</label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-pink-200 focus:border-pink-500 rounded-lg focus:outline-none transition-colors min-h-[100px] resize-y"
                                placeholder="Describe tu producto (opcional)..."
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                            >
                                ✨ Guardar Producto
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Productos */}
                {productos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-xl border-4 border-dashed border-pink-200">
                        <span className="text-6xl mb-4 block">🌵</span>
                        <p className="text-gray-500 text-xl mb-2">No tienes productos aún</p>
                        <p className="text-gray-400">¡Crea tu primer producto para empezar!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {productos.map((producto) => (
                            <div
                                key={producto.id}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow border-l-8 border-pink-500"
                            >
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl">🎨</span>
                                            <h3 className="text-2xl font-bold text-gray-800">{producto.nombre}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-gray-600 mb-2">
                                            <p className="flex items-center gap-1">
                                                <span className="font-semibold text-orange-600">Precio:</span>
                                                <span className="text-lg">${producto.precio.toFixed(2)}</span>
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <span className="font-semibold text-pink-600">Disponible:</span>
                                                <span className="text-lg">{producto.cantidad} unidades</span>
                                                {producto.cantidad === 0 && (
                                                    <span className="ml-2 px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                                                        AGOTADO
                                                    </span>
                                                )}
                                                {producto.cantidad > 0 && producto.cantidad < 10 && (
                                                    <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-600 text-sm font-bold rounded-full">
                                                        BAJO STOCK
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        {producto.descripcion && (
                                            <p className="text-gray-600 text-sm mt-2 italic">
                                                {producto.descripcion}
                                            </p>
                                        )}
                                    </div>

                                    {/* Controles */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-2">
                                            <button
                                                onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                                                disabled={producto.cantidad === 0}
                                                className="p-2 bg-white rounded-lg hover:bg-pink-100 hover:text-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="px-4 font-bold text-xl min-w-[3rem] text-center">{producto.cantidad}</span>
                                            <button
                                                onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                                                className="p-2 bg-white rounded-lg hover:bg-green-100 hover:text-green-600 transition-colors shadow-sm"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => eliminarProducto(producto.id)}
                                            className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer Decorativo */}
            <div className="mt-12 pb-8 flex justify-center gap-4 text-4xl">
                <span className="animate-bounce">🌮</span>
                <span className="animate-bounce delay-100">🎉</span>
                <span className="animate-bounce delay-200">🌺</span>
            </div>
        </div>
    );
}