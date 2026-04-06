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
  }, [position]);
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setError('Impossible d\'accéder à votre position.');
        setLocating(false);
      }
    );
  }, []);

  // Dans le filtre nearbyOffers
const nearbyOffers = offers.filter(o => {
  if (!o.lat || !o.lng || !userPos) return !!o.lat && !!o.lng; // CHANGÉ
  return getDistance(userPos[0], userPos[1], o.lat, o.lng) <= 100; // CHANGÉ (passé à 100km pour Phuket)
});

  const defaultCenter = userPos || [13.7563, 100.5018]; // Bangkok fallback

  if (locating) {
    return (
      <div className="w-full h-[500px] rounded-3xl bg-card border border-border flex items-center justify-center gap-3 text-muted-foreground">
        <Navigation className="w-5 h-5 animate-pulse text-citrus" />
        <span className="font-semibold">Localisation en cours...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-border relative">
      {error && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-card border border-border rounded-full px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" /> {error} — carte centrée sur Bangkok
        </div>
      )}

      {userPos && (
        <div className="absolute top-3 right-3 z-[1000] bg-card border border-border rounded-full px-4 py-2 text-xs font-semibold text-citrus flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5" />
          {nearbyOffers.length} offre{nearbyOffers.length !== 1 ? 's' : ''} à &lt;10km
        </div>
      )}

      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
/>
        <RecenterMap position={userPos} />

        {/* User position */}
        {userPos && (
          <>
            <Marker position={userPos} icon={userIcon}>
              <Popup>📍 Votre position</Popup>
            </Marker>
            <Circle
              center={userPos}
              radius={10000}
              pathOptions={{ color: '#ff6b2b', fillColor: '#ff6b2b', fillOpacity: 0.05, weight: 1 }}
            />
          </>
        )}

        {/* Offer markers */}
        {/* Offer markers */}
{nearbyOffers.map(offer => (
  offer.lat && offer.lng && (
    <Marker key={offer.id} position={[offer.lat, offer.lng]} icon={offerIcon}>
      <Popup>
        <div style={{ minWidth: 160 }}>
          {offer.photo && (
            <img 
              src={offer.photo} 
              alt={offer.title} 
              style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} 
            />
          )}
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{offer.title}</div>
          <div style={{ color: '#ff6b2b', fontWeight: 700, fontSize: 16 }}>{offer.discount_price} THB</div>
          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{offer.shop_name}</div>
          
          {userPos && (
            <div style={{ color: '#2ec4b6', fontSize: 11, marginTop: 4 }}>
              📍 {getDistance(userPos[0], userPos[1], offer.lat, offer.lng).toFixed(1)} km
            </div>
          )}
        </div> {/* <-- C'est souvent cette fermeture qui manquait */}
      </Popup>
    </Marker>
  )
))}
      </MapContainer>
    </div>
  );
}