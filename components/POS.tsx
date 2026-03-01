import React, { useState, useMemo } from 'react';
import { Product, Sale, PaymentMethod, PaymentStatus, Settings, PendingOrder, StaffMember } from '../types';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Loader2, 
  Search, 
  Bell, 
  X,
  ChevronLeft,
  User as UserIcon,
  CheckCircle,
  Hash,
  GlassWater,
  Utensils,
  UserCheck,
  ShieldCheck,
  Printer,
  ShoppingBag,
  Tag,
  MapPin,
  Receipt,
  AlertCircle,
  ShoppingBasket
} from 'lucide-react';
import { printReceipt } from './ReceiptPrinter';

interface POSProps {
  products: Product[];
  categories: string[];
  onSale: (sale: Sale) => void;
  salesCount: number;
  managerName: string;
  settings: Settings;
  onBack: () => void;
  pendingOrders: PendingOrder[];
  onValidatePending: (id: string) => void;
  staff: StaffMember[];
}

const POS: React.FC<POSProps> = ({ products, categories, onSale, salesCount, managerName, settings, onBack, pendingOrders, onValidatePending, staff }) => {
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [waiterName, setWaiterName] = useState(managerName);
  const [showTableInput, setShowTableInput] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Tous' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const addToCart = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod || prod.stock <= (cart[id] || 0)) return;
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

  const deleteFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[id];
      return newCart;
    });
  };

  const loadPendingOrder = (order: PendingOrder) => {
    const newCart: { [id: string]: number } = {};
    order.items.forEach(item => { newCart[item.productId] = item.quantity; });
    setCart(newCart);
    setCustomerName(order.customerName);
    setTableNumber(order.tableNumber);
    setWaiterName(order.waiterName || managerName);
    onValidatePending(order.id);
    setShowPending(false);
    setIsCartOpen(true);
  };

  const cartTotal = Object.entries(cart).reduce((acc: number, [id, qty]) => {
    const prod = products.find(p => p.id === id);
    return acc + (prod ? prod.price * (qty as number) : 0);
  }, 0);

  // Added explicit types to prevent unknown type errors on '+' and '>' operators
  // Fix: Cast the result of Object.values(cart).reduce to number to avoid "unknown" type errors.
  const cartQuantity = Object.values(cart).reduce((a: number, b: number) => a + b, 0) as number;

  const createSaleObject = (): Sale => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `CMD-${(salesCount + 1).toString().padStart(3, '0')}`,
      storeId: '',
      timestamp: new Date().toISOString(),
      items: Object.entries(cart).map(([id, qty]) => {
        const prod = products.find(p => p.id === id)!;
        return { 
          productId: id, 
          productName: prod.name, 
          category: prod.category, 
          quantity: qty as number, 
          price: prod.price, 
          unitCost: prod.costPrice 
        };
      }),
      subtotal: cartTotal / (1 + (settings.tvaRate / 100)),
      tvaAmount: cartTotal - (cartTotal / (1 + (settings.tvaRate / 100))),
      total: cartTotal,
      totalCost: Object.entries(cart).reduce((acc: number, [id, qty]) => {
        const prod = products.find(p => p.id === id)!;
        return acc + (prod.costPrice * (qty as number));
      }, 0),
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.SUCCESS,
      managedBy: waiterName || managerName,
      customerName,
      tableNumber
    };
  };

  const handlePrintDraft = () => {
    if (cartTotal === 0) return;
    const sale = createSaleObject();
    printReceipt(sale, settings);
  };

  const handleCheckout = async () => {
    if (cartTotal === 0) return;
    setIsProcessing(true);
    
    const sale = createSaleObject();

    setTimeout(() => {
      onSale(sale);
      setIsProcessing(false);
      setCart({});
      setCustomerName('');
      setTableNumber('');
      setWaiterName(managerName);
      setIsCartOpen(false);
    }, 800);
  };

  const TicketView = () => (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 text-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5 relative">
      {/* Header Panier: Style Ticket Moderne */}
      <div className="p-8 bg-slate-800/50 dark:bg-slate-900/40 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Fix: Explicitly cast cartQuantity to number for the comparison to avoid type errors. */}
            <div className={`p-4 rounded-2xl ${(cartQuantity as number) > 0 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-700'}`}>
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Panier Client</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ticket #{(salesCount + 1).toString().padStart(3, '0')}</p>
            </div>
          </div>
          <button 
            onClick={() => confirm("Vider le panier ?") && setCart({})} 
            disabled={(cartQuantity as number) === 0}
            className="w-11 h-11 flex items-center justify-center bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-20 active:scale-90"
            title="Vider le panier"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Info Table & Client: Affichage compact */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
             <MapPin className="w-4 h-4 text-indigo-400" />
             <div className="flex flex-col overflow-hidden">
               <span className="text-[8px] font-black text-slate-500 uppercase">Emplacement</span>
               <span className="text-xs font-black uppercase text-indigo-100 truncate">{tableNumber || 'À définir'}</span>
             </div>
          </div>
          <div className="flex-1 bg-white/5 p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
             <UserIcon className="w-4 h-4 text-emerald-400" />
             <div className="flex flex-col overflow-hidden">
               <span className="text-[8px] font-black text-slate-500 uppercase">Client</span>
               <span className="text-xs font-black uppercase text-emerald-100 truncate">{customerName || 'Comptoir'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Liste des Articles: Interaction Tactile Optimisée */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {/* Fix: Explicitly cast cartQuantity to number for the comparison. */}
        {(cartQuantity as number) === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
            <ShoppingBasket className="w-16 h-16 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest leading-loose">Aucun article sélectionné<br/>Veuillez scanner ou cliquer</p>
          </div>
        ) : (
          Object.entries(cart).map(([id, qty]) => {
            const p = products.find(prod => prod.id === id)!;
            return (
              <div key={id} className="bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 p-4 transition-all animate-in slide-in-from-right-4">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-black uppercase italic text-white truncate leading-tight">{p.name}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black italic text-emerald-400">{(p.price * (qty as number)).toLocaleString()} F</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl ring-1 ring-white/10">
                    <button 
                      onClick={() => removeFromCart(id)} 
                      className="w-10 h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-rose-500 transition-all active:scale-90 shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black w-10 text-center text-white">{qty as number}</span>
                    <button 
                      onClick={() => addToCart(id)} 
                      disabled={p.stock <= (cart[id] || 0)}
                      className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-500 transition-all active:scale-90 disabled:opacity-10 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => deleteFromCart(id)}
                    className="p-3 text-slate-500 hover:text-rose-500 transition-colors"
                    title="Supprimer la ligne"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: Totaux et Encaissement */}
      <div className="p-8 bg-slate-950/90 border-t border-white/10 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-15px_40px_rgba(0,0,0,0.5)]">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest px-2">
            <span>Articles ({(cartQuantity as number)})</span>
            <span>{(cartTotal / (1 + (settings.tvaRate / 100))).toLocaleString()} F</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-widest px-2">
            <span>TVA {settings.tvaRate}%</span>
            <span>{(cartTotal - (cartTotal / (1 + (settings.tvaRate / 100)))).toLocaleString()} F</span>
          </div>
          <div className="pt-4 mt-2 border-t border-white/5 flex flex-col items-center">
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] italic mb-1">Montant Net à Payer</span>
             <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black italic tracking-tighter text-white">{cartTotal.toLocaleString()}</span>
                <span className="text-lg font-black text-emerald-500">FCFA</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={handlePrintDraft}
            disabled={(cartQuantity as number) === 0}
            className="w-full py-4.5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-20"
          >
            <Printer className="w-5 h-5 text-indigo-400" />
            Imprimer la Note (Proforma)
          </button>

          <button 
            onClick={handleCheckout} 
            disabled={(cartQuantity as number) === 0 || isProcessing}
            className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-4 text-sm disabled:opacity-20 group"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <ShieldCheck className="w-7 h-7 group-hover:scale-110 transition-transform" />
            )}
            {isProcessing ? "Validation..." : "Encaisser la vente"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[600px] animate-in slide-in-from-bottom-4 duration-500 flex flex-col lg:grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md z-20 py-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-500 transition-all shadow-sm active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
               <h2 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">Caisse Snack</h2>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Vente directe</p>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

            <div className="relative">
              {!showTableInput ? (
                <button 
                  onClick={() => setShowTableInput(true)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${tableNumber ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
                >
                  <MapPin className={`w-4 h-4 ${tableNumber ? 'text-white' : 'text-indigo-500'}`} />
                  {tableNumber ? `Table ${tableNumber}` : 'Localiser'}
                </button>
              ) : (
                <div className="flex items-center gap-2 animate-in zoom-in duration-200 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-xl border border-indigo-500">
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-indigo-500" />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="N°" 
                      value={tableNumber} 
                      onChange={e => setTableNumber(e.target.value)}
                      onBlur={() => !tableNumber && setShowTableInput(false)}
                      onKeyDown={e => e.key === 'Enter' && setShowTableInput(false)}
                      className="w-20 bg-transparent py-3 pl-8 pr-2 text-[11px] font-black uppercase outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <button onClick={() => setShowTableInput(false)} className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg active:scale-90"><CheckCircle className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => setShowPending(true)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all relative ${pendingOrders.length > 0 ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
          >
            <Bell className="w-4 h-4" /> Commandes Mobiles
            {pendingOrders.length > 0 && <span className="absolute -top-2 -right-2 bg-rose-600 text-white w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow-lg font-black text-[11px]">{pendingOrders.length}</span>}
          </button>
        </header>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une boisson ou un plat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.8rem] py-5 pl-14 pr-6 shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-bold outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-select">
             {['Tous', ...categories].map(cat => (
               <button 
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-7 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map(p => {
            const inCart = cart[p.id] || 0;
            const isOutOfStock = p.stock <= inCart;
            return (
              <button 
                key={p.id} 
                onClick={() => addToCart(p.id)} 
                disabled={isOutOfStock}
                className={`p-4 bg-white dark:bg-slate-900 rounded-[2.2rem] border text-left transition-all active:scale-95 relative overflow-hidden group shadow-sm hover:shadow-xl flex flex-col ${inCart > 0 ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className="aspect-square w-full rounded-[1.8rem] mb-4 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 overflow-hidden relative shadow-inner">
                  {p.image ? (
                    <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={p.name} />
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      {p.category === 'Boisson' ? <GlassWater className="w-12 h-12 text-indigo-500" /> : <Utensils className="w-12 h-12 text-rose-500" />}
                    </div>
                  )}
                  {inCart > 0 && (
                    <div className="absolute inset-0 bg-emerald-600/10 backdrop-blur-[1px] flex items-center justify-center">
                       <div className="bg-emerald-600 text-white w-14 h-14 rounded-3xl flex items-center justify-center font-black text-xl shadow-2xl border-4 border-white/20 animate-in zoom-in">
                        {inCart}
                       </div>
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                       <AlertCircle className="w-6 h-6 text-rose-500 mb-2" />
                       <span className="text-[9px] font-black text-white uppercase tracking-widest text-center">Rupture</span>
                    </div>
                  )}
                </div>
                <div className="px-2 flex-1">
                  <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic leading-tight mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">{p.name}</h4>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-sm font-black text-emerald-600 tracking-tighter italic">{p.price.toLocaleString()} F</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${p.stock <= p.threshold ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {p.stock} dispo
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-4 h-[calc(100vh-140px)] sticky top-28">
        <TicketView />
      </div>

      {/* Fix: Explicitly cast cartQuantity to number for the comparison. */}
      {(cartQuantity as number) > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="lg:hidden fixed bottom-28 right-6 bg-emerald-600 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 z-40 border-4 border-white/20 active:scale-90"
        >
          <div className="relative">
            <ShoppingCart className="w-8 h-8" />
            <span className="absolute -top-3 -right-3 bg-rose-500 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border-4 border-white">
              {(cartQuantity as number)}
            </span>
          </div>
          <div className="text-left leading-none">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Commande</p>
            <p className="font-black italic text-2xl tracking-tighter">{cartTotal.toLocaleString()} F</p>
          </div>
        </button>
      )}

      {showPending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex flex-col">
                <h3 className="text-3xl font-black italic uppercase text-slate-900 dark:text-white leading-none">Commandes Mobiles</h3>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Prêtes à être encaissées</span>
              </div>
              <button onClick={() => setShowPending(false)} className="p-4 bg-white dark:bg-slate-700 rounded-2xl text-slate-500 hover:text-rose-500 transition-all shadow-sm border border-slate-100 dark:border-slate-600 active:scale-90"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-5 max-h-[60vh] custom-scrollbar">
              {pendingOrders.map(order => (
                <div key={order.id} className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-6 hover:border-emerald-500 transition-all group shadow-sm">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20">Table {order.tableNumber}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate">{order.customerName}</h4>
                    <div className="mt-4 flex flex-wrap gap-2">
                       {order.items.slice(0, 3).map((it, idx) => (
                         <span key={idx} className="text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">{it.quantity}x {it.productName}</span>
                       ))}
                       {order.items.length > 3 && <span className="text-[9px] font-black text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl">+{order.items.length - 3} plus</span>}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-center sm:items-end gap-5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-5 sm:pt-0 sm:pl-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center sm:text-right">Total Commande</span>
                      <span className="text-3xl font-black italic text-slate-900 dark:text-white tracking-tighter">{order.total.toLocaleString()} F</span>
                    </div>
                    <button onClick={() => loadPendingOrder(order)} className="w-full bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl hover:bg-emerald-500 active:scale-95 transition-all">
                      <ShoppingCart className="w-5 h-5" /> Encaisser
                    </button>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="py-24 text-center opacity-10 flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Bell className="w-12 h-12" />
                  </div>
                  <p className="font-black uppercase tracking-[0.4em] text-sm italic">Aucun appel mobile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden animate-in slide-in-from-bottom-full duration-500">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 h-[92vh] rounded-t-[4rem] overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-t border-white/20">
             <div className="h-1.5 w-20 bg-white/30 rounded-full absolute top-4 left-1/2 -translate-x-1/2 z-50"></div>
             <TicketView />
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;