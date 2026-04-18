import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n';
import MerchantDashboard from './MerchantDashboard';

export default function MerchantGate() {
  const { user, logout } = useAuth();
  const { t, lang } = useTranslation(); 
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [step, setStep] = useState('email'); 
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Sécurité supplémentaire pour récupérer la langue
  const activeLang = lang || localStorage.getItem('language') || 'fr';

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

  // GESTION CONNEXION (OTP) OU INSCRIPTION (PASSWORD)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // MODE CONNEXION : On envoie le code OTP avec la langue
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          shouldCreateUser: false,
          data: { lang: activeLang } 
        },
      });
      if (error) alert(error.message);
      else {
        setStep('otp');
        alert(t('otpSent'));
      }
    } else {
      // MODE INSCRIPTION : Création avec mot de passe et langue
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { lang: activeLang } 
        }
      });
      if (error) alert(error.message);
      else alert(t('signupSuccess') || "Inscription réussie !");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'magiclink',
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert(t('enterEmail') || "Veuillez saisir votre email.");
      return;
    }
    
    setLoading(true);

    /**
     * ASTUCE : On tente de mettre à jour l'utilisateur avec la langue actuelle 
     * juste avant de lancer le reset. Si l'utilisateur existe, ses meta-data 
     * seront prêtes pour le template e-mail.
     */
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/merchant-gate?lang=${activeLang}`,
    });

    if (resetError) alert(resetError.message);
    else alert(t('resetSent') || "Lien de réinitialisation envoyé !");
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-earth flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl">
        <Link
          to="/"
          className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground hover:text-citrus transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {t('backToHome')}
        </Link>
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black uppercase italic leading-none text-foreground">
            {isLogin ? t('login') : t('signup')}
          </h2>
          <p className="text-muted-foreground text-[10px] mt-2 font-bold uppercase tracking-tighter">
            {step === 'email' ? t('merchantLogin') : t('verifyEmail')}
          </p>
        </div>
        
        {step === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground italic">
                Email
              </label>
              <input 
                type="email" 
                value={email}
                required
                className="w-full bg-muted border border-border p-4 rounded-2xl focus:border-citrus/50 outline-none transition-all text-foreground"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground italic">
                  {t('password')}
                </label>
                <input 
                  type="password" 
                  value={password}
                  required
                  className="w-full bg-muted border border-border p-4 rounded-2xl focus:border-citrus/50 outline-none transition-all text-foreground"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {isLogin && ( // Changement ici : on affiche le bouton reset aussi en mode login si besoin
              <button 
                type="button"
                onClick={handleResetPassword}
                className="text-[9px] font-black uppercase italic text-muted-foreground hover:text-citrus transition-all ml-4"
              >
                {t('forgotPassword')}
              </button>
            )}

            <button 
              disabled={loading}
              className="w-full bg-citrus text-earth py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-citrus/10 hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
            >
              {loading ? t('loading') : (isLogin ? t('sendCode') : t('signup'))}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground italic">
                {t('enterCode')}
              </label>
              <input 
                type="text" 
                placeholder="123456" 
                value={otp}
                required
                className="w-full bg-muted border border-border p-4 rounded-2xl text-center text-2xl font-black tracking-[1em] focus:border-citrus/50 outline-none transition-all text-foreground"
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-citrus text-earth py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-citrus/10 hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
            >
              {loading ? t('loading') : t('verify')}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-[10px] font-black uppercase opacity-50 hover:text-citrus transition-all italic"
            >
              {t('changeEmail')}
            </button>
          </form>
        )}

        {step === 'email' && (
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-8 text-[11px] text-muted-foreground hover:text-citrus font-black uppercase tracking-wider transition-colors italic"
          >
            {isLogin ? t('noAccount') : t('hasAccount')}
          </button>
        )}
      </div>
    </div>
  );
}