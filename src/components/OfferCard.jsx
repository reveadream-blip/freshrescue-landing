import { useState, useEffect } from 'react';
import { MapPin, Navigation, Utensils, Snowflake, Calendar, AlignLeft } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useTranslation } from '../lib/i18n';

export default function OfferCard({ offer }) {
  const { t, dt, lang } = useTranslation();
  const [hovered, setHovered] = useState(false);

  const discount = offer.original_price
    ? Math.round(((offer.original_price - offer.discount_price) / offer.original_price) * 100)
    : null;

  const title = dt(offer, 'title');
const description = dt(offer, 'description');
  
  // LOGIQUE DE TRADUCTION MANUELLE POUR LE MODE DE CONSO
  let consumptionMode = dt(offer, 'consumption_mode');
  
  if (lang === 'fr') {
    if (consumptionMode?.toLowerCase().includes('site')) consumptionMode = "Sur place";
    else if (consumptionMode?.toLowerCase().includes('takeaway')) consumptionMode = "À emporter";
    else if (consumptionMode?.toLowerCase().includes('both')) consumptionMode = "Les deux";
  } else if (lang === 'ru') {
    if (consumptionMode?.toLowerCase().includes('site')) consumptionMode = "На месте";
    else if (consumptionMode?.toLowerCase().includes('takeaway')) consumptionMode = "С собой";
    else if (consumptionMode?.toLowerCase().includes('both')) consumptionMode = "Оба варианта";
  }

    // On récupère d'abord la valeur brute de la DB pour checker
  const rawNotice = offer[`bag_notice_${lang}`] || offer.bag_notice_fr;
  let bagNotice = dt(offer, 'bag_notice') || rawNotice;
  
  // SÉCURITÉ CRITIQUE : Si needs_cool_bag est vrai, on NE PEUT PAS avoir un texte vide
  if (offer.needs_cool_bag) {
    if (!bagNotice || bagNotice.toString().trim() === "" || bagNotice === "undefined") {
      const defaults = {
        fr: "Congelable",
        ru: "замораживаемый",
        en: "Freezable",
        th: "แช่แข็งได้"
      };
      bagNotice = defaults[lang] || defaults.en;
    }
  }

  const handleDirections = (e) => {
    e.stopPropagation();
    const address = offer.shop_address;
    if (address) {
      // Correction syntaxe URL
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ", Phuket")}`;
      window.open(url, '_blank');
    } else {
      alert(lang === 'ru' ? "Адрес не указан." : "Adresse non renseignée.");
    }
  };

  // Debug pour voir ce qui bloque dans la console
  console.log(`Offre: ${offer.title} | needs_cool_bag: ${offer.needs_cool_bag} | bagNotice: ${bagNotice}`);

  return (
    <div
      className="group relative rounded-3xl overflow-hidden bg-card border border-border hover:border-citrus/40 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl flex flex-col h-auto" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* IMAGE */}
      <div className="relative h-40 flex-shrink-0 overflow-hidden bg-muted">
        {offer.image_url || offer.photo ? (
          <img
            src={offer.image_url || offer.photo}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-4xl">🥗</div>
        )}

        {discount && (
          <div className="absolute top-3 left-3 bg-citrus text-earth text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg italic">
            -{discount}%
          </div>
        )}

        <div className={`absolute inset-0 bg-citrus/90 flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleDirections}
            className="flex items-center gap-2 bg-earth text-foreground px-6 py-3 rounded-full font-black text-xs shadow-2xl transform transition-transform hover:scale-105"
          >
            <Navigation className="w-4 h-4 text-citrus" />
            {t('getDirections')}
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div className="p-4 flex flex-col space-y-3">
        <div>
          <h3 className="font-black text-sm text-foreground italic uppercase tracking-tight leading-tight mb-1">
            {title}
          </h3>
          
          {description && (
            <div className="flex items-start gap-1.5 mb-2">
              <AlignLeft className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-2">
                {description}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-2">
            {consumptionMode && (
              <div className="flex items-center gap-1 text-citrus bg-citrus/10 px-2 py-0.5 rounded-lg border border-citrus/20">
                <Utensils className="w-2.5 h-2.5" />
                <span className="text-[8px] font-black uppercase">{consumptionMode}</span>
              </div>
            )}
            
            {/* AFFICHAGE DU FLOCON - Forcé si le booléen est vrai */}
            {offer.needs_cool_bag === true && (
              <div className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-lg border border-blue-400/20">
                <Snowflake className="w-2.5 h-2.5" />
                <span className="text-[8px] font-black uppercase">{bagNotice}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-citrus flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground font-bold truncate">
              {offer.shop_name} • <span className="font-medium opacity-70">{offer.shop_address || "Phuket"}</span>
            </p>
          </div>
        </div>

        {offer.expiry_date && (
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60 bg-muted/30 p-1.5 rounded-md self-start">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">DLC: {new Date(offer.expiry_date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'fr-FR')}</span>
          </div>
        )}

        <div className="pt-3 border-t border-border/40 flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {offer.original_price && (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-red-600 line-through decoration-2">
                    {offer.original_price}
                  </span>
                  <span className="text-[8px] font-bold text-red-600 uppercase">THB</span>
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground tracking-tighter">{offer.discount_price}</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">THB</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
                <CountdownTimer deadline={offer.collect_before || offer.collect_deadline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}