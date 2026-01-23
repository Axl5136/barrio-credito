import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TienditaDashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-blue-600 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel de Tiendita</h1>
                        <p className="text-blue-200 text-sm">Compra productos</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Bienvenido, Tiendita
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Email: <strong>{user?.email}</strong>
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Rol:</strong> Tiendita - Puedes explorar y comprar productos
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Catálogo</h3>
                        <p className="text-gray-600 text-sm">Explora productos disponibles</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Mis Pedidos</h3>
                        <p className="text-gray-600 text-sm">Revisa tus compras</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Carrito</h3>
                        <p className="text-gray-600 text-sm">Productos seleccionados</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Linea de Credito</h3>
                        <p className="text-gray-600 text-sm">Revisa tu linea de credito</p>
                    </div>
                </div>
            </main>
        </div>
    );
}