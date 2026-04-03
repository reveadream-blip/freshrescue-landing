import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useTranslation } from '../lib/i18n';

export default function OfferCard({ offer }) {
  const { t, lang } = useTranslation();
  const [hovered, setHovered] = useState(false);

  const discount = offer.original_price
    ? Math.round(((offer.original_price - offer.discount_price) / offer.original_price) * 100)
    : null;

  const title = lang === 'fr' && offer.title_fr ? offer.title_fr
    : lang === 'th' && offer.title_th ? offer.title_th
    : offer.title;

  const handleDirections = (e) => {
    e.stopPropagation();
    // On utilise la colonne shop_address qui est synchronisée
    const address = offer.shop_address;
    if (address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Phuket")}`;
      window.open(url, '_blank');
    } else {
      alert("Adresse non renseignée. Veuillez la configurer dans votre profil marchand.");
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
            {/* On affiche le nom de la boutique et l'adresse si dispo */}
            <p className="text-xs text-muted-foreground font-medium">
              {offer.shop_name} • <span className="italic">{offer.shop_address || "Phuket"}</span>
            </p>
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
          <CountdownTimer deadline={offer.collect_before || offer.collect_deadline} />
        </div>
      </div>
    </div>
  );
}