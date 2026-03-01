
import React, { useState, useRef } from 'react';
import { Settings as SettingsType, User as UserType, StaffMember, UserRole, Store as StoreType } from '../types';
import { db } from '../db';
import { 
  Building2, 
  Save, 
  Store,
  ShoppingCart,
  Upload,
  Camera,
  Wallet,
  Zap,
  Droplets,
  Users,
  LogOut,
  Database,
  RefreshCcw,
  FileJson,
  Type,
  UserPlus,
  X,
  Trash2,
  KeyRound,
  User as UserIcon,
  CircleCheck,
  Smartphone,
  Download,
  ShieldAlert,
  Sun,
  Moon,
  ShieldCheck,
  Eye,
  EyeOff,
  QrCode,
  Wifi,
  PackageCheck,
  Printer,
  FileText,
  Phone,
  Hash,
  Type as TypeIcon,
  BellRing
} from 'lucide-react';

interface SettingsProps {
  settings: SettingsType;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
  store: StoreType;
  setStore: React.Dispatch<React.SetStateAction<StoreType>>;
  user: UserType;
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  onLogout: () => void;
  onSaveSuccess: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, store, setStore, user, staff, setStaff, onLogout, onSaveSuccess }) => {
  const [logoPreview, setLogoPreview] = useState<string | undefined>(settings.logoUrl);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showActivationCode, setShowActivationCode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        products: await db.products.toArray(),
        sales: await db.sales.toArray(),
        staff: await db.staff.toArray(),
        pendingOrders: await db.pendingOrders.toArray(),
        metadata: await db.metadata.toArray(),
        exportDate: new Date().toISOString(),
        version: "2.6"
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BistroGest_Backup_${settings.bistroName}_${new Date().toISOString().split('T')[0]}.bistro`;
      link.click();
      
      // Mettre à jour la date de dernière sauvegarde
      setSettings(prev => ({ ...prev, lastBackupDate: Date.now() }));
    } catch (error) {
      alert("Erreur lors de l'exportation des données.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!confirm("Attention : l'importation va écraser vos données actuelles. Continuer ?")) return;
        await (db as any).transaction('rw', [db.products, db.sales, db.staff, db.pendingOrders, db.metadata], async () => {
          await db.products.clear(); await db.products.bulkAdd(data.products || []);
          await db.sales.clear(); await db.sales.bulkAdd(data.sales || []);
          await db.staff.clear(); await db.staff.bulkAdd(data.staff || []);
          await db.pendingOrders.clear(); await db.pendingOrders.bulkAdd(data.pendingOrders || []);
          await db.metadata.clear(); await db.metadata.bulkAdd(data.metadata || []);
        });
        alert("Importation réussie ! L'application va redémarrer.");
        window.location.reload();
      } catch (err) {
        alert("Fichier de sauvegarde invalide.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetApp = async () => {
    const code = prompt("TAPEZ 'EFFACER' POUR RÉINITIALISER TOUT LE LOGICIEL (Action irréversible)");
    if (code === 'EFFACER') {
      await (db as any).delete();
      localStorage.clear();
      alert("Application réinitialisée. Fermeture...");
      window.location.reload();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setStore(prev => ({
      ...prev,
      activationCode: formData.get('activationCode') as string
    }));

    setSettings(prev => ({
      ...prev,
      bistroName: formData.get('bistroName') as string,
      bistroSlogan: formData.get('bistroSlogan') as string,
      bistroPhone: formData.get('bistroPhone') as string,
      nifNumber: formData.get('nifNumber') as string,
      ownerName: formData.get('ownerName') as string,
      ownerEmail: formData.get('ownerEmail') as string,
      managerName: formData.get('managerName') as string,
      location: formData.get('location') as string,
      theme: formData.get('theme') as 'light' | 'dark',
      tvaRate: Number(formData.get('tvaRate')),
      logoUrl: logoPreview,
      receiptFooterMessage: formData.get('receiptFooterMessage') as string,
      logoFontSize: Number(formData.get('logoFontSize')),
      monthlyRent: Number(formData.get('monthlyRent')),
      monthlyManagerSalary: Number(formData.get('monthlyManagerSalary')),
      monthlyElectricity: Number(formData.get('monthlyElectricity')),
      monthlyWater: Number(formData.get('monthlyWater')),
      appSubscription: Number(formData.get('appSubscription')),
      monthlyWifi: Number(formData.get('monthlyWifi')),
      monthlyCanal: Number(formData.get('monthlyCanal')),
      monthlyDjSalary: Number(formData.get('monthlyDjSalary')),
      paymentRemindersEnabled: formData.get('paymentRemindersEnabled') === 'on',
      daysBeforeReminder: Number(formData.get('daysBeforeReminder'))
    }));
    
    alert("Configurations enregistrées !");
    onSaveSuccess();
  };

  const handleStaffSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    if (!editingStaff && staff.some(s => s.username === username)) {
      alert("Cet identifiant est déjà utilisé par un autre serveur.");
      return;
    }
    const staffData: StaffMember = {
      id: editingStaff?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      username: username,
      accessCode: formData.get('accessCode') as string,
      role: formData.get('role') as string,
      isActive: editingStaff ? editingStaff.isActive : true,
      totalSalesGenerated: editingStaff?.totalSalesGenerated || 0,
      performance: editingStaff?.performance || {
        attendance: 5,
        salesSkills: 5,
        clientSatisfaction: 5,
        honesty: 5,
        complaints: 0,
        lastEvaluation: new Date().toISOString()
      }
    };
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? staffData : s));
    } else {
      setStaff(prev => [...prev, staffData]);
    }
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  const toggleStaffStatus = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const deleteStaff = (id: string) => {
    if (confirm("Supprimer définitivement ce compte ?")) {
      setStaff(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic uppercase leading-none">Console <span className="text-emerald-600">Config</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 italic uppercase tracking-widest text-[10px]">Identité Établissement & Gestion Serveurs</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-3 bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-rose-500/10 hover:bg-rose-600 transition-all active:scale-95">
          <LogOut className="w-4 h-4" /> Se Déconnecter
        </button>
      </header>

      {/* Checklist Déploiement Client */}
      <div className="bg-indigo-900 text-white p-8 rounded-[3.5rem] shadow-2xl border-l-[12px] border-indigo-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Smartphone className="w-8 h-8 text-indigo-300" />
            <h4 className="text-xl font-black uppercase italic tracking-tighter">Guide de Déploiement Client</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { icon: Wifi, text: "Installation PWA (Offline)", sub: "Ajouter à l'écran d'accueil" },
               { icon: PackageCheck, text: "Saisie du Stock Initial", sub: "Produits & Consignes" },
               { icon: KeyRound, text: "Codes Accès Serveurs", sub: "4 chiffres par serveur" },
               { icon: QrCode, text: "QR Code Menu Tables", sub: "Espace Propriétaire > Publier" }
             ].map((item, i) => (
               <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/10">
                 <item.icon className="w-5 h-5 text-indigo-300 mb-2" />
                 <p className="text-[10px] font-black uppercase leading-tight mb-1">{item.text}</p>
                 <p className="text-[8px] opacity-60 font-bold uppercase">{item.sub}</p>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-600 text-white p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-8 border-amber-800">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
             <Database className="w-8 h-8 text-white" />
           </div>
           <div>
             <h4 className="text-xl font-black uppercase italic tracking-tighter">Maintenance & Données</h4>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Sauvegardez vos ventes et stocks avant de changer d'appareil.</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button onClick={handleExportData} type="button" disabled={isExporting} className="bg-white text-amber-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-lg active:scale-95 transition-all">
             {isExporting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Exporter (.bistro)
           </button>
           <button onClick={() => importInputRef.current?.click()} type="button" className="bg-amber-800 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-lg active:scale-95 transition-all">
             <FileJson className="w-4 h-4" /> Importer Sauvegarde
           </button>
           <input type="file" ref={importInputRef} onChange={handleImportData} className="hidden" accept=".bistro" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-8 md:p-12 space-y-12">
          
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-emerald-500">
               <ShieldCheck className="w-7 h-7" />
               <h5 className="text-lg font-black italic uppercase text-slate-900 dark:text-white leading-none">Interface & Thème</h5>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`relative flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${settings.theme === 'light' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400'}`}>
                <input type="radio" name="theme" value="light" defaultChecked={settings.theme === 'light'} className="hidden" onChange={() => setSettings(s => ({...s, theme: 'light'}))} />
                <Sun className={`w-6 h-6 ${settings.theme === 'light' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="font-black uppercase tracking-widest text-[10px]">Mode Jour (Clair)</span>
                {settings.theme === 'light' && <CircleCheck className="absolute top-4 right-4 w-5 h-5" />}
              </label>

              <label className={`relative flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${settings.theme === 'dark' ? 'bg-slate-800 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400'}`}>
                <input type="radio" name="theme" value="dark" defaultChecked={settings.theme === 'dark'} className="hidden" onChange={() => setSettings(s => ({...s, theme: 'dark'}))} />
                <Moon className={`w-6 h-6 ${settings.theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="font-black uppercase tracking-widest text-[10px]">Mode Nuit (Sombre)</span>
                {settings.theme === 'dark' && <CircleCheck className="absolute top-4 right-4 w-5 h-5" />}
              </label>
            </div>
          </div>

          <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-emerald-500">
               <Store className="w-7 h-7" />
               <h5 className="text-lg font-black italic uppercase text-slate-900 dark:text-white leading-none">Établissement & Identité</h5>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2rem] bg-emerald-600 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                  {logoPreview && logoPreview !== 'DEFAULT_CART_GREEN' ? (
                    <img src={logoPreview} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                  ) : (
                    <ShoppingCart className="w-12 h-12 text-white" />
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <input type="file" ref={fileInputRef} onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onloadend = () => setLogoPreview(reader.result as string);
                     reader.readAsDataURL(file);
                   }
                }} accept="image/*" className="hidden" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nom du Snack</label>
                    <input name="bistroName" defaultValue={settings.bistroName} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Localisation</label>
                    <input name="location" defaultValue={settings.location} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-indigo-500">
               <Printer className="w-7 h-7" />
               <h5 className="text-lg font-black italic uppercase text-slate-900 dark:text-white leading-none">Personnalisation Ticket</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Slogan de l'Enseigne</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                      <input name="bistroSlogan" defaultValue={settings.bistroSlogan} placeholder="Ex: La meilleure Regab de LBV" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 pl-10 rounded-xl font-bold outline-none focus:border-indigo-500" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Téléphone (Ticket)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                      <input name="bistroPhone" defaultValue={settings.bistroPhone} placeholder="Ex: 066 00 00 00" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 pl-10 rounded-xl font-bold outline-none focus:border-indigo-500" />
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Numéro NIF / RCCM</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      <input name="nifNumber" defaultValue={settings.nifNumber} placeholder="Ex: NIF 123456 A" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 pl-10 rounded-xl font-bold outline-none focus:border-emerald-500" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Message de fin de ticket</label>
                    <div className="relative">
                      <X className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                      <input name="receiptFooterMessage" defaultValue={settings.receiptFooterMessage} placeholder="Ex: MERCI ET À BIENTÔT !" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 pl-10 rounded-xl font-bold outline-none focus:border-rose-500" />
                    </div>
                 </div>
              </div>

              <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                      <TypeIcon className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Taille police du Nom (Si pas de logo image)</label>
                       <div className="flex items-center gap-4">
                         <input name="logoFontSize" type="range" min="12" max="42" defaultValue={settings.logoFontSize || 24} className="flex-1 accent-indigo-500" />
                         <span className="w-12 text-center font-black text-indigo-600">{settings.logoFontSize || 24}px</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-rose-500">
               <KeyRound className="w-7 h-7" />
               <h5 className="text-lg font-black italic uppercase text-slate-900 dark:text-white leading-none">Sécurité Propriétaire</h5>
            </div>
            
            <div className="bg-rose-50 dark:bg-rose-950/20 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30">
              <div className="max-w-md">
                <label className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest block mb-4">Code Secret d'Accès (6 Chiffres)</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                  <input 
                    name="activationCode" 
                    type={showActivationCode ? "text" : "password"}
                    maxLength={6}
                    defaultValue={store.activationCode} 
                    className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 p-4 pl-14 pr-12 rounded-xl font-black text-2xl tracking-[0.5em] text-rose-600 outline-none focus:border-rose-500" 
                  />
                  <button type="button" onClick={() => setShowActivationCode(!showActivationCode)} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-500">
                    {showActivationCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-indigo-500">
                 <Users className="w-7 h-7" />
                 <h5 className="text-lg font-black italic uppercase text-slate-900 dark:text-white leading-none">Gestion des Accès Serveurs</h5>
              </div>
              <button type="button" onClick={() => { setEditingStaff(null); setIsStaffModalOpen(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 active:scale-95">
                <UserPlus className="w-4 h-4" /> Ajouter un compte
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.map(s => (
                <div key={s.id} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${s.isActive ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 grayscale opacity-60'}`}>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center font-black text-indigo-500 shadow-sm">{s.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black uppercase text-slate-900 dark:text-white leading-none mb-1 italic">{s.name}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID: {s.username}</span>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Code: {s.accessCode}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button type="button" onClick={() => toggleStaffStatus(s.id)} className={`p-2 rounded-lg transition-all ${s.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>{s.isActive ? <CircleCheck className="w-5 h-5" /> : <X className="w-5 h-5" />}</button>
                      <button type="button" onClick={() => { setEditingStaff(s); setIsStaffModalOpen(true); }} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><TypeIcon className="w-5 h-5" /></button>
                      <button type="button" onClick={() => deleteStaff(s.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4 text-rose-500">
               <Wallet className="w-7 h-7" />
               <h5 className="text-lg font-black italic uppercase text-slate-900 dark:text-white leading-none">Charges Fixes (FCFA / Mois)</h5>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: 'Loyer', name: 'monthlyRent', icon: Building2 },
                  { label: 'Salaires Totaux', name: 'monthlyManagerSalary', icon: Users },
                  { label: 'SEEG Élec', name: 'monthlyElectricity', icon: Zap },
                  { label: 'SEEG Eau', name: 'monthlyWater', icon: Droplets },
                  { label: 'Internet', name: 'monthlyWifi', icon: Wifi },
                  { label: 'Canal+', name: 'monthlyCanal', icon: Smartphone },
                  { label: 'DJ / Animation', name: 'monthlyDjSalary', icon: Users },
                ].map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1 italic">{field.label}</label>
                    <input name={field.name} type="number" defaultValue={(settings as any)[field.name]} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl font-black text-emerald-600 outline-none" />
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl">
                      <BellRing className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <h6 className="text-sm font-black uppercase italic text-slate-900 dark:text-white">Rappels de Paiement</h6>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Alerte automatique avant l'échéance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Activer</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input name="paymentRemindersEnabled" type="checkbox" defaultChecked={settings.paymentRemindersEnabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-black text-slate-500 uppercase px-2">Prévenir</span>
                      <input name="daysBeforeReminder" type="number" min="1" max="15" defaultValue={settings.daysBeforeReminder || 3} className="w-12 bg-transparent text-center font-black text-rose-500 outline-none" />
                      <span className="text-[10px] font-black text-slate-500 uppercase px-2">jours avant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 flex flex-col sm:flex-row gap-4">
            <button type="submit" className="flex-1 bg-emerald-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-700 transition-all active:scale-95">
              <Save className="w-6 h-6" /> Enregistrer les réglages
            </button>
            <button type="button" onClick={handleResetApp} className="bg-rose-500/10 text-rose-600 px-8 py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all">
              <ShieldAlert className="w-5 h-5" /> Remise à Zéro
            </button>
          </div>
        </div>
      </form>

      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsStaffModalOpen(false)}></div>
           <form onSubmit={handleStaffSave} className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                 <h3 className="text-xl font-black italic uppercase tracking-tighter">{editingStaff ? 'Modifier' : 'Nouveau'} <span className="text-indigo-500">Compte Serveur</span></h3>
                 <button type="button" onClick={() => setIsStaffModalOpen(false)} className="p-2 text-slate-400"><X /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom complet du serveur</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="name" required defaultValue={editingStaff?.name} placeholder="Ex: Moussa Obiang" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl font-bold outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifiant Unique (Username)</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input name="username" required defaultValue={editingStaff?.username} placeholder="Ex: moussa241" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl font-bold outline-none uppercase" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Code Secret (4 chiffres)</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <input name="accessCode" type="password" maxLength={4} required defaultValue={editingStaff?.accessCode} placeholder="Ex: 0000" className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 p-4 pl-12 rounded-2xl font-black text-2xl tracking-[0.8em] outline-none text-emerald-600 text-center" />
                      </div>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3">
                   <Save className="w-5 h-5" /> Confirmer le compte
                 </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
