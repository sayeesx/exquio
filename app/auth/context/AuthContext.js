import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { secureLog } from '../../../utils/secureLogging';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Use secureLog instead of console.log
      secureLog('Auth session initialized:', { session });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Use secureLog for auth state changes
      secureLog('Auth state changed:', {
        event: _event,
        inAuthGroup: !!session,
        hasUser: !!session?.user,
        // Only log necessary user info
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          hasPhone: !!session.user.phone,
          isVerified: !!session.user.email_confirmed_at
        } : null
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    login,
    logout,
    isAuthenticated: !!user  // Removed comma since this is the last property
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
