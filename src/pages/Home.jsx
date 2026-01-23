import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Mi App</h1>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        ¡Bienvenido!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Has iniciado sesión correctamente con: <strong>{user?.email}</strong>
                    </p>
                    <div className="bg-gray-50 p-4 rounded">
                        <p className="text-sm text-gray-500">ID: {user?.id}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}