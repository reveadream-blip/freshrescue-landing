import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { useEffect } from 'react'; // Ajout de useEffect
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from './pages/Landing';
import Explore from './pages/Explore';
import MerchantGate from './pages/MerchantGate';
import MerchantPost from './pages/MerchantPost';
import MerchantSetup from './pages/MerchantSetup';
import Terms from './pages/Terms';
import ForgotPassword from './pages/forgot-password';
import UpdatePassword from './pages/update-password';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Hook pour la redirection forcée

  // --- NOUVEAU : GESTION DU LIEN DE RÉCUPÉRATION ---
  useEffect(() => {
    // Supabase met les infos après le # (hash) dans l'URL
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // Si on détecte un jeton de récupération, on envoie vers la page de mise à jour
      navigate('/update-password');
    }
  }, [navigate]);

  // Liste des routes qui ne doivent JAMAIS être bloquées
  const isPublicAuthRoute = [
    '/forgot-password', 
    '/update-password', 
    '/merchant', 
    '/', 
    '/explore'
  ].includes(location.pathname);

  // 1. Affichage du loader (sauf si route publique)
  if ((isLoadingPublicSettings || isLoadingAuth) && !isPublicAuthRoute) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-earth">
        <div className="w-8 h-8 border-4 border-border border-t-citrus rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Gestion des erreurs critiques
  if (authError && authError.type === 'user_not_registered' && !isPublicAuthRoute) {
    return <UserNotRegisteredError />;
  }

  // 3. Rendu des routes
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/merchant" element={<MerchantGate />} />
      
      <Route 
        path="/merchant/post" 
        element={!authError ? <MerchantPost /> : <MerchantGate />} 
      />
      <Route 
        path="/merchant/edit/:id" 
        element={!authError ? <MerchantPost /> : <MerchantGate />} 
      />
      <Route 
        path="/merchant/setup" 
        element={!authError ? <MerchantSetup /> : <MerchantGate />} 
      />
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      {/* Ajout des Future Flags ici pour supprimer les warnings v7 */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AuthenticatedApp />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;