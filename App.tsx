
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Settings as SettingsIcon,
  LogOut,
  CreditCard,
  FileBarChart,
  ShieldAlert,
  CalendarDays,
  Menu as MenuIcon,
  X,
  User as UserIcon,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Product, Sale, CrateStock, Settings, User, UserRole, Store, SubscriptionTier, ActivityLog, PendingOrder, StaffMember } from './types';
import { db } from './db';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import SalesHistory from './components/SalesHistory';
import SettingsComponent from './components/Settings';
import Login from './components/Login';
import Billing from './components/Billing';
import BackupReminder from './components/BackupReminder';
import PaymentReminders from './components/PaymentReminders';
import DigitalMenu from './components/DigitalMenu';

const STORES: Store[] = [
  { 
    id: 'lbv-1', 
    name: 'Bistro Libreville HQ', 
    location: 'Glass, LBV', 
    tvaEnabled: true, 
    subscriptionStatus: 'ACTIVE', 
    tier: 'enterprise',
    activationCode: '123456',
    staffAccessCode: '2410',
    subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Regab 65cl', price: 600, costPrice: 450, stock: 48, threshold: 12, hasConsigne: true, category: 'Boisson' },
  { id: '2', name: 'Castel 65cl', price: 700, costPrice: 550, stock: 24, threshold: 6, hasConsigne: true, category: 'Boisson' },
  { id: '3', name: 'Coca-Cola 50cl', price: 500, costPrice: 350, stock: 36, threshold: 12, hasConsigne: false, category: 'Boisson' },
];

const INITIAL_STAFF: StaffMember[] = [
  { 
    id: 's1', 
    name: 'Moussa Nguema', 
    username: 'moussa241', 
    accessCode: '2410', 
    role: 'Serveur Principal', 
    isActive: true, 
    totalSalesGenerated: 0, 
    performance: { attendance: 5, salesSkills: 5, clientSatisfaction: 5, honesty: 5, complaints: 0, lastEvaluation: new Date().toISOString() } 
  }
];

const INITIAL_CATEGORIES = ['Boisson', 'Nourriture', 'Divers'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isDigitalMenu, setIsDigitalMenu] = useState(window.location.hash === '#menu');

  // États de l'application
  const [currentStore, setCurrentStore] = useState<Store>(STORES[0]);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [sales, setSales] = useState<Sale[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [crates, setCrates] = useState<CrateStock>({ sobragaEmpties: 0, sobragaFull: 0 });
  const [settings, setSettings] = useState<Settings>({
    bistroName: STORES[0].name,
    ownerName: 'Admin',
    ownerEmail: '',
    managerName: 'Gérant',
    location: STORES[0].location,
    theme: 'dark',
    tvaRate: 18,
    logoUrl: 'DEFAULT_CART_GREEN',
    monthlyRent: 0,
    monthlyElectricity: 0,
    monthlyWater: 0,
    monthlyWifi: 0,
    monthlyCanal: 0,
    monthlyDjSalary: 0,
    monthlyManagerSalary: 0,
    appSubscription: 0,
    installationDate: Date.now(),
    paymentRemindersEnabled: true,
    daysBeforeReminder: 3
  });

  // CHARGEMENT INITIAL DEPUIS INDEXEDDB
  useEffect(() => {
    const initData = async () => {
      try {
        const [
          savedStore,
          savedUser,
          savedProducts,
          savedStaff,
          savedCategories,
          savedSales,
          savedPending,
          savedCrates,
          savedSettings
        ] = await Promise.all([
          db.getMetadata<Store>('bistro_store'),
          db.getMetadata<User | null>('bistro_user'),
          db.products.toArray(),
          db.staff.toArray(),
          db.getMetadata<string[]>('bistro_categories'),
          db.sales.orderBy('timestamp').reverse().toArray(),
          db.pendingOrders.toArray(),
          db.getMetadata<CrateStock>('bistro_crates'),
          db.getMetadata<Settings>('bistro_settings')
        ]);

        if (savedStore) setCurrentStore(savedStore);
        if (savedUser) setUser(savedUser);
        
        if (savedProducts.length > 0) setProducts(savedProducts);
        else {
          await db.products.bulkPut(INITIAL_PRODUCTS);
          setProducts(INITIAL_PRODUCTS);
        }

        if (savedStaff.length > 0) setStaff(savedStaff);
        else {
          await db.staff.bulkPut(INITIAL_STAFF);
          setStaff(INITIAL_STAFF);
        }

        if (savedCategories) setCategories(savedCategories);
        if (savedSales) setSales(savedSales);
        if (savedPending) setPendingOrders(savedPending);
        if (savedCrates) setCrates(savedCrates);
        if (savedSettings) setSettings(savedSettings);

        setIsDataLoaded(true);
        // Cacher le splash screen après un court délai
        setTimeout(() => setShowSplash(false), 2000);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la DB locale:", error);
        setIsDataLoaded(true); 
      }
    };

    initData();

    const handleHashChange = () => {
      setIsDigitalMenu(window.location.hash === '#menu');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // PERSISTANCE AUTOMATIQUE DANS INDEXEDDB
  useEffect(() => {
    if (!isDataLoaded) return;
    
    db.saveMetadata('bistro_store', currentStore);
    db.saveMetadata('bistro_user', user);
    db.saveMetadata('bistro_categories', categories);
    db.saveMetadata('bistro_crates', crates);
    db.saveMetadata('bistro_settings', settings);
  }, [currentStore, user, categories, crates, settings, isDataLoaded]);

  // GESTION DU THÈME
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleNewSale = async (sale: Sale) => {
    const saleWithStore = { ...sale, storeId: currentStore.id };
    await db.sales.add(saleWithStore);
    const updatedProducts = products.map(p => {
      const sold = sale.items.find(i => i.productId === p.id);
      return sold ? { ...p, stock: p.stock - sold.quantity } : p;
    });
    for (const soldItem of sale.items) {
      const prod = updatedProducts.find(p => p.id === soldItem.productId);
      if (prod) await db.products.put(prod);
    }
    setSales(prev => [saleWithStore, ...prev]);
    setProducts(updatedProducts);
  };

  const handleUpdateProducts = (update: React.SetStateAction<Product[]>) => {
    setProducts(prev => {
      const next = typeof update === 'function' ? (update as (prev: Product[]) => Product[])(prev) : update;
      db.products.clear().then(() => db.products.bulkAdd(next));
      return next;
    });
  };

  const handleUpdateStaff = (update: React.SetStateAction<StaffMember[]>) => {
    setStaff(prev => {
      const next = typeof update === 'function' ? (update as (prev: StaffMember[]) => StaffMember[])(prev) : update;
      db.staff.clear().then(() => db.staff.bulkAdd(next));
      return next;
    });
  };

  const handleUpdateCategories = (update: React.SetStateAction<string[]>) => {
    setCategories(prev => {
      const next = typeof update === 'function' ? (update as (prev: string[]) => string[])(prev) : update;
      db.saveMetadata('bistro_categories', next);
      return next;
    });
  };

  const handleOrderSubmit = async (order: PendingOrder) => {
    await db.pendingOrders.add(order);
    setPendingOrders(prev => [...prev, order]);
  };

  const licenseInfo = useMemo(() => {
    if (!currentStore.subscriptionExpiryDate) return { daysRemaining: 30, isExpired: false };
    const expiryDate = new Date(currentStore.subscriptionExpiryDate).getTime();
    const diffTime = expiryDate - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, diffDays);
    return {
      daysRemaining,
      isExpired: daysRemaining <= 0 && currentStore.subscriptionStatus !== 'ACTIVE'
    };
  }, [currentStore.subscriptionExpiryDate, currentStore.subscriptionStatus]);

  const updateTierWithCodes = (tier: SubscriptionTier, codes?: { activation: string; staff: string }) => {
    setCurrentStore(prev => ({
      ...prev,
      tier,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      activationCode: codes?.activation || prev.activationCode,
      staffAccessCode: codes?.staff || prev.staffAccessCode
    }));
  };

  const goBack = () => setActiveTab('dashboard');

  if (showSplash || !isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
        </div>
        
        <div className="flex flex-col items-center gap-10 z-10">
          <div className="relative">
            <div className="w-32 h-32 bg-emerald-600 rounded-[3rem] flex items-center justify-center animate-bounce shadow-[0_0_50px_rgba(5,150,105,0.3)] overflow-hidden relative z-10">
               {settings.logoUrl && settings.logoUrl !== 'DEFAULT_CART_GREEN' ? (
                 <img src={settings.logoUrl} className="w-full h-full object-contain p-6" referrerPolicy="no-referrer" />
               ) : (
                 <ShoppingCart className="w-12 h-12 text-white" />
               )}
            </div>
            <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full animate-pulse"></div>
          </div>
          
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-white font-black uppercase tracking-[0.5em] text-2xl italic leading-none">BistroGest</h2>
              <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">Gabon Edition v2.6</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
              <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest animate-pulse">Sécurisation de la session...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isDigitalMenu) {
    return (
      <DigitalMenu 
        products={products}
        categories={categories}
        bistroName={settings.bistroName}
        onOrderSubmit={handleOrderSubmit}
        onBack={() => {
          window.location.hash = '';
          setIsDigitalMenu(false);
        }}
      />
    );
  }

  if (licenseInfo.isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full space-y-8 animate-in zoom-in">
          <div className="bg-rose-500/20 p-8 rounded-[3rem] border border-rose-500/30 flex flex-col items-center">
            <ShieldAlert className="w-20 h-20 text-rose-500 mb-6 animate-pulse" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Essai Terminé</h2>
            <p className="text-slate-400 font-medium text-sm mt-4 leading-relaxed uppercase tracking-widest">
              Votre période d'essai de 30 jours est expirée. Veuillez activer votre licence.
            </p>
          </div>
          <button onClick={() => setActiveTab('billing')} className="w-full bg-emerald-600 py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3">
            <CreditCard className="w-5 h-5" /> Activer Maintenant
          </button>
        </div>
      </div>
    );
  }

  if (!user || !user.isVerified) return (
    <Login 
      onLogin={(u) => { setUser(u); }} 
      validActivationCode={currentStore.activationCode}
      staffList={staff}
    />
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.OWNER, UserRole.MANAGER] },
    { id: 'pos', label: 'Caisse POS', icon: ShoppingCart, roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER] },
    { id: 'inventory', label: 'Stocks', icon: Package, roles: [UserRole.OWNER, UserRole.MANAGER] },
    { id: 'sales', label: 'Historique', icon: FileBarChart, roles: [UserRole.OWNER, UserRole.MANAGER] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 h-20 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
             {settings.logoUrl && settings.logoUrl !== 'DEFAULT_CART_GREEN' ? (
               <img src={settings.logoUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
             ) : (
               <ShoppingCart className="w-6 h-6 text-white" />
             )}
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">{settings.bistroName}</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">BistroGest v2.6 • Gabon</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          {currentStore.subscriptionStatus !== 'ACTIVE' && (
            <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-xl border border-indigo-500/20">
               <CalendarDays className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">{licenseInfo.daysRemaining}J restants</span>
            </div>
          )}

          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none">{user.name}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user.role}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-[110]" onClick={() => setIsMenuOpen(false)}></div>
              <div className="absolute top-[calc(100%+1rem)] right-0 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 z-[120] animate-in slide-in-from-top-4 fade-in duration-200">
                <div className="px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Active</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{user.name}</p>
                </div>
                <div className="space-y-1 mb-4">
                  {navItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1">
                  {user.role === UserRole.OWNER && (
                    <button onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <SettingsIcon className="w-5 h-5" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Réglages</span>
                    </button>
                  )}
                  <button onClick={() => setUser(null)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                    <LogOut className="w-5 h-5" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Quitter</span>
                  </button>
                  <button onClick={() => { setActiveTab('pos'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-emerald-500/20 mt-2 shadow-sm">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Accès Rapide Caisse</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 pt-24 px-6 lg:px-12 pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard products={products} sales={sales} crates={crates} settings={settings} store={currentStore} onUnlock={() => setActiveTab('billing')} onLogout={() => setUser(null)} staff={staff} />}
          {activeTab === 'pos' && (
            <POS 
              products={products} 
              categories={categories} 
              onSale={handleNewSale} 
              salesCount={sales.length} 
              managerName={settings.managerName} 
              settings={settings} 
              onBack={goBack} 
              pendingOrders={pendingOrders} 
              onValidatePending={async (id) => {
                await db.pendingOrders.delete(id);
                setPendingOrders(prev => prev.filter(o => o.id !== id));
              }} 
              staff={staff} 
            />
          )}
          {activeTab === 'inventory' && <Inventory products={products} setProducts={handleUpdateProducts} categories={categories} setCategories={handleUpdateCategories} onBack={goBack} />}
          {activeTab === 'sales' && <SalesHistory sales={sales} settings={settings} onBack={goBack} />}
          {activeTab === 'billing' && <Billing store={currentStore} onUpdateTier={updateTierWithCodes} onBack={goBack} />}
          {activeTab === 'settings' && (
            <SettingsComponent 
              settings={settings} 
              setSettings={setSettings} 
              store={currentStore}
              setStore={setCurrentStore}
              user={user} 
              staff={staff} 
              setStaff={handleUpdateStaff} 
              onLogout={() => setUser(null)} 
              onSaveSuccess={goBack} 
            />
          )}
        </div>
      </main>

      {user && user.role === UserRole.OWNER && (
        <BackupReminder 
          lastBackupDate={settings.lastBackupDate} 
          salesCount={sales.length} 
          onExport={() => setActiveTab('settings')} 
        />
      )}

      <PaymentReminders settings={settings} />
    </div>
  );
};

export default App;
