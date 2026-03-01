
import React, { useState, useMemo } from 'react';
import { Product, SaleItem, PendingOrder } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Send, 
  ChevronLeft, 
  CheckCircle, 
  Utensils, 
  GlassWater,
  Search,
  UserCheck,
  Smartphone,
  Info
} from 'lucide-react';

interface DigitalMenuProps {
  products: Product[];
  categories: string[];
  bistroName: string;
  onOrderSubmit: (order: PendingOrder) => void;
  onBack: () => void;
}

const DigitalMenu: React.FC<DigitalMenuProps> = ({ products, categories, bistroName, onOrderSubmit, onBack }) => {
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [showUssdNotification, setShowUssdNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Tous' || p.category === activeCategory;
      return matchesSearch && matchesCategory && p.stock > 0;
    });
  }, [products, searchQuery, activeCategory]);

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1;
      else delete newCart[id];
      return newCart;
    });
  };

  // Fix: Explicitly type reducer parameters to avoid unknown type errors in count calculation
  const cartItemsCount = Object.values(cart).reduce((a: number, b: number) => a + b, 0);
  
  // Fix: Explicitly type reducer accumulator to avoid unknown type errors in total calculation
  const cartTotal = Object.entries(cart).reduce((acc: number, [id, qty]) => {
    const p = products.find(prod => prod.id === id);
    return acc + (p ? p.price * (qty as number) : 0);
  }, 0);

  const handleSubmitOrder = () => {
    if (!customerName || !tableNumber || cartItemsCount === 0) return;

    const newOrder: PendingOrder = {
      id: Math.random().toString(36).substr(2, 9),
      customerName,
      tableNumber,
      waiterName: waiterName.trim() || undefined,
      items: Object.entries(cart).map(([id, qty]) => {
        const p = products.find(prod => prod.id === id)!;
        return { productId: id, productName: p.name, category: p.category, quantity: qty as number, price: p.price, unitCost: p.costPrice };
      }),
      timestamp: new Date().toISOString(),
      total: cartTotal,
      status: 'PENDING'
    };

    onOrderSubmit(newOrder);
    // On ne vide le panier qu'après la notification USSD
    setShowUssdNotification(true);
  };

  const isFormValid = customerName.trim().length >= 2 && tableNumber.trim().length > 0;

  const UssdNotification = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#f0f0f0] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-white/50 animate-in zoom-in duration-300">
        <div className="p-6 text-slate-900 font-mono text-sm leading-relaxed">
          <p className="font-bold mb-4">INFO SYSTEME :</p>
          <p className="mb-2">Commande envoyée avec succès au gérant.</p>
          <p className="mb-2">---------------------------</p>
          <p className="mb-1 uppercase font-bold">Ticket: {customerName}</p>
          <p className="mb-1 uppercase font-bold">Table: {tableNumber}</p>
          <p className="mb-1">Total à régler: <span className="font-bold">{cartTotal.toLocaleString()} FCFA</span></p>
          <p className="mb-4">---------------------------</p>
          <p className="mb-2 italic text-[11px]">Le serveur arrive pour la validation.</p>
        </div>
        <div className="bg-white border-t border-slate-300 flex">
          <button 
            onClick={() => {
              setCart({});
              setShowUssdNotification(false);
              onBack();
            }}
            className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-emerald-600 hover:bg-slate-50 transition-colors"
          >
            OK / FERMER
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-44 animate-in fade-in">
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none">{bistroName}</h1>
          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Menu Digital Officiel</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Smartphone className="w-5 h-5" /></div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* User Info Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Info className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informations de table</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Votre Nom</label>
              <input 
                type="text" 
                placeholder="Ex: M. Jean" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl p-3 text-xs font-bold outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Numéro Table</label>
              <input 
                type="text" 
                placeholder="Ex: T4" 
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-xl p-3 text-xs font-bold outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filter Area */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 shadow-sm outline-none text-sm font-bold"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-select">
            {['Tous', ...categories].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-950 text-white border-slate-950' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Products */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover" />
                ) : (
                  p.category === 'Boisson' ? <GlassWater className="w-7 h-7 text-blue-500" /> : <Utensils className="w-7 h-7 text-orange-500" />
                )}
              </div>
              <h4 className="text-[10px] font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-1 truncate w-full">{p.name}</h4>
              <p className="text-xs font-black text-emerald-600 mb-4">{p.price.toLocaleString()} F</p>
              
              {cart[p.id] ? (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl w-full justify-between border border-emerald-500/20">
                  <button onClick={() => removeFromCart(p.id)} className="w-7 h-7 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg flex items-center justify-center shadow-sm"><Minus className="w-3 h-3" /></button>
                  <span className="font-black text-[10px]">{cart[p.id]}</span>
                  <button onClick={() => addToCart(p.id)} className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md"><Plus className="w-3 h-3" /></button>
                </div>
              ) : (
                <button onClick={() => addToCart(p.id)} className="w-full py-2.5 bg-slate-950 dark:bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Ajouter</button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-center pb-8 lg:pb-4">
        <button 
          onClick={handleSubmitOrder}
          disabled={!isFormValid || cartItemsCount === 0}
          className={`w-full max-w-lg p-4 rounded-[2rem] shadow-2xl flex items-center justify-between transition-all active:scale-95 ${isFormValid && (cartItemsCount as number) > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center relative">
              <ShoppingCart className="w-5 h-5" />
              {(cartItemsCount as number) > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{(cartItemsCount as number)}</span>}
            </div>
            <div className="text-left leading-none">
              <p className="text-[9px] font-black uppercase tracking-widest mb-1">{!isFormValid ? 'Saisir nom + table' : 'Commander maintenant'}</p>
              <p className="text-lg font-black italic tracking-tighter">{cartTotal.toLocaleString()} FCFA</p>
            </div>
          </div>
          <Send className="w-5 h-5 mr-2" />
        </button>
      </div>

      {showUssdNotification && <UssdNotification />}
    </div>
  );
};

export default DigitalMenu;
