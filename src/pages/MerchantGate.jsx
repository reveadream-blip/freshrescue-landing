import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import MerchantDashboard from './MerchantDashboard';

export default function MerchantGate() {
  const { user, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // Permet de basculer
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Si connecté, on affiche le Dashboard
  if (user) {
    return (
      <div className="relative min-h-screen">
        <MerchantDashboard />
        <button 
          onClick={() => logout()}
          className="fixed bottom-4 right-4 bg-red-600 text-white text-xs px-4 py-2 rounded-full z-50 shadow-lg"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  // Fonction unique pour Login ou Signup (la logique d'origine)
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else if (!isLogin) {
      alert("Inscription réussie !");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-earth flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-[2rem] shadow-2xl">
        <h2 className="text-3xl font-black mb-6 uppercase italic">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="Email" required
            className="w-full bg-muted border border-border p-4 rounded-xl"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Mot de passe" required
            className="w-full bg-muted border border-border p-4 rounded-xl"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-citrus text-earth py-4 rounded-xl font-bold uppercase">
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer mon compte')}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-muted-foreground hover:text-citrus font-bold transition-colors"
        >
          {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}