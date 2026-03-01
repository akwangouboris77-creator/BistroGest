
import React, { useState } from 'react';
import { StaffMember, SubscriptionTier, StaffPerformance } from '../types';
import { 
  Users, 
  UserPlus, 
  Star, 
  ChevronLeft, 
  Lock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  ShieldCheck,
  UserX,
  X,
  Save,
  UserCircle,
  // Fix: Added missing icons for the updated form
  Smartphone,
  KeyRound
} from 'lucide-react';

interface StaffManagementProps {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  storeTier: SubscriptionTier;
  onBack: () => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, setStaff, storeTier, onBack }) => {
  const isEnterprise = storeTier === 'enterprise';
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fix: Added username and accessCode to newStaff state
  const [newStaff, setNewStaff] = useState({ name: '', username: '', accessCode: '', role: 'Serveur' });

  const updateStaffPerformance = (id: string, criteria: keyof StaffPerformance, value: number) => {
    if (!isEnterprise) return;
    setStaff(prev => prev.map(s => s.id === id ? {
      ...s,
      performance: { ...s.performance, [criteria]: value, lastEvaluation: new Date().toISOString() }
    } : s));
  };

  const deleteStaff = (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce membre du personnel ?")) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.username.trim() || !newStaff.accessCode.trim()) return;

    // Fix: Added username and accessCode to meet StaffMember interface requirements
    const staffMember: StaffMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStaff.name,
      username: newStaff.username,
      accessCode: newStaff.accessCode,
      role: newStaff.role,
      isActive: true,
      totalSalesGenerated: 0,
      performance: {
        attendance: 5,
        salesSkills: 5,
        clientSatisfaction: 5,
        honesty: 5,
        complaints: 0,
        lastEvaluation: new Date().toISOString()
      }
    };

    setStaff(prev => [...prev, staffMember]);
    setIsModalOpen(false);
    setNewStaff({ name: '', username: '', accessCode: '', role: 'Serveur' });
  };

  const RatingStars = ({ value, onRate }: { value: number, onRate: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button 
          key={star} 
          onClick={() => onRate(star)}
          className={`transition-all ${star <= value ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`}
        >
          <Star className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 font-black text-[10px] uppercase tracking-widest transition-all mb-4">
             <ChevronLeft className="w-4 h-4" /> Retour Dashboard
          </button>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Gestion <span className="text-indigo-500">Personnel</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 italic text-xs uppercase tracking-widest">Évaluation des serveurs et performance</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/10 hover:bg-indigo-700 transition-all flex items-center gap-3"
        >
          <UserPlus className="w-5 h-5" /> Ajouter un Serveur
        </button>
      </header>

      {!isEnterprise && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-amber-500 p-4 rounded-2xl text-white">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-lg font-black italic uppercase text-slate-900 dark:text-white tracking-tighter">Évaluation avancée bloquée</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Passez au plan Entreprise pour noter l'honnêteté et l'assiduité.</p>
            </div>
          </div>
          <button className="bg-slate-950 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">En savoir plus</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map(member => (
          <div key={member.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl flex flex-col group relative overflow-hidden transition-all hover:border-indigo-500">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center font-black text-2xl text-slate-400">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none mb-1">{member.name}</h4>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">{member.role}</p>
                <div className="mt-2 flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{member.isActive ? 'En service' : 'Absent'}</span>
                </div>
              </div>
              <button onClick={() => deleteStaff(member.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Ventes Générées</p>
                 <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">{member.totalSalesGenerated.toLocaleString()} F</span>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                 </div>
              </div>

              <div className={`space-y-4 ${!isEnterprise ? 'opacity-20 pointer-events-none' : ''}`}>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Assiduité</span>
                    <RatingStars value={member.performance.attendance} onRate={(v) => updateStaffPerformance(member.id, 'attendance', v)} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vente Suggestive</span>
                    <RatingStars value={member.performance.salesSkills} onRate={(v) => updateStaffPerformance(member.id, 'salesSkills', v)} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Satisfaction Client</span>
                    <RatingStars value={member.performance.clientSatisfaction} onRate={(v) => updateStaffPerformance(member.id, 'clientSatisfaction', v)} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Honnêteté / Caisse</span>
                    <RatingStars value={member.performance.honesty} onRate={(v) => updateStaffPerformance(member.id, 'honesty', v)} />
                 </div>
                 
                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <AlertCircle className="w-4 h-4 text-amber-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.performance.complaints} Plainte(s)</span>
                    </div>
                    <button className="text-[9px] font-black text-indigo-500 uppercase hover:underline">Voir l'historique</button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout de personnel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                Nouveau <span className="text-indigo-500">Collaborateur</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-400 border border-slate-100 dark:border-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.8rem] flex items-center justify-center text-indigo-500 border-2 border-dashed border-indigo-200 dark:border-indigo-800">
                  <UserCircle className="w-10 h-10" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil du serveur</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Nom complet</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Jean-Paul Obiang"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>

                {/* Fix: Added username field to the form */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Identifiant (Username)</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: jp241"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-5 text-slate-900 dark:text-white font-bold outline-none focus:border-indigo-500 transition-colors uppercase" 
                    />
                  </div>
                </div>

                {/* Fix: Added accessCode field to the form */}
                <div>
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block px-1">Code PIN (4 chiffres)</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input 
                      type="password" 
                      required 
                      maxLength={4}
                      placeholder="Ex: 1234"
                      value={newStaff.accessCode}
                      onChange={(e) => setNewStaff({...newStaff, accessCode: e.target.value})}
                      className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl py-4 pl-12 pr-5 text-emerald-600 font-black tracking-[0.8em] text-xl outline-none focus:border-emerald-500 transition-colors text-center" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Fonction / Rôle</label>
                  <select 
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer focus:border-indigo-500"
                  >
                    <option value="Serveur">Serveur / Serveuse</option>
                    <option value="Barman">Barman</option>
                    <option value="Plongeur">Plongeur / Plongeuse</option>
                    <option value="Sécurité">Sécurité / Vigile</option>
                    <option value="Manager">Manager Adjoint</option>
                    <option value="Cuisinier">Cuisinier / Snack-maker</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!newStaff.name.trim() || !newStaff.username.trim() || !newStaff.accessCode.trim()}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/10 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Enregistrer le membre
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
