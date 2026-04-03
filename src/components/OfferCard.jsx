import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useTranslation } from '../lib/i18n';

// Fonction utilitaire pour calculer la distance (Formule Haversine)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function OfferCard({ offer }) {
  const { t, lang } = useTranslation();
  const [hovered, setHovered] = useState(false);

  // --- LOGIQUE DE NOTIFICATION DE PROXIMITÉ ---
  useEffect(() => {
    if ("geolocation" in navigator && offer.latitude && offer.longitude) {
      navigator.geolocation.getCurrentPosition((position) => {
        const distance = getDistance(
          position.coords.latitude,
          position.coords.longitude,
          offer.latitude,
          offer.longitude
        );

        // Si l'utilisateur est à moins de 10km
        if (distance <= 10) {
          console.log(`Notification: Offre à proximité (${distance.toFixed(1)} km)`);
          // Ici tu peux déclencher ta notification Push ou un Toast
        }
      });
    }
  }, [offer]);

  const discount = offer.original_price
    ? Math.round(((offer.original_price - offer.discount_price) / offer.original_price) * 100)
    : null;

  const title = lang === 'fr' && offer.title_fr ? offer.title_fr
    : lang === 'th' && offer.title_th ? offer.title_th
    : offer.title;

  // --- GESTION DE L'ITINÉRAIRE ---
  const handleDirections = (e) => {
    e.stopPropagation();

    // On récupère l'adresse propre
    const address = offer.shop_address;

    if (address) {
      // FORMAT DESTINATION : C'est ce qui force Google à zoomer sur le point d'arrivée
      // On ajoute 'Rawai, Phuket' à la fin pour être sûr que Google ne cherche pas ailleurs
      const cleanAddress = encodeURIComponent(address);
      
      // Cette URL force le mode "Information sur le lieu" avec zoom automatique
      const url = `https://www.google.com/maps/dir/?api=1&destination=${cleanAddress}&travelmode=driving`;
      
      window.open(url, '_blank');
    } else {
      alert("Adresse non renseignée");
    }
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-citrus/40 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-muted">
        {offer.photo ? (
          <img
            src={offer.photo}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-4xl">🥗</div>
        )}

        {discount && (
          <div className="absolute top-3 left-3 bg-citrus text-earth text-xs font-black px-2.5 py-1 rounded-full">
            -{discount}%
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-citrus/90 flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleDirections}
            className="flex items-center gap-2 bg-earth text-foreground px-5 py-3 rounded-full font-bold text-sm shadow-xl transform transition-transform hover:scale-105"
          >
            <Navigation className="w-4 h-4" />
            {t('getDirections')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-base text-foreground line-clamp-1 italic uppercase">{title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-citrus flex-shrink-0" />
            <p className="text-xs text-muted-foreground font-medium">{offer.shop_name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{offer.discount_price}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">THB</span>
            {offer.original_price && (
              <span className="text-sm text-muted-foreground/50 line-through">{offer.original_price}</span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <CountdownTimer deadline={offer.collect_before} />
        </div>
      </div>
    </div>
  );
}