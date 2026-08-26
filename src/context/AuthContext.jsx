import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fetchProfile } from "../services/authService";

export const AuthContext = createContext(undefined);

/**
 * Mantiene la sesión de Supabase y el perfil (con el rol) en memoria,
 * y se suscribe a cambios de sesión para que login/logout se reflejen
 * en toda la app sin recargar la página.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      if (data.session) {
        const userProfile = await fetchProfile(data.session.user.id).catch(() => null);
        if (isMounted) setProfile(userProfile);
      }
      setIsLoading(false);
    }

    loadInitialSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const userProfile = await fetchProfile(newSession.user.id).catch(() => null);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    isAuthenticated: Boolean(session),
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
