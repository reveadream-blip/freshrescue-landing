import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Supabase utilise la session du lien cliqué pour savoir quel utilisateur mettre à jour
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
    } else {
      setDone(true);
      // Redirection vers la page de connexion après 3 secondes
      setTimeout(() => navigate('/merchant'), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-earth flex items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl">
        <h2 className="text-3xl font-black uppercase italic mb-6 leading-none tracking-tighter">
          Nouveau <br/> Mot de passe
        </h2>

        {done ? (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="w-16 h-16 text-citrus mx-auto" />
            <p className="font-black text-citrus text-sm uppercase italic">Mis à jour avec succès !</p>
            <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest">Redirection en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase ml-4 text-muted-foreground italic">Sécurité</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                <input 
                  required
                  type="password" 
                  placeholder="Tapez votre nouveau mot de passe"
                  className="w-full bg-muted border border-border p-4 pl-12 rounded-2xl outline-none focus:border-citrus/50 text-foreground transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              disabled={loading || password.length < 6}
              className="w-full bg-citrus text-earth py-5 rounded-2xl font-black uppercase italic shadow-lg shadow-citrus/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : "Enregistrer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}