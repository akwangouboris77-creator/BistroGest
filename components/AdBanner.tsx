
import React, { useState } from 'react';
import { X, Megaphone, ArrowRight, Smartphone, Sparkles } from 'lucide-react';

interface AdBannerProps {
  type?: 'airtel' | 'sobraga' | 'premium';
}

const AdBanner: React.FC<AdBannerProps> = ({ type = 'airtel' }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const content = {
    airtel: {
      title: "Boostez vos revenus !",
      desc: "Devenez point de retrait Airtel Money directement dans votre snack.",
      cta: "En savoir plus",
      icon: Smartphone,
      gradient: "from-rose-600 to-rose-900",
      accent: "bg-rose-500"
    },
    sobraga: {
      title: "Promo SOBRAGA",
      desc: "10 casiers achetés = 1 casier de Regab offert ce weekend !",
      cta: "Voir l'offre",
      icon: Sparkles,
      gradient: "from-amber-500 to-orange-700",
      accent: "bg-amber-400"
    },
    premium: {
      title: "BistroGest Cloud",
      desc: "Synchronisez vos stocks sur plusieurs téléphones en temps réel.",
      cta: "Essayer 7 jours",
      icon: Megaphone,
      gradient: "from-emerald-600 to-teal-900",
      accent: "bg-emerald-400"
    }
  }[type];

  const Icon = content.icon;

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r ${content.gradient} p-6 mb-10 shadow-2xl animate-in slide-in-from-top-4 duration-1000 group`}>
      {/* Decorative shapes */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 ${content.accent} rounded-2xl flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-12 transition-transform`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
              {content.title}
            </h4>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest max-w-md">
              {content.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2">
            {content.cta} <ArrowRight className="w-3 h-3" />
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
