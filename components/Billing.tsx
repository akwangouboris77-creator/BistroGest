
import React, { useState } from 'react';
import { Store, SubscriptionTier } from '../types';
import { 
  Smartphone, 
  CheckCircle2, 
  ChevronLeft,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

interface BillingProps {
  store: Store;
  onUpdateTier: (tier: SubscriptionTier, codes?: { activation: string, staff: string }) => void;
  onBack?: () => void;
}

const Billing: React.FC<BillingProps> = ({ store, onUpdateTier, onBack }) => {
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCodes, setShowCodes] = useState(false);

  const plans = [
    { id: 'starter', name: 'Starter', price: '4 900', features: ['1 Boutique', 'Caisse Mobile Money'], color: 'from-slate-700 to-slate-900' },
    { id: 'pro', name: 'Pro Business', price: '9 900', features: ['Stock illimité', 'Rapports CSV', 'Multi-utilisateurs'], color: 'from-blue-600 to-blue-800' },
    { id: 'enterprise', name: 'Entreprise', price: '24 900', features: ['Conseiller IA (Booster CA)', 'Notation Personnel', 'Charges Fixes (SEEG/Loyer)', 'Multi-Boutiques'], color: 'from-emerald-600 to-emerald-800' }
  ];

  const handlePayment = () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      alert("Saisissez un numéro Airtel/Moov valide.");
      return;
    }
    setIsProcessing(true);
    
    // Génération aléatoire des codes pour la démo
    // Le code établissement à 6 chiffres est renouvelé après paiement
    const activation = Math.floor(100000 + Math.random() * 900000).toString();
    const staff = Math.floor(1000 + Math.random() * 9000).toString();

    setTimeout(() => {
      setIsProcessing(false);
      setShowPayModal(false);
      onUpdateTier(selectedPlan.id, { activation, staff });
      alert(`Souscription réussie ! Votre code établissement a été renouvelé pour 30 jours : ${activation}`);
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 font-black text-[10px] uppercase tracking-widest transition-all mb-4">
             <ChevronLeft className="w-4 h-4" /> Retour Dashboard
          </button>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Gestion <span className="text-emerald-500">Licence</span></h2>
        </div>
      </header>

      {/* SECTION CODES ACTUELS */}
      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Clés de Sécurité</h3>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Vos codes d'accès confidentiels</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex-1 min-w-[200px]">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-2">CODE ÉTABLISSEMENT</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white tracking-[0.2em]">{showCodes ? store.activationCode : '••••••'}</span>
                <button onClick={() => setShowCodes(!showCodes)} className="p-2 text-slate-400 hover:text-white">{showCodes ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex-1 min-w-[200px]">
              <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-2">CODE SERVEURS</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white tracking-[0.2em]">{showCodes ? store.staffAccessCode : '••••'}</span>
                <button className="p-2 text-slate-400 hover:text-white"><Copy className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <div key={plan.id} className={`p-10 rounded-[3.5rem] border transition-all flex flex-col relative ${store.tier === plan.id ? 'bg-gradient-to-br ' + plan.color + ' text-white scale-105 shadow-2xl border-transparent' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white opacity-80'}`}>
            {store.tier === plan.id && <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-emerald-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border-2 border-emerald-500">Plan Actif</span>}
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{plan.name}</h3>
            <div className="flex items-baseline gap-2 mb-10">
              <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
              <span className="text-sm font-bold opacity-70">F/mois</span>
            </div>
            <ul className="space-y-4 mb-12 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-tight">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => { setSelectedPlan(plan); setShowPayModal(true); }} disabled={store.tier === plan.id} className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${store.tier === plan.id ? 'bg-emerald-800 text-emerald-200 opacity-50' : 'bg-slate-950 dark:bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 active:scale-95'}`}>Choisir ce forfait</button>
          </div>
        ))}
      </div>

      {showPayModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in" onClick={() => !isProcessing && setShowPayModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 animate-in zoom-in border dark:border-slate-800 shadow-2xl">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-4">Paiement Sécurisé</h3>
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Gabon Mobile Money Gateway</p>
            
            <div className="space-y-6">
              <div className="relative">
                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input type="tel" placeholder="066 / 077 / 062..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent p-6 pl-14 rounded-2xl font-black text-xl outline-none focus:border-emerald-500" />
              </div>
              
              <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Lock className="w-5 h-5" />}
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
