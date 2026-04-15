import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, List, Map, Globe, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import OfferCard from '../components/OfferCard';
import { useTranslation } from '../lib/i18n';
import MapView from '../components/MapView';
import { Link } from 'react-router-dom';

const CATEGORIES = ['all', 'bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other'];
const RADIUS_OPTIONS = [5, 10, 20, 50];

const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const makeI18nFields = (title, description) => ({
  title_fr: title.fr, description_fr: description.fr,
  title_en: title.en, description_en: description.en,
  title_th: title.th, description_th: description.th,
  title_ru: title.ru, description_ru: description.ru,
  title_it: title.it, description_it: description.it,
  title: title.fr, description: description.fr,
});

const MOCK_OFFERS = [
  {
    ...makeI18nFields(
      { fr: 'Assortiment sushi', en: 'Sushi assortment', th: 'ชุดซูชิรวม', ru: 'Ассорти суши', it: 'Assortimento sushi' },
      { fr: 'Invendus du soir, frais du jour.', en: 'Evening leftovers, fresh today.', th: 'ของเหลือช่วงเย็น สดใหม่วันนี้', ru: 'Вечерние остатки, свежее за сегодня.', it: 'Invenduto serale, fresco di giornata.' }
    ),
    id: 'mock-bangkok-1', original_price: 260, discount_price: 120, collect_before: hoursFromNow(6), category: 'prepared', is_active: true, shop_name: 'Siam Bento', shop_address: 'Sukhumvit Soi 24, Bangkok', lat: 13.7302, lng: 100.5692, consumption_mode: 'takeaway', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Panier boulangerie', en: 'Bakery basket', th: 'ตะกร้าขนมปัง', ru: 'Корзина выпечки', it: 'Cesto da forno' },
      { fr: 'Pain et viennoiseries mixtes.', en: 'Bread and mixed pastries.', th: 'ขนมปังและเพสทรีรวม', ru: 'Хлеб и смешанная выпечка.', it: 'Pane e pasticceria mista.' }
    ),
    id: 'mock-bangkok-2', original_price: 180, discount_price: 85, collect_before: hoursFromNow(8), category: 'bakery', is_active: true, shop_name: 'Bangkok Bread Lab', shop_address: 'Silom Road, Bangkok', lat: 13.7243, lng: 100.5341, consumption_mode: 'takeaway', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Box fruits tropicaux', en: 'Tropical fruit box', th: 'กล่องผลไม้เมืองร้อน', ru: 'Бокс тропических фруктов', it: 'Box frutta tropicale' },
      { fr: 'Mangue, ananas, papaye.', en: 'Mango, pineapple, papaya.', th: 'มะม่วง สับปะรด มะละกอ', ru: 'Манго, ананас, папайя.', it: 'Mango, ananas, papaya.' }
    ),
    id: 'mock-patong-1', original_price: 150, discount_price: 70, collect_before: hoursFromNow(5), category: 'fruits', is_active: true, shop_name: 'Patong Fresh Corner', shop_address: 'Rat-U-Thit 200 Pee Rd, Patong', lat: 7.8969, lng: 98.2960, consumption_mode: 'both', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Sandwichs cafe', en: 'Cafe sandwiches', th: 'แซนด์วิชคาเฟ่', ru: 'Сэндвичи из кафе', it: 'Panini del caffe' },
      { fr: 'Sandwichs et wraps du jour.', en: 'Daily sandwiches and wraps.', th: 'แซนด์วิชและแรปประจำวัน', ru: 'Сэндвичи и роллы дня.', it: 'Panini e wrap del giorno.' }
    ),
    id: 'mock-patong-2', original_price: 210, discount_price: 95, collect_before: hoursFromNow(4), category: 'prepared', is_active: true, shop_name: 'Beach Bite Cafe', shop_address: 'Thawewong Rd, Patong', lat: 7.8919, lng: 98.2946, consumption_mode: 'both', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Poke bowl saumon', en: 'Salmon poke bowl', th: 'โบวล์โปเก้แซลมอน', ru: 'Поке боул с лососем', it: 'Poke bowl al salmone' },
      { fr: 'Bol frais avec riz, saumon et legumes.', en: 'Fresh bowl with rice, salmon and greens.', th: 'ข้าว แซลมอน และผักสดในโบวล์เดียว', ru: 'Свежий боул с рисом, лососем и овощами.', it: 'Bowl fresco con riso, salmone e verdure.' }
    ),
    id: 'mock-patong-3', original_price: 290, discount_price: 135, collect_before: hoursFromNow(5), category: 'prepared', is_active: true, shop_name: 'Patong Poke Lab', shop_address: 'Bangla Road, Patong', lat: 7.8938, lng: 98.2967, consumption_mode: 'both', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Desserts coco mangue', en: 'Coconut mango desserts', th: 'ของหวานมะพร้าวมะม่วง', ru: 'Десерты кокос-манго', it: 'Dessert cocco mango' },
      { fr: 'Desserts maison prets a emporter.', en: 'Homemade desserts ready for pickup.', th: 'ของหวานโฮมเมดพร้อมรับกลับ', ru: 'Домашние десерты навынос.', it: 'Dolci fatti in casa pronti da asporto.' }
    ),
    id: 'mock-patong-4', original_price: 170, discount_price: 79, collect_before: hoursFromNow(7), category: 'bakery', is_active: true, shop_name: 'Patong Sweet Spot', shop_address: 'Nanai Rd, Patong', lat: 7.8857, lng: 98.3042, consumption_mode: 'takeaway', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Panier epicerie locale', en: 'Local grocery basket', th: 'ตะกร้าของชำท้องถิ่น', ru: 'Корзина местных продуктов', it: 'Cesto drogheria locale' },
      { fr: 'Produits secs et snacks invendus.', en: 'Unsold dry goods and snacks.', th: 'สินค้าแห้งและขนมเหลือขาย', ru: 'Нераспроданные бакалея и снеки.', it: 'Prodotti secchi e snack invenduti.' }
    ),
    id: 'mock-patong-5', original_price: 200, discount_price: 90, collect_before: hoursFromNow(9), category: 'other', is_active: true, shop_name: 'Patong Local Mart', shop_address: 'Phang Muang Sai Kor Rd, Patong', lat: 7.8898, lng: 98.3008, consumption_mode: 'takeaway', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Jus detox vert', en: 'Green detox juice', th: 'น้ำดีท็อกซ์สีเขียว', ru: 'Зелёный детокс сок', it: 'Succo detox verde' },
      { fr: 'Bouteilles fraiches pressees le matin.', en: 'Fresh bottles pressed in the morning.', th: 'น้ำคั้นสดบรรจุขวดช่วงเช้า', ru: 'Свежие бутылки, выжатые утром.', it: 'Bottiglie fresche spremute al mattino.' }
    ),
    id: 'mock-patong-6', original_price: 130, discount_price: 55, collect_before: hoursFromNow(4), category: 'beverages', is_active: true, shop_name: 'Patong Juice Station', shop_address: 'Sainamyen Rd, Patong', lat: 7.9012, lng: 98.3029, consumption_mode: 'takeaway', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Box poulet grille', en: 'Grilled chicken box', th: 'กล่องไก่ย่าง', ru: 'Бокс с курицей гриль', it: 'Box pollo grigliato' },
      { fr: 'Portions du soir avec accompagnement.', en: 'Evening portions with side dish.', th: 'ชุดมื้อเย็นพร้อมเครื่องเคียง', ru: 'Вечерние порции с гарниром.', it: 'Porzioni serali con contorno.' }
    ),
    id: 'mock-patong-7', original_price: 250, discount_price: 118, collect_before: hoursFromNow(6), category: 'prepared', is_active: true, shop_name: 'Patong Grill House', shop_address: 'Rat-U-Thit Song Roi Pi Rd, Patong', lat: 7.8982, lng: 98.2993, consumption_mode: 'both', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Legumes bio mix', en: 'Organic veggie mix', th: 'ผักออร์แกนิกคละ', ru: 'Микс органических овощей', it: 'Mix verdure bio' },
      { fr: 'Panier du marche bio.', en: 'Organic market basket.', th: 'ตะกร้าจากตลาดออร์แกนิก', ru: 'Корзина с органического рынка.', it: 'Cesto dal mercato bio.' }
    ),
    id: 'mock-chiangmai-1', original_price: 190, discount_price: 90, collect_before: hoursFromNow(10), category: 'vegetables', is_active: true, shop_name: 'Nimman Green Market', shop_address: 'Nimmanhaemin Rd, Chiang Mai', lat: 18.7957, lng: 98.9685, consumption_mode: 'takeaway', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Patisseries artisanales', en: 'Artisan pastries', th: 'ขนมอบโฮมเมด', ru: 'Ремесленная выпечка', it: 'Pasticceria artigianale' },
      { fr: 'Selection du chef patissier.', en: 'Pastry chef selection.', th: 'คัดสรรโดยเชฟขนมหวาน', ru: 'Подборка шеф-кондитера.', it: 'Selezione del pasticcere.' }
    ),
    id: 'mock-chiangmai-2', original_price: 240, discount_price: 110, collect_before: hoursFromNow(7), category: 'bakery', is_active: true, shop_name: 'Lanna Bakery House', shop_address: 'Old City, Chiang Mai', lat: 18.7883, lng: 98.9853, consumption_mode: 'onSite', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Plateau seafood', en: 'Seafood platter', th: 'ชุดซีฟู้ดรวม', ru: 'Морское ассорти', it: 'Piatto seafood' },
      { fr: 'Crevettes et calamars prepares.', en: 'Prepared shrimp and squid.', th: 'กุ้งและปลาหมึกพร้อมทาน', ru: 'Готовые креветки и кальмары.', it: 'Gamberi e calamari pronti.' }
    ),
    id: 'mock-pattaya-1', original_price: 320, discount_price: 150, collect_before: hoursFromNow(6), category: 'seafood', is_active: true, shop_name: 'Pattaya Sea Select', shop_address: 'Beach Road, Pattaya', lat: 12.9344, lng: 100.8835, consumption_mode: 'both', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Boissons fraiches', en: 'Fresh drinks', th: 'เครื่องดื่มสดชื่น', ru: 'Освежающие напитки', it: 'Bevande fresche' },
      { fr: 'Jus presses et boissons maison.', en: 'Pressed juices and homemade drinks.', th: 'น้ำผลไม้คั้นและเครื่องดื่มโฮมเมด', ru: 'Свежие соки и домашние напитки.', it: 'Succhi freschi e bevande fatte in casa.' }
    ),
    id: 'mock-pattaya-2', original_price: 140, discount_price: 60, collect_before: hoursFromNow(9), category: 'beverages', is_active: true, shop_name: 'Jomtien Juice Bar', shop_address: 'Jomtien Beach Rd, Pattaya', lat: 12.8899, lng: 100.8828, consumption_mode: 'takeaway', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Fromages et dairy', en: 'Cheese and dairy', th: 'ชีสและผลิตภัณฑ์นม', ru: 'Сыры и молочные продукты', it: 'Formaggi e latticini' },
      { fr: 'Lots invendus refrigeration.', en: 'Unsold refrigerated lots.', th: 'สินค้าห้องเย็นเหลือขาย', ru: 'Нераспроданные охлаждённые наборы.', it: 'Lotti refrigerati invenduti.' }
    ),
    id: 'mock-ayutthaya-1', original_price: 230, discount_price: 105, collect_before: hoursFromNow(8), category: 'dairy', is_active: true, shop_name: 'Ayutthaya Dairy Point', shop_address: 'Naresuan Rd, Ayutthaya', lat: 14.3532, lng: 100.5689, consumption_mode: 'takeaway', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Repas thai prepares', en: 'Prepared Thai meals', th: 'อาหารไทยพร้อมทาน', ru: 'Готовые тайские блюда', it: 'Piatti thai pronti' },
      { fr: 'Menus du jour prets a emporter.', en: 'Daily menu ready for pickup.', th: 'เมนูประจำวันพร้อมรับกลับ', ru: 'Блюда дня, готовые к выдаче.', it: 'Menu del giorno pronti da asporto.' }
    ),
    id: 'mock-hua-hin-1', original_price: 200, discount_price: 92, collect_before: hoursFromNow(5), category: 'prepared', is_active: true, shop_name: 'Hua Hin Kitchen Hub', shop_address: 'Phetkasem Rd, Hua Hin', lat: 12.5684, lng: 99.9577, consumption_mode: 'both', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Panier petit-dejeuner', en: 'Breakfast basket', th: 'ตะกร้าอาหารเช้า', ru: 'Корзина завтрака', it: 'Cesto colazione' },
      { fr: 'Viennoiseries, pain et fruits du matin.', en: 'Pastries, bread and morning fruits.', th: 'เพสทรี ขนมปัง และผลไม้ยามเช้า', ru: 'Выпечка, хлеб и утренние фрукты.', it: 'Croissant, pane e frutta del mattino.' }
    ),
    id: 'mock-rawai-1', original_price: 220, discount_price: 98, collect_before: hoursFromNow(4), category: 'bakery', is_active: true, shop_name: 'Rawai Morning Bake', shop_address: 'Wiset Rd, Rawai, Phuket', lat: 7.7797, lng: 98.3259, consumption_mode: 'takeaway', needs_cool_bag: false, photo: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Box salades fraiches', en: 'Fresh salad box', th: 'กล่องสลัดสด', ru: 'Бокс свежих салатов', it: 'Box insalate fresche' },
      { fr: 'Salades maison et toppings du jour.', en: 'House salads with daily toppings.', th: 'สลัดโฮมเมดพร้อมท็อปปิ้งประจำวัน', ru: 'Домашние салаты и топпинги дня.', it: 'Insalate della casa con topping del giorno.' }
    ),
    id: 'mock-rawai-2', original_price: 240, discount_price: 110, collect_before: hoursFromNow(6), category: 'vegetables', is_active: true, shop_name: 'Rawai Green Bowl', shop_address: 'Saiyuan Rd, Rawai, Phuket', lat: 7.7914, lng: 98.3311, consumption_mode: 'both', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80'
  },
  {
    ...makeI18nFields(
      { fr: 'Mix seafood grille', en: 'Grilled seafood mix', th: 'ซีฟู้ดย่างรวม', ru: 'Микс морепродуктов на гриле', it: 'Mix seafood alla griglia' },
      { fr: 'Portions invendues en fin de service.', en: 'Unsold portions at end of service.', th: 'พอร์ชันที่เหลือช่วงปิดร้าน', ru: 'Нераспроданные порции в конце смены.', it: 'Porzioni invendute a fine servizio.' }
    ),
    id: 'mock-rawai-3', original_price: 340, discount_price: 159, collect_before: hoursFromNow(3), category: 'seafood', is_active: true, shop_name: 'Rawai Pier Select', shop_address: 'Rawai Beach Road, Phuket', lat: 7.7742, lng: 98.3296, consumption_mode: 'both', needs_cool_bag: true, photo: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=900&q=80'
  },
];

const toRad = (deg) => deg * (Math.PI / 180);
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function Explore() {
  const { t, dt, lang, setLanguage } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationError, setLocationError] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [radiusStep, setRadiusStep] = useState(1);
  const [viewMode, setViewMode] = useState('list'); 
  const selectedRadiusKm = RADIUS_OPTIONS[radiusStep];

  // --- CHARGEMENT DES OFFRES ---
  const loadOffers = async (lat = null, lng = null, radiusKm = selectedRadiusKm) => {
    setLoading(true);
    const now = new Date().toISOString(); 
    
    try {
      let result;
      if (lat && lng) {
        const { data, error } = await supabase.rpc('nearby_offers', {
          user_lat: lat,
          user_lon: lng, 
          radius_km: radiusKm
        });
        if (error) throw error;
        const nearbyMockOffers = MOCK_OFFERS.filter((offer) => (
          distanceKm(lat, lng, offer.lat, offer.lng) <= radiusKm
        ));
        result = [...(data || []), ...nearbyMockOffers];
      } else {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .gt('collect_before', now) 
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        result = [...(data || []), ...MOCK_OFFERS];
      }

      const formattedResult = (result || []).map(o => ({
        ...o,
        lat: parseFloat(o.lat || o.latitude),
        lng: parseFloat(o.lng || o.longitude)
      }));

      setOffers(formattedResult);
    } catch (err) {
      console.error("Erreur Supabase:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestUserLocation = (isRetry = false) => {
    if (!("geolocation" in navigator) || !window.isSecureContext) {
      setLocationError(true);
      setLocationBlocked(false);
      loadOffers();
      return;
    }

    if (!isRetry) setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(false);
        setLocationBlocked(false);
        loadOffers(position.coords.latitude, position.coords.longitude, selectedRadiusKm);
      },
      (error) => {
        setLocationError(true);
        setLocationBlocked(error.code === error.PERMISSION_DENIED);
        setUserCoords(null);
        loadOffers();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  useEffect(() => {
    if (!userCoords) return;
    loadOffers(userCoords.lat, userCoords.lng, selectedRadiusKm);
  }, [radiusStep]);

  // --- FILTRAGE CLIENT ---
  const filtered = offers.filter(o => {
    const now = new Date();
    const isNotExpired = new Date(o.collect_before) > now;
    const matchCat = activeCategory === 'all' || o.category === activeCategory;
    
    const displayTitle = (dt(o, 'title') || "").toLowerCase();
    const displayDesc = (dt(o, 'description') || "").toLowerCase();
    const displayShop = (o.shop_name || "").toLowerCase();
    const searchTerm = search.toLowerCase();

    const matchSearch = !search || 
      displayTitle.includes(searchTerm) || 
      displayDesc.includes(searchTerm) ||
      displayShop.includes(searchTerm);
    
    return isNotExpired && matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-earth text-foreground">
      {/* HEADER FIXE AVEC LOGO ET ROLLER DE LANGUE (Même style que Dashboard) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-earth/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-citrus flex items-center justify-center shadow-lg shadow-citrus/20">
              <Leaf className="w-6 h-6 text-earth" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Fresh<span className="text-citrus">Rescue</span></span>
          </Link>

           <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-white/10 border border-white/20 rounded-full pl-10 pr-8 py-2 text-sm font-bold cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-citrus/50 text-foreground"
                style={{ backgroundColor: '#1a1a1a', color: 'white' }}
              >
                <option value="en" className="bg-earth text-white">EN</option>
                <option value="fr" className="bg-earth text-white">FR</option>
                <option value="it" className="bg-earth text-white">IT</option>
                <option value="th" className="bg-earth text-white">TH</option>
                <option value="ru" className="bg-earth text-white">RU</option>
              </select>
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-citrus" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        
        {locationError && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 text-sm flex items-center justify-between gap-3 font-bold italic uppercase">
            <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4" />
            {t('geoError')}
            </div>
            {locationBlocked && (
              <button
                type="button"
                onClick={() => requestUserLocation(true)}
                className="px-3 py-1 rounded-full border border-orange-500/30 hover:border-orange-500/60 text-[10px] tracking-wider"
              >
                ACTIVER GPS
              </button>
            )}
          </div>
        )}

        <div className="mb-10 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 italic uppercase">
              {t('activeOffers')} <span className="text-citrus">({filtered.length})</span>
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest italic">
              {locationError ? t('allCategories') : `${t('notificationRadius')} : ${selectedRadiusKm} KM`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-full p-1 w-fit shadow-lg shadow-black/20">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${
                viewMode === 'list' ? 'bg-citrus text-earth' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${
                viewMode === 'map' ? 'bg-citrus text-earth' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Map className="w-4 h-4" /> {t('explore')}
            </button>
          </div>
        </div>

        {!locationError && (
          <div className="mb-8 bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Rayon de recherche
              </p>
              <span className="text-citrus text-sm font-black">{selectedRadiusKm} km</span>
            </div>
            <input
              type="range"
              min="0"
              max={RADIUS_OPTIONS.length - 1}
              step="1"
              value={radiusStep}
              onChange={(e) => setRadiusStep(Number(e.target.value))}
              className="w-full accent-citrus"
            />
            <div className="mt-2 flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
              {RADIUS_OPTIONS.map((radius) => (
                <span key={radius}>{radius} km</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('productDescPlaceholder')}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-citrus/30 transition-all font-bold"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase italic whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? 'bg-citrus text-earth border-citrus shadow-lg shadow-citrus/20' 
                    : 'bg-card border-border text-muted-foreground hover:border-citrus/50'
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-citrus animate-spin mb-4" />
            <p className="text-muted-foreground font-black italic uppercase text-xs tracking-widest">
                {t('loadingOffers')}
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <MapView offers={filtered} radiusKm={selectedRadiusKm} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center text-4xl mb-6 shadow-inner">🥗</div>
            <p className="text-muted-foreground text-xl font-black italic uppercase leading-tight">{t('noOffers')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {filtered.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}