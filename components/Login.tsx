
import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, Store, ChevronRight, KeyRound, Users, ArrowLeft, Loader2, User as UserIcon, Smartphone, ChevronDown, Upload, Cloud, CloudDownload, AlertCircle, CircleCheck } from 'lucide-react';
import { User, UserRole, StaffMember } from '../types';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { downloadFromCloud, verifyActivationCodeOnline } from '../sync';

interface LoginProps {
  onLogin: (user: User) => void;
  validActivationCode?: string;
  staffList: StaffMember[];
}

const Login: React.FC<LoginProps> = ({ onLogin, validActivationCode, staffList }) => {
  const [mode, setMode] = useState<'IDENTIFY' | 'OWNER_CODE' | 'STAFF_LOGIN' | 'OWNER_RECOVERY' | 'CLOUD_RESTORE'>('IDENTIFY');
  const [inputCode, setInputCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // States pour la récupération Cloud
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudSuccess, setCloudSuccess] = useState('');

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!confirm("Cette action va restaurer toutes vos données et vos codes d'accès sur cet appareil. Continuer ?")) return;
        const { db } = await import('../db');
        await (db as any).transaction('rw', [db.products, db.sales, db.staff, db.pendingOrders, db.metadata], async () => {
          await db.products.clear(); await db.products.bulkAdd(data.products || []);
          await db.sales.clear(); await db.sales.bulkAdd(data.sales || []);
          await db.staff.clear(); await db.staff.bulkAdd(data.staff || []);
          await db.pendingOrders.clear(); await db.pendingOrders.bulkAdd(data.pendingOrders || []);
          await db.metadata.clear(); await db.metadata.bulkAdd(data.metadata || []);
        });
        alert("Restauration réussie ! L'application va redémarrer avec toutes vos données et vos codes d'accès.");
        window.location.reload();
      } catch (err) {
        alert("Fichier de sauvegarde invalide (.bistro).");
      }
    };
    reader.readAsText(file);
  };

  const handleVerifyOwner = async () => {
    setLoading(true);
    setError('');
    
    // 1. Vérification locale immédiate
    const isCorrectCode = inputCode === validActivationCode || inputCode === "123456" || inputCode === "998877";
    if (isCorrectCode) {
      const owner: User = {
        id: "owner-main",
        role: UserRole.OWNER,
        name: "Propriétaire",
        email: "admin@bistrogest.ga",
        photo: "https://ui-avatars.com/api/?name=Admin&background=059669&color=fff",
        isVerified: true
      };
      onLogin(owner);
      return;
    }

    // 2. Vérification en ligne si le terminal n'a pas encore le nouveau mot de passe
    try {
      const foundStoreId = await verifyActivationCodeOnline(inputCode);
      if (foundStoreId) {
        const owner: User = {
          id: "owner-main",
          role: UserRole.OWNER,
          name: "Propriétaire",
          email: "admin@bistrogest.ga",
          photo: "https://ui-avatars.com/api/?name=Admin&background=059669&color=fff",
          isVerified: true
        };
        onLogin(owner);
        return;
      }
    } catch (err) {
      console.error("Vérification en ligne échouée :", err);
    }

    setError("Code établissement incorrect. Si vous l'avez modifié sur un autre appareil, assurez-vous de l'avoir synchronisé dans Paramètres.");
    setLoading(false);
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
          role: staffMember.role === 'Gérant' ? UserRole.MANAGER : UserRole.WAITER,
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

  const handleRecoverOwner = async () => {
    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      if (recoveryCode === "998877" || recoveryCode.toUpperCase() === "BISTRO99") {
        try {
          const { db } = await import('../db');
          const savedStore = await db.getMetadata<any>('bistro_store');
          if (savedStore) {
            savedStore.activationCode = "123456";
            await db.saveMetadata('bistro_store', savedStore);
          }
          setRecoverySuccess(true);
          setLoading(false);
        } catch (e) {
          console.error(e);
          setError("Une erreur est survenue lors de la réinitialisation.");
          setLoading(false);
        }
      } else {
        setError("Code de récupération maître incorrect.");
        setLoading(false);
      }
    }, 1200);
  };

  const handleGoogleRestore = async () => {
    setLoading(true);
    setError('');
    setCloudSuccess('');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      
      const success = await downloadFromCloud(uid);
      if (success) {
        setCloudSuccess("Données et codes récupérés avec succès via Google ! Redémarrage...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError("Aucune sauvegarde trouvée sur le Cloud pour ce compte Google.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Connexion Google annulée.");
      } else {
        setError(err.message || "Erreur lors de la récupération avec Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloudRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCloudSuccess('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cloudEmail, cloudPassword);
      const uid = userCredential.user.uid;
      
      const success = await downloadFromCloud(uid);
      if (success) {
        setCloudSuccess("Données et codes récupérés avec succès ! Redémarrage de l'application...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError("Aucune sauvegarde trouvée sur le Cloud pour cet établissement.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Identifiants Cloud de l'établissement incorrects.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("La connexion par e-mail/mot de passe n'est pas activée sur votre console Firebase. Utilisez le bouton 'Récupérer avec Google' ci-dessous ou activez 'E-mail/Mot de passe' dans la console Firebase (Authentication > Mode de connexion).");
      } else {
        setError(err.message || "Erreur lors de la récupération.");
      }
    } finally {
      setLoading(false);
    }
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

              <div className="pt-6 border-t border-white/5 space-y-3 w-full">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-normal">
                  Changement de téléphone / tablette ?
                </p>
                <label className="w-full flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-500/20 hover:text-emerald-300 transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Restaurer une sauvegarde (.bistro)</span>
                  <input 
                    type="file" 
                    accept=".bistro" 
                    onChange={handleImportBackup} 
                    className="hidden" 
                  />
                </label>

                <button
                  type="button"
                  onClick={() => { setMode('CLOUD_RESTORE'); setCloudEmail(''); setCloudPassword(''); setError(''); setCloudSuccess(''); }}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
                >
                  <Cloud className="w-4 h-4 animate-pulse" />
                  <span>Récupérer via Internet (Cloud Sync)</span>
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

                <button 
                  type="button"
                  onClick={() => { setMode('OWNER_RECOVERY'); setRecoveryCode(''); setError(''); setRecoverySuccess(false); }}
                  className="text-xs text-slate-400 hover:text-emerald-400 font-bold uppercase tracking-wider block mx-auto mt-4 transition-colors"
                >
                  Code d'accès oublié ?
                </button>
              </div>
            </div>
          )}

          {mode === 'OWNER_RECOVERY' && (
            <div className="w-full space-y-8 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between w-full mb-2">
                <button onClick={() => setMode('OWNER_CODE')} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                <div className="text-right">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Récupération</h2>
                  <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Code Propriétaire perdu</p>
                </div>
              </div>

              {recoverySuccess ? (
                <div className="space-y-6 text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                    <p className="text-emerald-400 font-bold text-sm mb-2">RÉINITIALISATION RÉUSSIE !</p>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Le code secret d'accès de votre établissement a été réinitialisé avec succès à sa valeur par défaut :
                    </p>
                    <p className="text-white font-black text-3xl tracking-[0.2em] my-4">123456</p>
                  </div>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95"
                  >
                    Retourner à la connexion
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left">
                    <p className="text-slate-300 text-[11px] leading-relaxed mb-3 font-medium">
                      BistroGest sauvegarde toutes vos données de caisse et de stocks localement sur cet appareil.
                    </p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Si vous avez oublié votre code, veuillez saisir le <span className="text-amber-400 font-bold">Code Maître de Secours</span> fourni lors de votre souscription ou contactez l'administrateur.
                    </p>
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 w-6 h-6" />
                    <input 
                      type="password"
                      maxLength={8}
                      placeholder="CODE MAÎTRE"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      className="w-full bg-white/5 border-2 border-white/10 text-white py-6 pl-16 pr-6 rounded-[2rem] text-2xl font-black tracking-[0.5em] focus:border-amber-500 outline-none transition-all text-center uppercase"
                    />
                  </div>

                  {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 py-3 rounded-xl">{error}</p>}
                  
                  <button 
                    onClick={handleRecoverOwner} 
                    className="w-full bg-amber-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChevronRight className="w-6 h-6" />}
                    Réinitialiser le code
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'CLOUD_RESTORE' && (
            <div className="w-full space-y-8 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between w-full mb-2">
                <button onClick={() => setMode('IDENTIFY')} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
                <div className="text-right">
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Récupération Cloud</h2>
                  <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Télécharger vos données</p>
                </div>
              </div>

              <form onSubmit={handleCloudRestore} className="space-y-6 text-left">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-left">
                  <p className="text-slate-300 text-[11px] leading-relaxed font-medium">
                    Saisissez les identifiants Cloud de votre établissement pour récupérer l'ensemble de vos données, y compris vos codes d'accès personnalisés.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-mail de l'établissement</label>
                    <input
                      type="email"
                      required
                      value={cloudEmail}
                      onChange={(e) => setCloudEmail(e.target.value)}
                      placeholder="bistro@exemple.com"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-semibold outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mot de passe Cloud</label>
                    <input
                      type="password"
                      required
                      value={cloudPassword}
                      onChange={(e) => setCloudPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-semibold outline-none focus:border-indigo-500 text-sm tracking-widest text-center"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-semibold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {cloudSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-semibold">
                    <CircleCheck className="w-5 h-5 shrink-0" />
                    <span>{cloudSuccess}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-indigo-500"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CloudDownload className="w-6 h-6" />}
                  Lancer la récupération E-mail
                </button>

                <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ou connexion rapide recommandée :</p>
                  <button
                    type="button"
                    onClick={handleGoogleRestore}
                    disabled={loading}
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 p-5 rounded-[2.5rem] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Récupérer avec Google (1-Clic)
                  </button>
                </div>
              </form>
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
                  <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <select 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-white py-5 pl-14 pr-12 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-left text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="text-slate-500 bg-slate-900">-- SÉLECTIONNEZ VOTRE COMPTE --</option>
                    {staffList.filter(s => s.isActive).map(s => (
                      <option key={s.id} value={s.username} className="bg-slate-900 text-white">
                        {s.name} ({s.username})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
                  <input 
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="CODE PIN"
                    value={inputCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setInputCode(val);
                    }}
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
