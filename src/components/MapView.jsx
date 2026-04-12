import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  html: `<div style="background:#ff6b2b;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const offerIcon = L.divIcon({
  html: `<div style="background:#2ec4b6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position, map]);
  return null;
}

function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapView({ offers }) {
  // On récupère t pour les traductions statiques et dt pour les données
  const { t, dt } = useTranslation(); 
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(t('geoNotSupported') || 'Géolocalisation non supportée.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        // Utilisation de t() pour le message d'erreur
        setError(t('posNotAccessible') || 'Position non accessible.');
        setLocating(false);
      }
    );
  }, [t]); // Ajout de t dans les dépendances

  const nearbyOffers = offers.filter(o => o.lat && o.lng);
  const defaultCenter = userPos || [7.8804, 98.3923]; 

  if (locating) {
    return (
      <div className="w-full h-[500px] rounded-3xl bg-card border border-border flex items-center justify-center gap-3 text-muted-foreground">
        <Navigation className="w-5 h-5 animate-spin text-citrus" />
        <span className="font-semibold uppercase italic text-xs">{t('locating') || 'Localisation...'}</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-border relative bg-card">
      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 backdrop-blur border border-border rounded-full px-4 py-2 text-[10px] font-bold uppercase italic text-muted-foreground flex items-center gap-2">
          <MapPin className="w-3 h-3 text-orange-500" /> {error}
        </div>
      )}

      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%', background: '#1a1a1a' }} 
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        <RecenterMap position={userPos} />

        {userPos && (
          <>
            <Marker position={userPos} icon={userIcon}>
              <Popup>📍 {t('youAreHere') || 'Vous êtes ici'}</Popup>
            </Marker>
            <Circle
              center={userPos}
              radius={10000}
              pathOptions={{ color: '#ff6b2b', fillColor: '#ff6b2b', fillOpacity: 0.05, weight: 1 }}
            />
          </>
        )}

        {nearbyOffers.map(offer => (
          <Marker 
            key={offer.id} 
            position={[offer.lat, offer.lng]} 
            icon={offerIcon}
          >
            <Popup>
              <div className="p-1" style={{ minWidth: 160 }}>
                {offer.photo && (
                  <img 
                    src={offer.photo} 
                    alt="" 
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="font-bold text-earth text-sm leading-tight mb-1">
                  {dt(offer, 'title')}
                </div>
                <div className="text-citrus font-black text-lg">{offer.discount_price} THB</div>
                <div className="text-gray-500 text-[10px] font-bold uppercase">{offer.shop_name}</div>
                
                {userPos && (
                  <div className="text-teal-600 text-[10px] font-bold mt-2 pt-2 border-t border-gray-100">
                    📍 {getDistance(userPos[0], userPos[1], offer.lat, offer.lng).toFixed(1)} km
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}