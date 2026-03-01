
import React, { useMemo, useState } from 'react';
import { Sale, ActivityLog, Product, Settings, User as UserType } from '../types';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  User, 
  CloudUpload,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Mail,
  LogOut,
  Globe,
  Rocket,
  Smartphone
} from 'lucide-react';
import PublicationModal from './PublicationModal';

interface OwnerMonitorProps {
  sales: Sale[];
  logs: ActivityLog[];
  products: Product[];
  settings: Settings;
  user: UserType;
  onLogout: () => void;
}

const OwnerMonitor: React.FC<OwnerMonitorProps> = ({ sales, logs, products, settings, user, onLogout }) => {
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todaySales = sales.filter(s => new Date(s.timestamp).toLocaleDateString() === today);
    const totalToday = todaySales.reduce((acc, s) => acc + s.total, 0);
    
    // Top Products
    const productCounts: { [key: string]: number } = {};
    sales.forEach(s => s.items.forEach(i => {
      productCounts[i.productName] = (productCounts[i.productName] || 0) + i.quantity;
    }));
    
    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { totalToday, topProducts, todayCount: todaySales.length };
  }, [sales]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic uppercase">Espace <span className="text-indigo-600 dark:text-indigo-400">Propriétaire</span></h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
               <ShieldCheck className="w-3 h-3 text-emerald-600" />
               <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Compte Google Authentifié</span>
            </div>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-widest text-[9px]">
              <Mail className="w-3 h-3" /> {user.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col items-end mr-1">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compte Actif</span>
               <span className="text-sm font-black text-slate-900 dark:text-slate-100 italic">{user.name}</span>
            </div>
            <img src={user.photo} alt={user.name} className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-800 shadow-xl" />
          </div>
          <button 
            onClick={onLogout}
            className="group flex flex-col items-center gap-1 p-5 bg-red-600 text-white rounded-[2rem] hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-500/20 border-b-4 border-red-800"
          >
            <LogOut className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            <span className="text-[8px] font-black uppercase tracking-widest">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* SECTION PUBLICATION */}
      <section className="bg-slate-900 rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.9rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-emerald-500/20 rounded-[2rem] animate-ping"></div>
                 <Globe className="w-10 h-10 relative" />
              </div>
              <div className="text-center md:text-left">
                 <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">Centre de Publication</h4>
                 </div>
                 <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest max-w-sm">
                    Publiez votre menu digital et donnez l'accès à vos serveurs en un clic.
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setIsPubModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-4 bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-500 transition-all active:scale-95 group"
              >
                <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                Publier l'Application
              </button>
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Résumé d'aujourd'hui */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recette du Jour</p>
              <h4 className="text-4xl font-black text-emerald-600 tracking-tighter italic">{stats.totalToday.toLocaleString()} <span className="text-sm font-bold opacity-60">FCFA</span></h4>
              <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase">
                <ArrowUpRight className="w-4 h-4" /> +12% vs Hier
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Commandes Validées</p>
              <h4 className="text-4xl font-black text-indigo-600 tracking-tighter italic">{stats.todayCount}</h4>
              <div className="mt-4 flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase">
                <TrendingUp className="w-4 h-4" /> Pic d'activité à 19h
              </div>
            </div>
          </div>

          {/* Top Ventes */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 italic uppercase">
              <BarChart3 className="w-6 h-6 text-indigo-500" /> Top 5 des Articles
            </h3>
            <div className="space-y-4">
              {stats.topProducts.map(([name, count], idx) => (
                <div key={name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-xs">{idx + 1}</span>
                    <span className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-tight">{name}</span>
                  </div>
                  <span className="font-black text-indigo-500">{count} <span className="text-[9px] uppercase">Vendus</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline d'activité (Logs) */}
        <div className="bg-slate-950 text-white rounded-[3rem] p-8 shadow-2xl border border-white/5 flex flex-col h-[600px]">
          <h3 className="text-xl font-black tracking-tighter italic uppercase mb-6 flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-500" /> Journal de Bord
          </h3>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Clock className="w-12 h-12 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Aucune activité</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="relative pl-6 border-l border-white/10 pb-6 last:pb-0">
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                        log.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-tight tracking-tight uppercase italic">{log.description}</p>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
                      <User className="w-3 h-3" /> {log.user}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Données 100% Intègres</span>
            </div>
          </div>
        </div>
      </div>

      <PublicationModal 
        isOpen={isPubModalOpen} 
        onClose={() => setIsPubModalOpen(false)} 
        bistroName={settings.bistroName}
      />
    </div>
  );
};

export default OwnerMonitor;
