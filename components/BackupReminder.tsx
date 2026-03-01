
import React from 'react';
import { ShieldAlert, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BackupReminderProps {
  lastBackupDate?: number;
  salesCount: number;
  onExport: () => void;
}

const BackupReminder: React.FC<BackupReminderProps> = ({ lastBackupDate, salesCount, onExport }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // On suggère une sauvegarde si :
    // 1. Aucune sauvegarde n'a jamais été faite
    // 2. La dernière sauvegarde date de plus de 3 jours
    // 3. Il y a plus de 50 nouvelles ventes (approximatif ici pour la démo)
    
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    const needsBackup = !lastBackupDate || (Date.now() - lastBackupDate > threeDaysInMs);
    
    if (needsBackup) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastBackupDate]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
        >
          <div className="bg-slate-900 border border-amber-500/30 rounded-[2rem] p-6 shadow-2xl shadow-amber-500/10 flex items-center gap-6">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Sécurité des données</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">
                Vous n'avez pas sauvegardé vos données récemment. Exportez votre journal pour éviter toute perte.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { onExport(); setIsVisible(false); }}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                title="Sauvegarder maintenant"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-3 bg-slate-800 text-slate-500 rounded-xl hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackupReminder;
