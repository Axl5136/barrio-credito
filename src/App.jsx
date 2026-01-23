import { AuthProvider } from './AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './pages/login';
import ProductorDashboard from './pages/ProductorDashboard';
import TienditaDashboard from './pages/TienditaDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'productor' ? '/productor' : '/tiendita'} />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (user) {
    return <Navigate to={userRole === 'productor' ? '/productor' : '/tiendita'} />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          <Route
            path="/productor"
            element={
              <ProtectedRoute allowedRoles={['productor']}>
                <ProductorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tiendita"
            element={
              <ProtectedRoute allowedRoles={['tiendita']}>
                <TienditaDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;