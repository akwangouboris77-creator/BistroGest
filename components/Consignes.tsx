
import React from 'react';
import { CrateStock } from '../types';
import { 
  Beer, 
  RefreshCcw, 
  Trash2, 
  Plus, 
  Minus,
  Truck,
  ChevronLeft
} from 'lucide-react';

interface ConsignesProps {
  crates: CrateStock;
  setCrates: React.Dispatch<React.SetStateAction<CrateStock>>;
  onBack?: () => void;
}

const Consignes: React.FC<ConsignesProps> = ({ crates, setCrates, onBack }) => {
  const updateCrates = (field: keyof CrateStock, delta: number) => {
    setCrates(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta)
    }));
  };

  const handleExchange = () => {
    if (crates.sobragaEmpties >= 12) {
      setCrates(prev => ({
        sobragaEmpties: prev.sobragaEmpties - 12,
        sobragaFull: prev.sobragaFull + 1
      }));
      alert("Échange effectué : 12 bouteilles vides remplacées par 1 casier plein.");
    } else {
      alert("Il vous faut au moins 12 bouteilles vides (1 casier) pour effectuer l'échange avec SOBRAGA.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 font-black text-[10px] uppercase tracking-widest transition-all mb-4">
           <ChevronLeft className="w-4 h-4" /> Retour Dashboard
        </button>
        <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic uppercase">Gestion des <span className="text-emerald-600 dark:text-emerald-500">Consignes</span></h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 italic text-xs uppercase tracking-widest">Suivi des bouteilles vides SOBRAGA</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col items-center text-center transition-all hover:border-amber-500/30">
          <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <Beer className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-950 dark:text-slate-100 mb-2 tracking-tight italic uppercase">Bouteilles Vides</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Consignes locales prêtes</p>
          
          <div className="flex items-center gap-10 mb-10">
            <button 
              onClick={() => updateCrates('sobragaEmpties', -1)}
              className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-all shadow-sm active:scale-90"
            >
              <Minus className="w-8 h-8" />
            </button>
            <span className="text-7xl font-black text-slate-950 dark:text-slate-100 tracking-tighter italic">{crates.sobragaEmpties}</span>
            <button 
              onClick={() => updateCrates('sobragaEmpties', 1)}
              className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-500 transition-all shadow-sm active:scale-90"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>

          <div className="w-full bg-amber-50 dark:bg-amber-900/10 p-5 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30">
            <p className="text-amber-800 dark:text-amber-400 text-[10px] font-black uppercase flex items-center justify-center gap-3 tracking-[0.2em]">
              <RefreshCcw className="w-4 h-4 animate-spin-slow" />
              Équivaut à {Math.floor(crates.sobragaEmpties / 12)} casiers complets
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col items-center text-center transition-all hover:border-emerald-500/30">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
            <Truck className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-950 dark:text-slate-100 mb-2 tracking-tight italic uppercase">Casiers Pleins</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Stock tampon SOBRAGA</p>
          
          <div className="flex items-center gap-10 mb-10">
            <button 
              onClick={() => updateCrates('sobragaFull', -1)}
              className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-all shadow-sm active:scale-90"
            >
              <Minus className="w-8 h-8" />
            </button>
            <span className="text-7xl font-black text-slate-950 dark:text-slate-100 tracking-tighter italic">{crates.sobragaFull}</span>
            <button 
              onClick={() => updateCrates('sobragaFull', 1)}
              className="p-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-500 transition-all shadow-sm active:scale-90"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>

          <button 
            onClick={handleExchange}
            className="w-full bg-slate-950 dark:bg-emerald-600 text-white py-6 rounded-[2.5rem] font-black shadow-2xl hover:opacity-90 transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            <Truck className="w-6 h-6 text-emerald-500 dark:text-white" />
            Lancer Échange SOBRAGA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Consignes;
