import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n'; // Importation corrigée
import MerchantDashboard from './MerchantDashboard';

export default function MerchantGate() {
  const { user, logout } = useAuth();
  const { t } = useTranslation(); // Initialisation
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="relative min-h-screen bg-earth">
        <MerchantDashboard />
        <button 
          onClick={() => logout()}
          className="fixed bottom-6 right-6 bg-red-600/20 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full z-50 shadow-lg backdrop-blur-sm transition-all border border-red-600/30"
        >
          {t('logout') || 'Déconnexion'}
        </button>
      </div>
    );
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-earth flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black uppercase italic leading-none">
            {isLogin ? (t('login') || 'Connexion') : (t('signup') || 'Inscription')}
          </h2>
          <p className="text-muted-foreground text-xs mt-2 font-bold uppercase tracking-tighter">
            {t('merchantLogin')} Phuket
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground">Email</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              required
              className="w-full bg-muted border border-border p-4 rounded-2xl focus:border-citrus/50 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground">
              {t('shopPhone').includes('Phone') ? 'Mot de passe' : 'รหัสผ่าน'}
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full bg-muted border border-border p-4 rounded-2xl focus:border-citrus/50 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-citrus text-earth py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-citrus/10 hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
          >
            {loading ? t('saving') : (isLogin ? (t('dashboard') || 'Entrer') : (t('getStarted') || 'Créer'))}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-8 text-[11px] text-muted-foreground hover:text-citrus font-black uppercase tracking-wider transition-colors"
        >
          {isLogin ? (t('noAccount') || "Nouveau ici ?") : (t('hasAccount') || "Déjà inscrit ?")}
        </button>
      </div>
    </div>
  );
}