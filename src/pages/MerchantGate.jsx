import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n'; 
import MerchantDashboard from './MerchantDashboard';

export default function MerchantGate() {
  const { user, logout } = useAuth();
  const { t } = useTranslation(); 
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  // step: 'email' ou 'otp'
  const [step, setStep] = useState('email'); 
  const [otp, setOtp] = useState('');
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

  // ENVOYER LE CODE OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Empêche la création automatique si tu veux que seuls les inscrits se connectent
        shouldCreateUser: !isLogin, 
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setStep('otp');
      alert(t('otpSent') || "Un code de vérification a été envoyé par email.");
    }
    setLoading(false);
  };

  // VÉRIFIER LE CODE OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'magiclink',
    });

    if (error) {
      alert(error.message);
    } else {
      // Le user sera automatiquement mis à jour via AuthContext
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-earth flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black uppercase italic leading-none text-foreground">
            {isLogin ? (t('login') || 'Connexion') : (t('signup') || 'Inscription')}
          </h2>
          <p className="text-muted-foreground text-xs mt-2 font-bold uppercase tracking-tighter">
            {step === 'email' ? (t('merchantLogin') || 'Merchant Access') : (t('verifyEmail') || 'Vérification')}
          </p>
        </div>
        
        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground italic">
                Email
              </label>
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                required
                className="w-full bg-muted border border-border p-4 rounded-2xl focus:border-citrus/50 outline-none transition-all text-foreground"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-citrus text-earth py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-citrus/10 hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
            >
              {loading ? (t('loading') || 'Envoi...') : (t('sendCode') || 'Recevoir mon code')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground italic">
                {t('enterCode') || 'Code reçu par mail'}
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
              {loading ? (t('loading') || 'Vérification...') : (t('verify') || 'Vérifier')}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-[10px] font-black uppercase opacity-50 hover:text-citrus transition-all italic"
            >
              {t('changeEmail') || "Modifier l'email"}
            </button>
          </form>
        )}

        {step === 'email' && (
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-8 text-[11px] text-muted-foreground hover:text-citrus font-black uppercase tracking-wider transition-colors italic"
          >
            {isLogin 
              ? (t('noAccount') || "Pas encore inscrit !") 
              : (t('hasAccount') || "Déjà inscrit !")
            }
          </button>
        )}
      </div>
    </div>
  );
}