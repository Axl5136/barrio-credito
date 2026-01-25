import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../services/supabase';
import { ShoppingCart, Plus, Minus, Trash2, Package, X } from 'lucide-react';

export default function TienditaDashboard() {
    const { user, signOut } = useAuth();
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [showCarrito, setShowCarrito] = useState(false);

    useEffect(() => {
        cargarProductos();

        // Supabase Realtime - escuchar cambios en productos
        const channel = supabase
            .channel('productos-cambios')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'productos'
            }, (payload) => {
                console.log('Cambio en inventario detectado:', payload);
                cargarProductos();

                // Actualizar el carrito si hay cambios
                if (payload.eventType === 'UPDATE' && payload.new) {
                    setCarrito(prevCarrito =>
                        prevCarrito.map(item =>
                            item.id === payload.new.id
                                ? { ...item, cantidad: payload.new.cantidad }
                                : item
                        ).filter(item => item.cantidad > 0) // Eliminar del carrito si se agotó
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
            cargarProductos();
        } catch (error) {
            alert('Error al procesar la compra: ' + error.message);
            cargarProductos();
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidadCarrito), 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-blue-600 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel Tiendita</h1>
                        <p className="text-blue-200 text-sm">{user?.email}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setShowCarrito(true)}
                            className="px-4 py-2 bg-white text-blue-600 rounded flex items-center gap-2 relative hover:bg-blue-50"
                        >
                            <ShoppingCart size={20} />
                            Carrito
                            {carrito.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                    {carrito.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-50"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6">Productos Disponibles</h2>

                {productos.length === 0 ? (
                    <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                        No hay productos disponibles en este momento
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productos.map((producto) => (
                            <div key={producto.id} className="bg-white p-4 rounded shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{producto.nombre}</h3>
                                        <p className="text-green-600 font-bold text-xl">${producto.precio}</p>
                                    </div>
                                    <Package className="text-gray-400" size={24} />
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                    Disponible: {producto.cantidad} unidades
                                </p>

                                {producto.cantidad > 0 ? (
                                    <button
                                        onClick={() => agregarAlCarrito(producto)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-700"
                                    >
                                        <ShoppingCart size={16} />
                                        Agregar al Carrito
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
                                    >
                                        AGOTADO
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal Carrito */}
            {showCarrito && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Mi Carrito</h2>
                            <button
                                onClick={() => setShowCarrito(false)}
                                className="hover:bg-gray-100 p-1 rounded"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {carrito.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Tu carrito está vacío</p>
                            ) : (
                                <div className="space-y-4">
                                    {carrito.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                                            <div>
                                                <h3 className="font-bold">{item.nombre}</h3>
                                                <p className="text-gray-600">${item.precio} c/u</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => modificarCantidad(item.id, item.cantidadCarrito - 1)}
                                                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold">{item.cantidadCarrito}</span>
                                                <button
                                                    onClick={() => modificarCantidad(item.id, item.cantidadCarrito + 1)}
                                                    disabled={item.cantidadCarrito >= item.cantidad}
                                                    className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => modificarCantidad(item.id, 0)}
                                                    className="p-1 bg-red-500 text-white rounded ml-2 hover:bg-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <span className="font-bold ml-4">
                                                    ${(item.precio * item.cantidadCarrito).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {carrito.length > 0 && (
                            <div className="p-4 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold">Total:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ${totalCarrito.toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={finalizarCompra}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700"
                                >
                                    Finalizar Compra
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}