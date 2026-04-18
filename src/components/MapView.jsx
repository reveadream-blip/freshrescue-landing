import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { SWISS_BOUNDS_CORNERS, distanceKm } from '../lib/swissGeo';
import { MAP_RADIUS_KM as DEFAULT_MAP_RADIUS_KM } from '../lib/geoConstants';
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

/** Boîte englobante ~carrée autour d’un point (rayon km). */
function boundsAroundPointKm(lat, lng, radiusKm) {
  const dLat = radiusKm / 111;
  const cos = Math.cos((lat * Math.PI) / 180);
  const dLng = radiusKm / (111 * (Math.abs(cos) < 0.01 ? 1 : cos));
  return L.latLngBounds([lat - dLat, lng - dLng], [lat + dLat, lng + dLng]);
}

function FitMapView({ offers, localMode, localBounds }) {
  const map = useMap();
  const prevKey = useRef(null);

  const key = useMemo(() => {
    const pts = offers.filter((o) => o.lat != null && o.lng != null && !Number.isNaN(o.lat) && !Number.isNaN(o.lng));
    const ptsKey = pts.map((o) => `${o.id}:${o.lat},${o.lng}`).join('|');
    if (localMode && localBounds?.isValid?.()) {
      const sw = localBounds.getSouthWest();
      const ne = localBounds.getNorthEast();
      return `L|${sw.lat},${sw.lng}|${ne.lat},${ne.lng}|${ptsKey}`;
    }
    return `S|${ptsKey}`;
  }, [offers, localMode, localBounds]);

  useEffect(() => {
    if (prevKey.current === key && prevKey.current !== null) return;
    prevKey.current = key;

    if (localMode && localBounds?.isValid?.()) {
      map.fitBounds(localBounds, { padding: [28, 28], maxZoom: 15, animate: true });
      return;
    }

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
  }, [key, offers, map, localMode, localBounds]);

  return null;
}

export default function MapView({ offers = [], userPosition = null, mapRadiusKm = DEFAULT_MAP_RADIUS_KM }) {
  const { t, dt } = useTranslation();

  const nearbyOffers = offers.filter((o) => o.lat && o.lng);
  const userLatLng =
    userPosition &&
    Number.isFinite(userPosition.lat) &&
    Number.isFinite(userPosition.lng)
      ? [userPosition.lat, userPosition.lng]
      : null;

  const localMode = Boolean(userLatLng && mapRadiusKm > 0);

  const localBounds = useMemo(() => {
    if (!localMode || !userPosition) return null;
    let b = boundsAroundPointKm(userPosition.lat, userPosition.lng, mapRadiusKm);
    if (b.intersects(SWISS_BOUNDS)) {
      const inter = b.intersect(SWISS_BOUNDS);
      if (inter?.isValid?.()) return inter;
    }
    return b;
  }, [localMode, userPosition, mapRadiusKm]);

  const mapCenter = localMode && userPosition ? [userPosition.lat, userPosition.lng] : SWISS_CENTER;
  const mapZoom = localMode ? 12 : 8;
  const effectiveMaxBounds = localBounds?.isValid?.() ? localBounds : SWISS_BOUNDS;

  return (
    <div className="w-full min-h-[calc(100vh-14rem)] h-[min(70vh,720px)] rounded-3xl overflow-hidden border border-border relative bg-card">
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-card/90 backdrop-blur border border-border rounded-full px-4 py-2 text-[10px] font-bold uppercase italic text-muted-foreground">
        {localMode ? t('mapLocalRadiusHint') : t('mapZoomHint')}
      </div>

      <MapContainer
        key={localMode && userPosition ? `near-${userPosition.lat}-${userPosition.lng}` : 'ch-wide'}
        center={mapCenter}
        zoom={mapZoom}
        minZoom={localMode ? 11 : 7}
        maxZoom={18}
        maxBounds={effectiveMaxBounds}
        maxBoundsViscosity={localMode ? 1 : 0.85}
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

        <FitMapView offers={nearbyOffers} localMode={localMode} localBounds={localBounds} />

        {userLatLng && mapRadiusKm > 0 && (
          <Circle
            center={userLatLng}
            radius={mapRadiusKm * 1000}
            pathOptions={{
              color: '#ff6b2b',
              fillColor: '#ff6b2b',
              fillOpacity: 0.12,
              weight: 2,
              opacity: 0.9,
            }}
          />
        )}

        {userLatLng && (
          <Marker position={userLatLng} icon={userIcon}>
            <Popup>📍 {t('youAreHere')}</Popup>
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
                      {distanceKm(userLatLng[0], userLatLng[1], offer.lat, offer.lng).toFixed(1)} km
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
