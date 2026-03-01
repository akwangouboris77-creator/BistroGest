
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  Edit2, 
  Trash2,
  X,
  Save,
  BellRing,
  ChevronLeft,
  AlertCircle,
  Camera,
  Upload,
  Settings,
  Tags,
  Info
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onBack: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, categories, setCategories, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock <= p.threshold);

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setImagePreview(product?.image);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      costPrice: Number(formData.get('costPrice')),
      stock: Number(formData.get('stock')),
      threshold: Number(formData.get('threshold')),
      hasConsigne: formData.get('hasConsigne') === 'on',
      category: formData.get('category') as string,
      image: imagePreview
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts(prev => [...prev, productData]);
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview(undefined);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      alert("Cette catégorie existe déjà.");
      return;
    }
    setCategories(prev => [...prev, newCategoryName.trim()]);
    setNewCategoryName('');
  };

  const removeCategory = (cat: string) => {
    if (products.some(p => p.category === cat)) {
      alert("Impossible de supprimer cette catégorie : des produits l'utilisent encore.");
      return;
    }
    setCategories(prev => prev.filter(c => c !== cat));
  };

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
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase italic">Stock & <span className="text-emerald-600 dark:text-emerald-500">Catalogue</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic text-xs uppercase tracking-widest">Gestion des approvisionnements</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-4 rounded-2xl font-black shadow-sm hover:bg-slate-200 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <Tags className="w-5 h-5" />
            Catégories
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-emerald-600 dark:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            <Plus className="w-5 h-5" />
            Nouveau Produit
          </button>
        </div>
      </header>

      {lowStockProducts.length > 0 && (
        <div className="bg-rose-600 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-rose-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/20">
              <BellRing className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-xl font-black uppercase tracking-tighter italic">Attention : Stocks Critiques</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Il y a {lowStockProducts.length} article(s) à racheter d'urgence.</p>
            </div>
          </div>
          <AlertCircle className="hidden md:block w-12 h-12 opacity-20" />
        </div>
      )}

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher par nom..."
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Produit</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">P. Achat</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">P. Vente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">En Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map(product => {
                const isLow = product.stock <= product.threshold;
                return (
                  <tr key={product.id} className={`transition-all group border-l-4 ${isLow ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-600' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-transparent'}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner transition-transform group-hover:scale-110 overflow-hidden ${isLow && !product.image ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            product.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-black uppercase italic tracking-tighter text-base leading-none ${isLow ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                              {product.name}
                            </p>
                            {isLow && (
                              <span className="flex items-center gap-1 bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                                <AlertTriangle className="w-2.5 h-2.5" /> Bas
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-500 dark:text-slate-400 italic">
                      {product.costPrice?.toLocaleString()} <span className="text-[8px]">F</span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-950 dark:text-slate-100 text-lg">
                      {product.price.toLocaleString()} <span className="text-[10px] text-slate-400">F</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-xl font-black px-4 py-1.5 rounded-2xl border ${isLow ? 'text-white bg-rose-600 border-rose-400 shadow-lg shadow-rose-500/30 animate-bounce-short' : 'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                          {product.stock}
                        </span>
                        {isLow && <span className="text-[8px] font-black text-rose-500 mt-1 uppercase tracking-tighter">Seuil: {product.threshold}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(product)} className="p-3 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all border border-transparent hover:border-emerald-100">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-3 text-slate-400 hover:text-rose-600 rounded-2xl transition-all border border-transparent hover:border-rose-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300 border dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic uppercase">
                {editingProduct ? 'Modifier' : 'Ajouter'} <span className="text-emerald-600 dark:text-emerald-500">Produit</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl transition-all text-slate-400 border border-slate-100 dark:border-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="relative w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-300" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Photo du produit</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Nom du produit</label>
                  <input name="name" required defaultValue={editingProduct?.name} placeholder="ex: Regab 65cl" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold focus:border-emerald-500 outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Prix de Vente (TTC)</label>
                    <input name="price" type="number" required defaultValue={editingProduct?.price} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold focus:border-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1">
                      Prix d'Achat Unitaire <span className="text-[8px] opacity-70 italic">(Coût)</span>
                    </label>
                    <input name="costPrice" type="number" required defaultValue={editingProduct?.costPrice} className="w-full bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold focus:border-amber-500 outline-none" />
                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase flex items-center gap-1">
                      <Info className="w-2 h-2" /> Sert au calcul du bénéfice réel
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Catégorie</label>
                    <div className="flex gap-2">
                      <select name="category" defaultValue={editingProduct?.category || categories[0]} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold outline-none appearance-none">
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Stock Initial</label>
                    <input name="stock" type="number" required defaultValue={editingProduct?.stock} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Seuil Alerte</label>
                    <input name="threshold" type="number" required defaultValue={editingProduct?.threshold || 6} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold outline-none" />
                  </div>
                  <label className="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 cursor-pointer">
                    <input name="hasConsigne" type="checkbox" defaultChecked={editingProduct?.hasConsigne} className="w-6 h-6 accent-amber-600" />
                    <span className="font-black text-amber-900 dark:text-amber-400 uppercase text-[10px]">SOBRAGA (Vides)</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-950 dark:bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save className="w-5 h-5" />
                {editingProduct ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Categories Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 border dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic uppercase">
                Gérer les <span className="text-emerald-600">Catégories</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl transition-all text-slate-400 border border-slate-100 dark:border-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nouvelle catégorie..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-5 text-slate-900 dark:text-slate-100 font-bold outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={handleAddCategory}
                  className="bg-emerald-600 text-white px-6 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs tracking-widest">{cat}</span>
                    <button 
                      onClick={() => removeCategory(cat)}
                      className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full bg-slate-950 dark:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
