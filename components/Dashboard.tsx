
import React, { useMemo, useState } from 'react';
import { Product, Sale, CrateStock, Settings, Store, StaffMember } from '../types';
import { 
  TrendingUp, 
  Wallet, 
  Beer, 
  Calendar,
  LogOut,
  BrainCircuit,
  Sparkles,
  Loader2,
  Lock,
  Crown,
  ShoppingBag,
  WifiOff,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';
import MetricCard from './MetricCard';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell 
} from 'recharts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  crates: CrateStock;
  settings: Settings;
  store: Store;
  onUnlock?: () => void;
  onLogout: () => void;
  staff: StaffMember[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales, crates, settings, store, onUnlock, onLogout, staff }) => {
  const isEnterprise = store.tier === 'enterprise';
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [offlineError, setOfflineError] = useState(false);

  const analytics = useMemo(() => {
    const totalGross = sales.reduce((acc, s) => acc + s.total, 0);
    const totalStockValueAchat = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    const monthlyFixedCharges = (settings.monthlyRent || 0) + 
                               (settings.monthlyManagerSalary || 0) + 
                               (settings.monthlyElectricity || 0) + 
                               (settings.monthlyWater || 0) +
                               (settings.monthlyWifi || 0) +
                               (settings.monthlyCanal || 0) +
                               (settings.monthlyDjSalary || 0);

    return { totalGross, totalStockValueAchat, monthlyFixedCharges };
  }, [sales, settings, products]);

  const chartData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = days[d.getDay()];
      const dayDate = d.toLocaleDateString('fr-GA');
      
      const dayTotal = sales
        .filter(s => new Date(s.timestamp).toLocaleDateString('fr-GA') === dayDate)
        .reduce((sum, s) => sum + s.total, 0);
        
      last7Days.push({
        name: dayLabel,
        total: dayTotal,
        fullDate: dayDate
      });
    }
    return last7Days;
  }, [sales]);

  const dailyFixedTarget = analytics.monthlyFixedCharges / 30;

  const generateAiAdvice = async () => {
    if (!navigator.onLine) {
      setOfflineError(true);
      return;
    }
    
    setIsAiLoading(true);
    setOfflineError(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Agis comme un expert snack-bar Gabon. Données : CA ${analytics.totalGross} F, Stock ${analytics.totalStockValueAchat} F, Charges ${analytics.monthlyFixedCharges} F. Analyse en 3 points courts.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAiAdvice(response.text || "Analyse indisponible.");
    } catch (e) {
      setAiAdvice("Erreur de connexion à l'IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-2">
            <Calendar className="w-4 h-4" /> Mode Local • {new Date().toLocaleDateString('fr-GA')}
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
            {store.name}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className={`text-sm font-black italic uppercase leading-none ${store.subscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {store.subscriptionStatus === 'ACTIVE' ? 'Activé' : 'Essai'}
                </p>
             </div>
             <Crown className={`w-5 h-5 ${store.subscriptionStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Ventes Totales" value={`${analytics.totalGross.toLocaleString()} F`} icon={Wallet} colorClass="bg-emerald-600" />
        <MetricCard title="Valeur Stock" value={`${analytics.totalStockValueAchat.toLocaleString()} F`} icon={ShoppingBag} colorClass="bg-rose-600" />
        <MetricCard title="Charges Fixes" value={`${analytics.monthlyFixedCharges.toLocaleString()} F`} icon={TrendingUp} colorClass="bg-indigo-600" />
        <MetricCard title="Consignes Vides" value={`${crates.sobragaEmpties}`} icon={Beer} colorClass="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Graphique de Performance */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">Performance 7 Jours</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Comparaison vs Seuil de rentabilité journalier</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
               <Target className="w-4 h-4 text-rose-500" />
               <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-500 uppercase leading-none">Cible Jour</span>
                 <span className="text-xs font-black text-rose-500 italic uppercase">{Math.round(dailyFixedTarget).toLocaleString()} F</span>
               </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip 
                  cursor={{ fill: '#33415510' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl border border-white/10 shadow-2xl">
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.fullDate}</p>
                          <p className="text-sm font-black italic">{payload[0].value?.toLocaleString()} FCFA</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  y={dailyFixedTarget} 
                  stroke="#f43f5e" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={{ 
                    position: 'insideTopRight', 
                    value: 'Seuil', 
                    fill: '#f43f5e', 
                    fontSize: 8, 
                    fontWeight: 900 
                  }} 
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.total >= dailyFixedTarget ? '#10b981' : '#6366f1'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Advisor IA */}
        <section className="lg:col-span-4 bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/5 flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <BrainCircuit className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Conseiller <span className="text-emerald-500">IA</span></h3>
            </div>

            {offlineError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl mb-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                <WifiOff className="w-4 h-4 text-rose-500" />
                <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 leading-tight">Connexion requise pour l'IA.</p>
              </div>
            )}

            {aiAdvice ? (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 h-full max-h-[200px] overflow-y-auto custom-scrollbar">
                <p className="text-[11px] font-medium leading-relaxed italic text-slate-200 whitespace-pre-wrap">{aiAdvice}</p>
                <button onClick={() => setAiAdvice(null)} className="mt-4 text-[9px] font-black uppercase text-emerald-500 tracking-widest hover:underline">Fermer</button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wide italic leading-relaxed">
                  L'IA BistroGest analyse vos marges et votre stock pour optimiser votre trésorerie au Gabon. 
                </p>
                {!isEnterprise ? (
                  <button onClick={onUnlock} className="w-full bg-white text-slate-900 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                    <Lock className="w-4 h-4" /> Débloquer IA Pro
                  </button>
                ) : (
                  <button 
                    onClick={generateAiAdvice}
                    disabled={isAiLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Lancer l'analyse
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
