import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Mail, Lock, Sparkles, AlertCircle, CheckCircle2, User, Store } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('tiendita');
    const [name, setName] = useState('');

    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setSubmitSuccess(false);

        if (isSignUp) {
            const { error } = await signUp(email, password, role, name);
            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => {
                    navigate(role === 'productor' ? '/productor' : '/tiendita');
                }, 1500);
            }
        } else {
            const { data, error } = await signIn(email, password);
            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                setSubmitSuccess(true);
                const userRole = data.user?.user_metadata?.rol;
                setTimeout(() => {
                    navigate(userRole === 'productor' ? '/productor' : '/tiendita');
                }, 1500);
            }
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden">
            {/* Panel izquierdo - Decorativo con imagen mexicana */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-400 h-full">
                <img
                    src="https://images.unsplash.com/photo-1765936103293-ec38882d1b98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwcGF0dGVybiUyMGNvbG9yZnVsfGVufDF8fHx8MTc2OTMxOTM0Mnww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Patrón mexicano colorido"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
                
                {/* Overlay con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                
                {/* Contenido decorativo */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold">Barrio Crédito</h1>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <h2 className="text-5xl font-bold leading-tight">
                            ¡Bienvenido de vuelta!
                        </h2>
                        <p className="text-xl text-white/90 max-w-md">
                            Conecta productores y tienditas. Tradición, calidad y comunidad en un solo lugar.
                        </p>
                        
                        {/* Elementos decorativos flotantes */}
                       
                    </div>
                </div>
                
                {/* Patrón decorativo adicional */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            {/* Panel derecho - Formulario de login */}
            <div className="w-full lg:w-1/2 bg-white relative overflow-hidden h-full overflow-y-auto">
                {/* Patrones decorativos de fondo */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-100 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />
                
                <div className="w-full max-w-md relative z-10 mx-auto py-6 lg:py-12 px-6 lg:px-12 min-h-full flex flex-col justify-center">
                    {/* Logo móvil */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-3 rounded-2xl">
                            <ShoppingBag className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                            Barrio Crédito
                        </h1>
                    </div>

                    {/* Encabezado del formulario */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-full mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {isSignUp ? 'Crear Cuenta' : 'Inicio de Sesión'}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {isSignUp ? '¡Únete a nosotros!' : '¡Hola de nuevo!'}
                        </h2>
                        <p className="text-gray-600">
                            {isSignUp ? 'Crea tu cuenta para comenzar' : 'Ingresa tus datos para continuar'}
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-6 w-full">
                        {/* Mensaje de éxito */}
                        {submitSuccess && (
                            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-green-800 font-medium">
                                    {isSignUp ? '¡Cuenta creada exitosamente! Redirigiendo...' : '¡Inicio de sesión exitoso! Redirigiendo...'}
                                </p>
                            </div>
                        )}

                        {/* Mensaje de error */}
                        {error && (
                            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-800 font-medium">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Campo Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-gray-700 font-medium">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    className={`w-full pl-10 pr-4 h-12 border-2 rounded-lg focus:outline-none transition-colors ${
                                        error && error.includes('email')
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:border-pink-500'
                                    }`}
                                    required
                                />
                                {error && error.includes('email') && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                                )}
                            </div>
                        </div>

                        {/* Campo Contraseña */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-gray-700 font-medium">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 h-12 border-2 rounded-lg focus:outline-none transition-colors ${
                                        error && error.includes('password')
                                            ? 'border-red-500 focus:border-red-500'
                                            : 'border-gray-200 focus:border-pink-500'
                                    }`}
                                    required
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Campo Rol (solo en signup) */}
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="role" className="text-gray-700 font-medium">
                                    Tipo de cuenta
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        id="role"
                                        value={role}
                                        onChange={(e) => {
                                            setRole(e.target.value);
                                            if (e.target.value !== 'tiendita') {
                                                setName('');
                                            }
                                        }}
                                        className="w-full pl-10 pr-4 h-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-500 transition-colors appearance-none bg-white"
                                    >
                                        <option value="productor">Productor</option>
                                        <option value="tiendita">Tiendita</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Campo Nombre (solo en signup) */}
                        {isSignUp && (
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-gray-700 font-medium">
                                    {role === 'tiendita' ? 'Nombre de la tienda' : 'Nombre del productor'}
                                </label>
                                <div className="relative">
                                    {role === 'tiendita' ? (
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    ) : (
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    )}
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={role === 'tiendita' ? 'Ej: Tienda El Barrio' : 'Ej: Bimbo'}
                                        className={`w-full pl-10 pr-4 h-12 border-2 rounded-lg focus:outline-none transition-colors ${
                                            error && error.includes('nombre')
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-gray-200 focus:border-pink-500'
                                        }`}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Recordarme y Olvidé contraseña (solo en login) */}
                        {!isSignUp && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                                    />
                                    <span className="text-sm text-gray-600">Recordarme</span>
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        {/* Botón de submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 hover:from-pink-600 hover:via-orange-600 hover:to-yellow-500 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
                                </span>
                            ) : (
                                isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    {/* Divisor */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-sm text-gray-500">o continúa con</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Botones de redes sociales */}
                    <div className="flex justify-center">
                        <button 
                            type="button"
                            className="flex items-center justify-center gap-2 h-12 px-6 border-2 border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Google</span>
                        </button>
                    </div>

                    {/* Toggle entre Login y Signup */}
                    <p className="text-center mt-8 text-gray-600">
                        {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                        <button 
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setSubmitSuccess(false);
                                setName('');
                            }}
                            className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                        >
                            {isSignUp ? 'Inicia sesión' : 'Regístrate aquí'}
                        </button>
                    </p>

                    {/* Decoración inferior */}
                    <div className="mt-8 flex justify-center gap-2">
                        <span className="text-2xl">🌵</span>
                        <span className="text-2xl">🎉</span>
                        <span className="text-2xl">🌺</span>
                    </div>
                </div>
            </div>
        </div>
    );
}