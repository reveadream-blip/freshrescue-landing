import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useTranslation } from '../lib/i18n';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
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

  useEffect(() => {
    // Utilisation de lat/lng pour correspondre à la fonction RPC
    if ("geolocation" in navigator && offer.lat && offer.lng) {
      navigator.geolocation.getCurrentPosition((position) => {
        const distance = getDistance(
          position.coords.latitude,
          position.coords.longitude,
          offer.lat,
          offer.lng
        );
        if (distance <= 10) {
          console.log(`Offre à proximité : ${distance.toFixed(1)} km`);
        }
      });
    }
  }, [offer]);

  const discount = offer.original_price
    ? Math.round(((offer.original_price - offer.discount_price) / offer.original_price) * 100)
    : null;

  // Logique de traduction multilingue
  const title = lang === 'fr' && offer.title_fr ? offer.title_fr
    : lang === 'th' && offer.title_th ? offer.title_th
    : offer.title;

  const handleDirections = (e) => {
    e.stopPropagation();
    const address = offer.shop_address;
    if (address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    } else {
      alert("Adresse non renseignée");
    }
  };

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-citrus/40 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-56 overflow-hidden bg-muted">
        {offer.image_url || offer.photo ? (
          <img
            src={offer.image_url || offer.photo}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-4xl">🥗</div>
        )}

        {discount && (
          <div className="absolute top-3 left-3 bg-citrus text-earth text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
            -{discount}%
          </div>
        )}

        <div className={`absolute inset-0 bg-citrus/80 flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleDirections}
            className="flex items-center gap-2 bg-earth text-foreground px-5 py-3 rounded-full font-bold text-sm shadow-xl transform transition-transform hover:scale-105 active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            {t('getDirections')}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-base text-foreground line-clamp-1 italic uppercase tracking-tight">{title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-citrus flex-shrink-0" />
            <p className="text-xs text-muted-foreground font-medium">{offer.shop_name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground leading-none">{offer.discount_price}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">THB</span>
            {offer.original_price && (
              <span className="text-sm text-muted-foreground/40 line-through decoration-citrus/30">{offer.original_price}</span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          {/* Vérifie si ta colonne est 'collect_before' ou 'collect_deadline' */}
          <CountdownTimer deadline={offer.collect_before || offer.collect_deadline} />
        </div>
      </div>
    </div>
  );
}