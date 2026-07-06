
import React, { useState } from 'react';
import { Product, Purchase, User } from '../types';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  Truck, 
  Calendar, 
  User as UserIcon, 
  Package, 
  DollarSign,
  X,
  Save,
  History,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

interface PurchasesProps {
  products: Product[];
  purchases: Purchase[];
  onAddPurchase: (purchase: Purchase) => void;
  onBack: () => void;
  currentUser: User | null;
}

const Purchases: React.FC<PurchasesProps> = ({ products, purchases, onAddPurchase, onBack, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [supplier, setSupplier] = useState('');

  const filteredPurchases = purchases.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplier && p.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const product = products.find(p => p.id === id);
    if (product) {
      setUnitCost(product.costPrice || 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const newPurchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      totalCost: Number(quantity) * Number(unitCost),
      supplier: supplier.trim() || 'Fournisseur Inconnu',
      timestamp: new Date().toISOString(),
      managedBy: currentUser?.name || 'Système'
    };

    onAddPurchase(newPurchase);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedProductId('');
    setQuantity(1);
    setUnitCost(0);
    setSupplier('');
  };

  const totalSpent = purchases.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack} 
            className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-sm active:scale-95 mb-4"
          >
             <ChevronLeft className="w-4 h-4" /> Retour Dashboard
          </button>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase italic">Approvisionnement <span className="text-emerald-600 dark:text-emerald-500">Fournisseurs</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic text-xs uppercase tracking-widest">Enregistrement des achats de stock</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Nouvel Achat
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Achats</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">{totalSpent.toLocaleString()} <span className="text-sm">F</span></p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
            <History className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opérations</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">{purchases.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Truck className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dernier Achat</p>
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[150px]">
              {purchases.length > 0 ? purchases[0].productName : 'Aucun'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher par produit ou fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-slate-100 transition-all"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Produit</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fournisseur</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Quantité</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Coût Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Géré par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPurchases.map(purchase => (
                <tr key={purchase.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                        {new Date(purchase.timestamp).toLocaleDateString()} {new Date(purchase.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{purchase.productName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{purchase.supplier}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-black text-slate-900 dark:text-white">+{purchase.quantity}</span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-emerald-600 dark:text-emerald-500">
                    {purchase.totalCost.toLocaleString()} F
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{purchase.managedBy}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic font-medium uppercase text-xs tracking-widest opacity-40">
                    Aucun enregistrement d'achat trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300 border dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic uppercase">
                Nouvel <span className="text-emerald-600 dark:text-emerald-500">Approvisionnement</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl transition-all text-slate-400 border border-slate-100 dark:border-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Produit à approvisionner</label>
                  <select 
                    required 
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold outline-none appearance-none"
                  >
                    <option value="">Sélectionner un produit...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Quantité achetée</label>
                    <input 
                      type="number" 
                      min="1" 
                      required 
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Coût Unitaire (F)</label>
                    <input 
                      type="number" 
                      min="0" 
                      required 
                      value={unitCost}
                      onChange={(e) => setUnitCost(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Fournisseur</label>
                  <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Ex: SOBRAGA, Grossiste X..." 
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-5 text-slate-900 dark:text-slate-100 font-bold outline-none" 
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total à payer</p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 italic tracking-tighter">{(quantity * unitCost).toLocaleString()} F</p>
                  </div>
                  <ArrowUpRight className="w-8 h-8 text-emerald-500 opacity-20" />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save className="w-5 h-5" />
                Enregistrer l'achat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
