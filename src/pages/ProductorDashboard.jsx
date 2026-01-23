import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function ProductorDashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-green-600 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">Panel de Productor</h1>
                        <p className="text-green-200 text-sm">Gestiona tus productos</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-green-50 transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Bienvenido, Productor
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Email: <strong>{user?.email}</strong>
                    </p>
                    <div className="bg-green-50 border-l-4 border-green-600 p-4">
                        <p className="text-sm text-green-800">
                            <strong>Rol:</strong> Productor - Puedes gestionar tus productos y pedidos
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Mis Productos</h3>
                        <p className="text-gray-600 text-sm">Administra tu catálogo de productos</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-lg mb-2">Pedidos</h3>
                        <p className="text-gray-600 text-sm">Revisa los pedidos recibidos</p>
                    </div>
                </div>
            </main>
        </div>
    );
}