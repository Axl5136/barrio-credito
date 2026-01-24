import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../services/supabase';
import { Plus, Minus, Trash2 } from 'lucide-react';

export default function ProductorDashboard() {
    const { user, signOut } = useAuth();
    const [productos, setProductos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        cantidad: ''
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
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

        const nuevoProducto = {
            nombre: formData.nombre,
            precio: parseFloat(formData.precio),
            cantidad: parseInt(formData.cantidad),
            productor_id: user.id
        };

        const { error } = await supabase
            .from('productos')
            .insert([nuevoProducto]);

        if (error) {
            alert('Error al guardar: ' + error.message);
            return;
        }

        setFormData({ nombre: '', precio: '', cantidad: '' });
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

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-green-600 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel Productor</h1>
                        <p className="text-green-200 text-sm">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-white text-green-600 rounded hover:bg-green-50"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Mis Productos</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700"
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white p-6 rounded shadow mb-6">
                        <h3 className="text-lg font-bold mb-4">Agregar Producto</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Ej: Tomate"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Precio ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.precio}
                                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cantidad Disponible</label>
                                <input
                                    type="number"
                                    value={formData.cantidad}
                                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {productos.length === 0 ? (
                    <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                        No tienes productos aún. ¡Crea tu primer producto!
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {productos.map((producto) => (
                            <div key={producto.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{producto.nombre}</h3>
                                    <p className="text-gray-600">Precio: ${producto.precio}</p>
                                    <p className="text-gray-600">
                                        Disponible: {producto.cantidad} unidades
                                        {producto.cantidad === 0 && (
                                            <span className="ml-2 text-red-600 font-semibold">AGOTADO</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                                        disabled={producto.cantidad === 0}
                                        className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="px-3 font-semibold">{producto.cantidad}</span>
                                    <button
                                        onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                                        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => eliminarProducto(producto.id)}
                                        className="p-2 bg-red-500 text-white rounded ml-4 hover:bg-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}