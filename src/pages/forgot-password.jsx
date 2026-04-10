import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/i18n';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setMessage(t('emailSent') || "L'email de récupération a été envoyé !");
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth flex items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl">
        
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase opacity-50 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back') || "Retour"}
        </button>

        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2 leading-tight">
          {t('forgotPasswordTitle') || 'Oubli ?'}
        </h1>
        <p className="text-[11px] opacity-60 mb-8 font-bold uppercase tracking-tight">
          {t('forgotPasswordSubtitle') || 'Entrez votre email pour recevoir un lien.'}
        </p>

        {message ? (
          <div className="bg-citrus/10 border border-citrus p-6 rounded-2xl text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-citrus mx-auto" />
            <p className="text-sm font-black uppercase text-citrus italic leading-tight">{message}</p>
            <p className="text-[10px] opacity-60 uppercase font-bold">
              {t('checkSpam') || 'Pensez à vérifier vos spams !'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground italic">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-4 focus:border-citrus/50 outline-none transition-all text-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-[10px] font-black ml-2 italic uppercase">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-citrus text-earth py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-citrus/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 mt-4 text-lg"
            >
              {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : (t('sendLink') || "Envoyer le lien")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}