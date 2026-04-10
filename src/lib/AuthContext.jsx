import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Ton nouveau client Supabase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Vérifier la session au démarrage
    checkUser();

    // 2. Ecouter les changements de connexion (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setIsLoadingAuth(false);

      // Gestion du lien de récupération de mot de passe
      if (event === 'PASSWORD_RECOVERY') {
        // Redirection vers ta page de nouveau mot de passe
        window.location.href = '/update-password';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
    } catch (error) {
      console.error('Erreur lors de la récupération de session:', error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Pour garder la compatibilité avec tes anciens boutons
  const navigateToLogin = () => {
    window.location.href = '/login'; // Ou ta route de login
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentUser: user, // On ajoute currentUser pour MerchantSetup
      isAuthenticated, 
      isLoadingAuth,
      logout,
      navigateToLogin,
      checkAppState: checkUser // On garde le nom pour éviter les bugs ailleurs
    }}>
      {!isLoadingAuth && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};