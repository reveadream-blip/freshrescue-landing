import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ADMIN_EMAILS } from '@/lib/adminConfig';
import { Navigation } from 'lucide-react'; // Utilisation de ton icône existante pour le loader

export const AdminRoute = ({ children }) => {
  const { user, isLoadingAuth } = useAuth();

  // 1. Affichage d'un loader pendant la vérification de session
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <Navigation className="w-8 h-8 animate-spin text-citrus mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">
          Vérification des accès...
        </span>
      </div>
    );
  }

  // 2. Vérification de l'admin (avec sécurité sur les majuscules)
  const isAdmin = user && ADMIN_EMAILS.some(
    email => email.toLowerCase() === user.email.toLowerCase()
  );

  // 3. Redirection si l'utilisateur n'est pas dans la liste blanche
  if (!isAdmin) {
    console.warn(`Accès refusé pour : ${user?.email || 'Utilisateur non connecté'}`);
    return <Navigate to="/" replace />;
  }

  // 4. Si tout est OK, on affiche le tableau de bord
  return children;
};