import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Lien court pour les QR : /install → même comportement que /?install=1 (PWA).
 * Évite les URLs longues avec query string dans le QR.
 */
export default function InstallRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/?install=1', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-earth text-muted-foreground">
      <p className="text-sm font-medium">FreshRescue…</p>
    </div>
  );
}
