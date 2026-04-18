import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { isOfferInSwitzerland, SWISS_BOUNDS_CORNERS } from '../lib/swissGeo';
import SafeOfferImage from './SafeOfferImage';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const SWISS_CENTER = [46.85, 8.25];
const SWISS_BOUNDS = L.latLngBounds(SWISS_BOUNDS_CORNERS[0], SWISS_BOUNDS_CORNERS[1]);

const userIcon = L.divIcon({
  html: `<div style="background:#ff6b2b;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const offerFoodIcon = L.divIcon({
  html: `
    <div style="
      width:40px;height:40px;border-radius:50%;
      background:linear-gradient(145deg,#2ec4b6,#1a9f8e);
      border:3px solid #fff;
      box-shadow:0 3px 12px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-size:20px;line-height:1;
    ">🍽️</div>`,
  className: 'leaflet-marker-food',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

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

function FitSwissOffers({ offers }) {
  const map = useMap();
  const prevKey = useRef(null);

  const key = useMemo(() => {
    const pts = offers.filter((o) => o.lat != null && o.lng != null && !Number.isNaN(o.lat) && !Number.isNaN(o.lng));
    return pts.map((o) => `${o.id}:${o.lat},${o.lng}`).join('|');
  }, [offers]);

  useEffect(() => {
    if (prevKey.current === key && prevKey.current !== null) return;
    prevKey.current = key;

    const valid = offers.filter(
      (o) => o.lat != null && o.lng != null && !Number.isNaN(o.lat) && !Number.isNaN(o.lng)
    );
    if (valid.length === 0) {
      map.fitBounds(SWISS_BOUNDS, { padding: [40, 40], maxZoom: 9, animate: true });
      return;
    }
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 11, { animate: true });
      return;
    }
    const b = L.latLngBounds(valid.map((o) => [o.lat, o.lng]));
    map.fitBounds(b, { padding: [56, 56], maxZoom: 12, animate: true });
  }, [key, offers, map]);

  return null;
}

export default function MapView({ offers = [], userPosition = null }) {
  const { t, dt } = useTranslation();

  const nearbyOffers = offers.filter((o) => o.lat && o.lng);
  const userInCh =
    userPosition &&
    isOfferInSwitzerland(userPosition.lat, userPosition.lng);
  const userLatLng = userInCh ? [userPosition.lat, userPosition.lng] : null;

  return (
    <div className="w-full min-h-[calc(100vh-14rem)] h-[min(70vh,720px)] rounded-3xl overflow-hidden border border-border relative bg-card">
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 backdrop-blur border border-border rounded-full px-4 py-2 text-[10px] font-bold uppercase italic text-muted-foreground">
        Zoom: molette / pincer à 2 doigts
      </div>

      <MapContainer
        center={SWISS_CENTER}
        zoom={8}
        minZoom={7}
        maxZoom={18}
        maxBounds={SWISS_BOUNDS}
        maxBoundsViscosity={0.85}
        style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
        zoomControl={false}
        scrollWheelZoom
        touchZoom
        doubleClickZoom
        dragging
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        <FitSwissOffers offers={nearbyOffers} />

        {userLatLng && (
          <Marker position={userLatLng} icon={userIcon}>
            <Popup>📍 {t('youAreHere') || 'Vous êtes ici'}</Popup>
          </Marker>
        )}

        {nearbyOffers.map((offer) => {
          const isDemoOffer =
            offer.is_demo === true || (typeof offer.id === 'string' && offer.id.startsWith('mock-'));
          return (
            <Marker key={offer.id} position={[offer.lat, offer.lng]} icon={offerFoodIcon}>
              <Popup>
                <div className="p-1" style={{ minWidth: 160 }}>
                  <div className="relative w-full mb-2">
                    <SafeOfferImage
                      offer={offer}
                      alt=""
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    {isDemoOffer && (
                      <div className="absolute top-1 right-1 bg-[#1a1a1a]/90 text-[#ff6b2b] text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tight border border-[#ff6b2b]/40">
                        {t('demoOfferBadge')}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-earth text-sm leading-tight mb-1">{dt(offer, 'title')}</div>
                  <div className="text-citrus font-black text-lg">{offer.discount_price} CHF</div>
                  <div className="text-gray-500 text-[10px] font-bold uppercase">{offer.shop_name}</div>

                  {userLatLng && (
                    <div className="text-teal-600 text-[10px] font-bold mt-2 pt-2 border-t border-gray-100">
                      📍{' '}
                      {getDistance(userLatLng[0], userLatLng[1], offer.lat, offer.lng).toFixed(1)} km
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {nearbyOffers.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[500]">
          <div className="bg-card/85 backdrop-blur border border-border rounded-2xl px-6 py-4 text-center max-w-sm shadow-lg">
            <MapPin className="w-8 h-8 text-citrus mx-auto mb-2" />
            <p className="text-sm font-black uppercase italic text-muted-foreground">{t('noOffers')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
