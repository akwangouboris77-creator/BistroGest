
import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, Store, ChevronRight, KeyRound, Users, ArrowLeft, Loader2, User as UserIcon, Smartphone } from 'lucide-react';
import { User, UserRole, StaffMember } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  validActivationCode?: string;
  staffList: StaffMember[];
}

const Login: React.FC<LoginProps> = ({ onLogin, validActivationCode, staffList }) => {
  const [mode, setMode] = useState<'IDENTIFY' | 'OWNER_CODE' | 'STAFF_LOGIN'>('IDENTIFY');
  const [inputCode, setInputCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOwner = () => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      if (inputCode === (validActivationCode || "123456")) {
        const owner: User = {
          id: "owner-main",
          role: UserRole.OWNER,
          name: "Propriétaire",
          email: "admin@bistrogest.ga",
          photo: "https://ui-avatars.com/api/?name=Admin&background=059669&color=fff",
          isVerified: true
        };
        onLogin(owner);
      } else {
        setError("Code établissement incorrect.");
        setLoading(false);
      }
    }, 1000);
  };

  const handleVerifyStaff = () => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const staffMember = staffList.find(s => 
        s.username.toLowerCase() === username.toLowerCase() && 
        s.accessCode === inputCode &&
        s.isActive
      );

      if (staffMember) {
        const waiter: User = {
          id: staffMember.id,
          role: UserRole.WAITER,
          name: staffMember.name,
          email: `${staffMember.username}@bistrogest.ga`,
          photo: `https://ui-avatars.com/api/?name=${staffMember.name}&background=6366f1&color=fff`,
          isVerified: true
        };
        onLogin(waiter);
      } else {
        setError("Identifiant ou code incorrect (ou compte désactivé).");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-10 shadow-2xl flex flex-col items-center text-center">
          
          <div className="bg-emerald-600 p-5 rounded-[2rem] shadow-2xl mb-8">
            <ShoppingCart className="w-10 h-10 text-white" />
          </div>

          {mode === 'IDENTIFY' && (
            <div className="space-y-8 w-full animate-in slide-in-from-bottom-4">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
                  Bistro<span className="text-emerald-500">Gest</span>
                </h1>
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest leading-relaxed">
                  Système de gestion certifié Gabon
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => { setMode('OWNER_CODE'); setInputCode(''); setError(''); }}
                  className="w-full bg-white text-slate-900 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-50 transition-all active:scale-95 shadow-xl"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Accès Propriétaire
                </button>

                <button 
                  onClick={() => { setMode('STAFF_LOGIN'); setUsername(''); setInputCode(''); setError(''); }}
                  className="w-full bg-white/5 border border-white/10 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white/10 transition-all active:scale-95"
                >
                  <Users className="w-5 h-5 text-indigo-500" />
                  Accès Serveurs
                </button>
              </div>
            </div>
          )}

          {mode === 'OWNER_CODE' && (
            <div className="w-full space-y-8 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between w-full mb-2">
                <button onClick={() => setMode('IDENTIFY')} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                <div className="text-right">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Code Établissement</h2>
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Identification Propriétaire</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
                  <input 
                    type="password"
                    maxLength={6}
                    placeholder="CODE 6 CHIFFRES"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full bg-white/5 border-2 border-white/10 text-white py-6 pl-16 pr-6 rounded-[2rem] text-2xl font-black tracking-[0.5em] focus:border-emerald-500 outline-none transition-all text-center"
                  />
                </div>
                {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 py-3 rounded-xl">{error}</p>}
                <button onClick={handleVerifyOwner} className="w-full bg-emerald-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                  Valider
                </button>
              </div>
            </div>
          )}

          {mode === 'STAFF_LOGIN' && (
            <div className="w-full space-y-8 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between w-full mb-2">
                <button onClick={() => setMode('IDENTIFY')} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                <div className="text-right">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Connexion Serveur</h2>
                  <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest">Session Individuelle</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text"
                    placeholder="IDENTIFIANT (USERNAME)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white py-5 pl-14 pr-6 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all uppercase text-sm"
                  />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
                  <input 
                    type="password"
                    maxLength={4}
                    placeholder="CODE PIN"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white py-5 pl-14 pr-6 rounded-2xl font-black tracking-[0.8em] outline-none focus:border-indigo-500 transition-all text-center text-xl"
                  />
                </div>
                {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 py-3 rounded-xl">{error}</p>}
                <button onClick={handleVerifyStaff} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                  Ouvrir ma session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
