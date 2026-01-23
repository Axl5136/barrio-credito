import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Obtener sesión actual y rol desde la BD
        const fetchUserRole = async (userId) => {
            const { data, error } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Perfil no encontrado, cerrando sesión');
                await supabase.auth.signOut();
                return null;
            }

            return data?.rol ?? null;
        };

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null);

            if (session?.user) {
                const role = await fetchUserRole(session.user.id);
                setUserRole(role);
            }

            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setUser(session?.user ?? null);

                if (session?.user) {
                    const rol = await fetchUserRole(session.user.id);
                    setUserRole(rol);
                } else {
                    setUserRole(null);
                }

                setLoading(false);
            }
        );
        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, rol) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    rol: rol
                }
            }
        });
        return { data, error };
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    // Obtener perfil de usuario
    const getUserProfile = async (userId) => {
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', userId)
            .single();

        return { data, error };
    };

    return (
        <AuthContext.Provider value={{
            user,
            userRole,
            loading,
            signUp,
            signIn,
            signOut,
            getUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};