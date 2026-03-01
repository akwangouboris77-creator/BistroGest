
import React from 'react';
import { BellRing, CreditCard, X, ChevronRight, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from '../types';

interface PaymentRemindersProps {
  settings: Settings;
}

const PaymentReminders: React.FC<PaymentRemindersProps> = ({ settings }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [reminders, setReminders] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!settings.paymentRemindersEnabled) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Prochain 1er du mois
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const diffTime = nextMonthDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const daysBefore = settings.daysBeforeReminder || 3;

    if (diffDays <= daysBefore) {
      const activeReminders = [];
      if (settings.monthlyRent > 0) activeReminders.push('Loyer');
      if (settings.monthlyManagerSalary > 0) activeReminders.push('Salaires');
      if (settings.monthlyElectricity > 0) activeReminders.push('Facture SEEG Élec');
      if (settings.monthlyWater > 0) activeReminders.push('Facture SEEG Eau');
      if (settings.monthlyWifi > 0) activeReminders.push('Abonnement Internet');
      
      if (activeReminders.length > 0) {
        setReminders(activeReminders);
        setIsVisible(true);
      }
    }
  }, [settings]);

  if (!isVisible || reminders.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="fixed top-24 right-6 z-[100] w-full max-w-xs"
      >
        <div className="bg-white dark:bg-slate-900 border border-rose-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="bg-rose-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellRing className="w-5 h-5 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Échéances Proches</span>
            </div>
            <button onClick={() => setIsVisible(false)} className="text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
              Les charges suivantes arrivent à échéance dans quelques jours :
            </p>
            
            <div className="space-y-2">
              {reminders.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase italic">{r}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase">Total Estimé</span>
                  <span className="text-sm font-black text-rose-600 italic">
                    {(settings.monthlyRent + settings.monthlyManagerSalary + settings.monthlyElectricity + settings.monthlyWater + settings.monthlyWifi).toLocaleString()} F
                  </span>
                </div>
                <button className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg active:scale-95 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentReminders;
