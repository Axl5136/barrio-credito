import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './services/supabase';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async (user) => {
        if (!user) return null;

        if (user.user_metadata?.rol) {
            return user.user_metadata.rol;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', user.id)
            .single();

        if (error) return null;
        return data?.rol ?? null;
    };

    const applySession = async (session) => {
        if (!session?.user) {
            setUser(null);
            setUserRole(null);
            setLoading(false);
            return;
        }

        setUser(session.user);
        const role = await fetchUserRole(session.user);
        setUserRole(role);
        setLoading(false);
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) await applySession(session);
        };

        init();

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange(async (_, session) => {
                if (!mounted) return;
                setLoading(true);
                await applySession(session);
            });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);


    const signUp = async (email, password, rol, nombreNegocio) => {
        // 1. Crear el usuario en Auth (Login)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    rol: rol, 
                    nombre_negocio: nombreNegocio || 'Nuevo Negocio'
                }

            }
        });

        if (error) return { error }; // Si falla el correo, regresamos el error

        // 2. Crear el Perfil en la Base de Datos (Manual)
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    rol: rol, // Login.jsx ya lo manda en minúsculas, así que pasará bien
                    nombre_negocio: nombreNegocio || 'Nuevo Negocio'
                });

            // 3. Crear Wallet vacía (Solo si es tiendita)
            if (!profileError && rol === 'tiendita') {
                 await supabase.from('wallets').insert({
                    user_id: data.user.id,
                    limite_credito: 0,
                    saldo_utilizado: 0
                 });
            }
            
            // Si hubo error creando el perfil, lo imprimimos en consola
            if (profileError) console.error("Error perfil:", profileError);
        }
        
        return { data, error: null };
    };

    const signIn = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const signOut = async () => {
        setUser(null);
        setUserRole(null);
        await supabase.auth.signOut();
    };

    const getUserProfile = (userId) =>
        supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

    return (
        <AuthContext.Provider
            value={{
                user,
                userRole,
                loading,
                signUp,
                signIn,
                signOut,
                getUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
