import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

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
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapView({ offers }) {
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée.');
      setLocating(false);
      return;
    }
    
    // On récupère la position réelle sans fallback forcé
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      (err) => {
        console.error("Erreur Geo:", err);
        setError("Position introuvable. Vérifiez vos réglages GPS.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // --- LOGIQUE DE DETECTION DES COORDONNÉES ---
  const nearbyOffers = offers.filter(o => {
    // On essaie de trouver la latitude/longitude peu importe le nom de la colonne
    const lat = o.lat || o.latitude;
    const lng = o.lng || o.longitude;
    
    if (!lat || !lng) return false;
    if (!userPos) return true; // On affiche tout si on n'a pas encore le GPS utilisateur

    return getDistance(userPos[0], userPos[1], lat, lng) <= 100;
  });

  // Si pas de GPS, on centre sur la première offre trouvée pour éviter le vide
  const defaultCenter = userPos || 
    (nearbyOffers.length > 0 ? [nearbyOffers[0].lat || nearbyOffers[0].latitude, nearbyOffers[0].lng || nearbyOffers[0].longitude] : [13.75, 100.5]);

  if (locating) {
    return (
      <div className="w-full h-[500px] rounded-3xl bg-card border border-border flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Navigation className="w-8 h-8 animate-spin text-citrus mb-2" />
        <span className="font-black italic uppercase text-xs tracking-widest text-center px-10">
          Recherche de votre position GPS...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-border relative">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white rounded-full px-6 py-2 text-[10px] font-black uppercase italic shadow-2xl flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" /> {error}
        </div>
      )}

      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        <RecenterMap position={userPos} />

        {userPos && (
          <>
            <Marker position={userPos} icon={userIcon}>
              <Popup className="font-bold italic uppercase text-xs">📍 Vous êtes ici</Popup>
            </Marker>
            <Circle
              center={userPos}
              radius={5000}
              pathOptions={{ color: '#ff6b2b', fillColor: '#ff6b2b', fillOpacity: 0.05, weight: 1 }}
            />
          </>
        )}

        {nearbyOffers.map(offer => {
          const lat = offer.lat || offer.latitude;
          const lng = offer.lng || offer.longitude;
          
          return (
            <Marker key={offer.id} position={[lat, lng]} icon={offerIcon}>
              <Popup>
                <div className="min-w-[160px] font-bold">
                  {offer.photo && (
                    <img src={offer.photo} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <div className="uppercase italic text-xs mb-1">{offer.title}</div>
                  <div className="text-citrus text-sm mb-2">{offer.discount_price} THB</div>
                  <div className="text-[10px] text-muted-foreground italic border-t pt-2 uppercase">
                    {offer.shop_name}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}