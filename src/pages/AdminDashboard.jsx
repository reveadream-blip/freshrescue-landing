import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Store, Bell, 
  LogOut, TrendingUp, Package, 
  Trash2, AlertCircle, RefreshCw, 
  Mail, MapPin, DollarSign, Send, History, AlertTriangle, CreditCard, Users
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [offers, setOffers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pushLogs, setPushLogs] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: off } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
      const { data: mer } = await supabase.from('merchants').select('*').order('shop_name', { ascending: true });
      const { data: sub } = await supabase.from('subscriptions').select('*').eq('status', 'active');
      const { data: psh } = await supabase.from('push_history').select('*').order('sent_at', { ascending: false });

      setOffers(off || []);
      setMerchants(mer || []);
      setSubscriptions(sub || []);
      setPushLogs(psh || []);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (id) => {
    if (window.confirm("Supprimer définitivement cette offre ?")) {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (!error) fetchAdminData();
    }
  };

  // --- LOGIQUE FINANCIÈRE ---
  
  // Calcul du Revenu Mensuel Récurrent (MRR)
  const mrr = subscriptions.reduce((acc, s) => {
    const amount = s.amount || 0;
    // Si c'est annuel, on divise par 12 pour avoir l'apport mensuel
    return acc + (s.plan_type === 'annuel' ? amount / 12 : amount);
  }, 0);

  const totalRevenue = subscriptions.reduce((acc, s) => acc + (s.amount || 0), 0);
  const activeSubsCount = subscriptions.length;
  const monthlySubs = subscriptions.filter(s => s.plan_type === 'mensuel').length;
  const yearlySubs = subscriptions.filter(s => s.plan_type === 'annuel').length;

  const silentMerchants = merchants.filter(m => {
    const mOffers = offers.filter(o => o.merchant_id === m.id);
    if (mOffers.length === 0) return true;
    const diff = (new Date() - new Date(mOffers[0].created_at)) / (1000 * 60 * 60 * 24);
    return diff > 7;
  });

  // --- RENDU DES PAGES ---

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold tracking-tight">Tableau de bord National</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="MRR (Revenu Mensuel)" value={`${Math.round(mrr).toLocaleString()} ฿`} icon={<DollarSign className="text-green-500" />} />
        <StatCard title="Abos Actifs" value={activeSubsCount} icon={<CreditCard className="text-blue-500" />} />
        <StatCard title="Offres en ligne" value={offers.filter(o => o.is_active).length} icon={<Package className="text-citrus" />} />
        <StatCard title="Alertes Engagement" value={silentMerchants.length} icon={<AlertTriangle className="text-orange-500" />} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 border rounded-3xl shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <TrendingUp size={18} className="text-citrus" /> Performance Abonnements
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-medium">Mensuels automatiques</span>
              <span className="font-bold text-slate-900">{monthlySubs}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm font-medium">Annuels</span>
              <span className="font-bold text-slate-900">{yearlySubs}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl shadow-sm text-white flex flex-col justify-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Cash Collecté</p>
          <p className="text-4xl font-black">{totalRevenue.toLocaleString()} <span className="text-lg">THB</span></p>
          <p className="text-slate-500 text-xs mt-4 italic">Inclut les paiements annuels intégraux encaissés.</p>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Flux Financier National</h2>
        <div className="flex gap-2 text-[10px] font-bold">
           <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">LIVE DATA</span>
        </div>
      </div>
      
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-4">Boutique</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Fréquence</th>
              <th className="px-6 py-4">Montant</th>
              <th className="px-6 py-4">Prochain Prélèvement</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {subscriptions.map(s => {
              const m = merchants.find(mer => mer.id === s.merchant_id);
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{m?.shop_name || "Merchant inconnu"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${s.plan_type === 'annuel' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                      {s.plan_type === 'annuel' ? 'PREMIUM YEAR' : 'MONTHLY FLEX'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 capitalize">{s.plan_type}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{s.amount?.toLocaleString()} ฿</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(s.end_date).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Catalogue des Offres</h2>
        <button onClick={fetchAdminData} className="p-2 hover:bg-slate-100 rounded-full"><RefreshCw size={18}/></button>
      </div>
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="px-6 py-4">Offre</th>
              <th className="px-6 py-4">Commerçant</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {offers.map(o => {
              const m = merchants.find(mer => mer.id === o.merchant_id);
              return (
                <tr key={o.id}>
                  <td className="px-6 py-4 font-bold">{o.title}</td>
                  <td className="px-6 py-4 text-slate-600">{m?.shop_name}</td>
                  <td className="px-6 py-4 font-medium text-citrus">{o.discount_price} ฿</td>
                  <td className="px-6 py-4">
                    {o.is_active ? 
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-[10px] font-bold">ACTIF</span> : 
                      <span className="text-slate-400 bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold">INACTIF</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteOffer(o.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMerchants = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <h2 className="text-2xl font-bold">Partenaires (Thaïlande)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {merchants.map(m => (
          <div key={m.id} className="bg-white border rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Store size={20} /></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.city || "Zone TH"}</span>
            </div>
            <h3 className="font-bold text-lg">{m.shop_name}</h3>
            <p className="text-sm text-slate-500 mb-6 flex items-center gap-1"><MapPin size={14}/> {m.address || "Localisation non définie"}</p>
            <div className="flex gap-2 border-t pt-4">
              <a href={`tel:${m.phone}`} className="flex-1 bg-slate-900 text-white text-center py-2 rounded-xl text-xs font-bold hover:bg-citrus transition-colors">Appeler</a>
              <button className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"><Mail size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPush = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <h2 className="text-2xl font-bold">Campagnes Push</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Envoyer une notification</h3>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Message</label>
            <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm h-32 focus:ring-2 ring-citrus" placeholder="Contenu de l'alerte..." />
          </div>
          <button className="w-full bg-citrus text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <Send size={18} /> Diffuser en Thaïlande
          </button>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm h-[400px] overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><History size={20}/> Historique</h3>
          <div className="space-y-4 overflow-y-auto">
            {pushLogs.map(log => (
              <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-bold text-sm mb-1">{log.title}</p>
                <p className="text-xs text-slate-500">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f9fafb] text-slate-900 overflow-hidden font-sans">
      <aside className="w-72 border-r bg-white flex flex-col flex-shrink-0">
        <div className="p-8">
          <h1 className="font-black text-2xl text-citrus italic tracking-tighter">
            FRESHRESCUE <span className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded ml-1 not-italic">ADMIN</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<DollarSign size={20} />} label="Revenus & Abos" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} />
          <NavItem icon={<AlertTriangle size={20} />} label="Engagement" active={activeTab === 'engagement'} onClick={() => setActiveTab('engagement')} />
          <NavItem icon={<Bell size={20} />} label="Notifications Push" active={activeTab === 'push'} onClick={() => setActiveTab('push')} />
          <div className="h-px bg-slate-100 my-6 mx-4" />
          <NavItem icon={<ShoppingBag size={20} />} label="Toutes les Offres" active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} />
          <NavItem icon={<Store size={20} />} label="Commerçants" active={activeTab === 'merchants'} onClick={() => setActiveTab('merchants')} />
        </nav>
        <div className="p-6 border-t">
          <button onClick={logout} className="flex items-center gap-3 text-red-500 text-sm font-black p-4 hover:bg-red-50 w-full rounded-2xl transition-all">
            <LogOut size={20} /> DÉCONNEXION
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'revenue' && renderRevenue()}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Relance Commerçants</h2>
            <div className="grid grid-cols-1 gap-4">
              {silentMerchants.map(m => (
                <div key={m.id} className="bg-white border-l-4 border-l-orange-500 border rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{m.shop_name}</h3>
                    <p className="text-xs text-slate-400">Aucune activité depuis +7 jours</p>
                  </div>
                  <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold">Relancer</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'push' && renderPush()}
        {activeTab === 'offers' && renderOffers()}
        {activeTab === 'merchants' && renderMerchants()}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}