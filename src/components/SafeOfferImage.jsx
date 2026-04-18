import { useState, useMemo, useEffect } from 'react';
import { getOfferPhotoUrlChain } from '../lib/offerPhoto';

/**
 * Affiche la photo d’une offre avec chaîne de secours si l’URL est 404 / bloquée.
 */
export default function SafeOfferImage({ offer, className = '', alt = '' }) {
  const chain = useMemo(() => getOfferPhotoUrlChain(offer), [offer]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
  }, [offer?.id]);

  if (step >= chain.length) {
    return (
      <div
        className={`${className} bg-muted flex items-center justify-center text-2xl`}
        role="img"
        aria-hidden
      >
        🥗
      </div>
    );
  }

  return (
    <img
      src={chain[step]}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => setStep((s) => s + 1)}
    />
  );
}
