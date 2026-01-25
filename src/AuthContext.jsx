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
            .from('perfiles')
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

    const signUp = (email, password, rol) =>
        supabase.auth.signUp({
            email,
            password,
            options: { data: { rol } }
        });

    const signIn = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const signOut = async () => {
        setUser(null);
        setUserRole(null);
        await supabase.auth.signOut();
    };

    const getUserProfile = (userId) =>
        supabase
            .from('perfiles')
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
