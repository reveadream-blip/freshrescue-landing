import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import { useEffect } from 'react';
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
import Instructions from './pages/Instructions';
import InstallRedirect from './pages/InstallRedirect';

// --- NOUVEAUX IMPORTS POUR L'ADMIN ---
import { AdminRoute } from '@/components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard'; 
import { ADMIN_EMAILS } from '@/lib/adminConfig'; // Import de ta liste d'emails

const AuthenticatedApp = () => {
  const { user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- LOGIQUE DE REDIRECTION AUTOMATIQUE ---
  useEffect(() => {
    // 1. Gestion du lien de récupération de mot de passe
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      navigate('/update-password');
      return;
    }

    // 2. Redirection automatique de l'admin après connexion
    if (isAuthenticated && user) {
      const isAdmin = ADMIN_EMAILS.some(email => email.toLowerCase() === user.email.toLowerCase());
      
      // Si c'est l'admin et qu'il est sur une page générique, on l'envoie sur le dashboard
      const isOnGenericPage = ['/', '/merchant', '/explore'].includes(location.pathname);
      
      if (isAdmin && isOnGenericPage) {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  // Liste des routes publiques
  const isPublicAuthRoute = [
    '/forgot-password', 
    '/update-password', 
    '/merchant', 
    '/', 
    '/explore',
    '/instructions',
    '/install'
  ].includes(location.pathname) || location.pathname.startsWith('/admin');

  if ((isLoadingPublicSettings || isLoadingAuth) && !isPublicAuthRoute) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-earth">
        <div className="w-8 h-8 border-4 border-border border-t-citrus rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError && authError.type === 'user_not_registered' && !isPublicAuthRoute) {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/install" element={<InstallRedirect />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/merchant" element={<MerchantGate />} />
      <Route path="/instructions" element={<Instructions />} /> 
      
      {/* --- ROUTE ADMIN PROTÉGÉE --- */}
      <Route 
        path="/admin/*" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />

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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Seo />
          <AuthenticatedApp />
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;