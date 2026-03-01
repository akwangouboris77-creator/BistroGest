
import React, { useState, useEffect } from 'react';
import { X, Globe, QrCode, Share2, Copy, CheckCircle2, Rocket, Smartphone, ShieldCheck, Loader2 } from 'lucide-react';

interface PublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bistroName: string;
}

const PublicationModal: React.FC<PublicationModalProps> = ({ isOpen, onClose, bistroName }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  // Générer le lien de menu basé sur l'URL actuelle
  const menuLink = `${window.location.origin}${window.location.pathname}#menu`;

  useEffect(() => {
    if (isOpen && !isPublished) {
      setIsPublishing(true);
      const timer = setTimeout(() => {
        setIsPublishing(false);
        setIsPublished(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(menuLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in duration-300">
        <div className="p-8 md:p-12 text-center">
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>

          {isPublishing ? (
            <div className="py-12 space-y-8">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                <Rocket className="absolute inset-0 m-auto w-10 h-10 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Publication en cours...</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Votre menu digital sécurisé est prêt</p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">Menu Activé !</h3>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-10">Votre établissement est prêt à recevoir des commandes</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Flash-Menu Client</span>
                  </div>
                  <div className="aspect-square bg-white rounded-2xl flex items-center justify-center border-2 border-slate-100 p-4">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuLink)}`} alt="QR Code" className="w-full h-full" />
                  </div>
                  <button className="w-full py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-200 dark:border-slate-600 shadow-sm hover:bg-slate-50 transition-all">
                    Imprimer le QR Code
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-5 h-5 text-indigo-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Lien Direct</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-4 overflow-hidden">
                      <span className="text-[8px] font-bold text-slate-500 truncate mr-2 italic">{menuLink}</span>
                      <button onClick={handleCopy} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg flex-shrink-0">
                        {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 leading-relaxed italic">
                      Partagez ce lien via WhatsApp ou affichez le QR code sur vos tables pour que les clients commandent.
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Statut: En Ligne</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-slate-950 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:opacity-90 transition-all"
              >
                Accéder au Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationModal;
