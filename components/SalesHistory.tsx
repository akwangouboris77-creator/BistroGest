
import React, { useState } from 'react';
import { Sale, PaymentMethod, Settings } from '../types';
import { 
  Search, 
  Printer, 
  Wallet,
  Smartphone,
  ChevronLeft,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';
import { printReceipt } from './ReceiptPrinter';

interface SalesHistoryProps {
  sales: Sale[];
  settings: Settings;
  onBack: () => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, settings, onBack }) => {
  const [search, setSearch] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const filteredSales = sales.filter(sale => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      sale.transactionId?.toLowerCase().includes(searchLower) || 
      sale.orderNumber?.toLowerCase().includes(searchLower) ||
      sale.tableNumber?.toLowerCase().includes(searchLower) ||
      sale.customerName?.toLowerCase().includes(searchLower) ||
      sale.items.some(i => i.productName.toLowerCase().includes(searchLower));
    return matchesSearch;
  });

  const handlePrint = (sale: Sale) => {
    printReceipt(sale, settings);
  };

  const toggleExpand = (id: string) => {
    setExpandedSaleId(expandedSaleId === id ? null : id);
  };

  const exportToCSV = () => {
    if (filteredSales.length === 0) return;
    const headers = ["Date", "Heure", "Ticket", "Client", "Table", "Total_FCFA", "Paiement", "Caissier"];
    const rows = filteredSales.map(sale => {
      const d = new Date(sale.timestamp);
      return [
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        sale.orderNumber,
        sale.customerName || 'Comptoir',
        sale.tableNumber || '-',
        sale.total,
        sale.paymentMethod,
        sale.managedBy
      ].join(';');
    });
    const csvContent = "\ufeff" + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Ventes_${settings.bistroName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (filteredSales.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Veuillez autoriser les fenêtres surgissantes pour l'exportation.");
      return;
    }

    const rowsHtml = filteredSales.map(s => {
      const d = new Date(s.timestamp);
      return `
        <tr>
          <td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
          <td style="font-weight: bold;">${s.orderNumber}</td>
          <td>${s.customerName || 'Comptoir'} ${s.tableNumber ? `(T${s.tableNumber})` : ''}</td>
          <td>${s.paymentMethod}</td>
          <td style="text-align: right; font-weight: bold;">${s.total.toLocaleString()} F</td>
        </tr>
      `;
    }).join('');

    const totalPeriod = filteredSales.reduce((acc, curr) => acc + curr.total, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport Ventes - ${settings.bistroName}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; padding: 0; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-section h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #0f172a; }
            .logo-section p { margin: 5px 0 0; font-size: 12px; color: #64748b; }
            .report-title { text-align: right; }
            .report-title h2 { margin: 0; font-size: 18px; color: #10b981; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { text-align: left; background: #f8fafc; padding: 12px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; color: #64748b; font-size: 10px; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .summary { margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 15px; border: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
            .summary-item { text-align: right; }
            .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .summary-value { font-size: 28px; font-weight: 900; color: #0f172a; margin-top: 5px; }
            .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <h1>${settings.bistroName}</h1>
              <p>${settings.location} • GABON</p>
            </div>
            <div class="report-title">
              <h2>Rapport d'Activité</h2>
              <p style="font-size: 11px; margin-top: 5px;">Généré le ${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Ticket</th>
                <th>Client / Table</th>
                <th>Paiement</th>
                <th style="text-align: right;">Montant TTC</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          
          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Chiffre d'Affaire Total (Filtré)</div>
              <div class="summary-value">${totalPeriod.toLocaleString()} FCFA</div>
              <div style="font-size: 10px; color: #10b981; font-weight: bold; margin-top: 5px;">${filteredSales.length} Transactions validées</div>
            </div>
          </div>

          <div class="footer">
            Document généré par BistroGest Gabon - Système de gestion certifié.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Attendre un court instant pour que le rendu soit fini avant d'ouvrir la boîte d'impression
    setTimeout(() => {
      printWindow.print();
      // Optionnel: fermer la fenêtre après l'impression (certains navigateurs bloquent cela)
      // printWindow.close();
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">Journal des <span className="text-emerald-500">Ventes</span></h2>
          <p className="text-slate-400 font-medium text-[10px] mt-2 italic tracking-widest uppercase">Consultation et exportations des données</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={exportToPDF} 
            className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 hover:border-emerald-500 border border-transparent transition-all"
          >
            <FileText className="w-5 h-5 text-rose-500" /> PDF
          </button>
          <button 
            onClick={exportToCSV} 
            className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 hover:border-emerald-500 border border-transparent transition-all"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> CSV
          </button>
        </div>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un ticket, une table ou un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-6 w-16"></th>
                <th className="px-8 py-6">NUMÉRO TICKET</th>
                <th className="px-8 py-6">CLIENT / TABLE</th>
                <th className="px-8 py-6 text-center">MODE PAIEMENT</th>
                <th className="px-8 py-6 text-right">MONTANT TOTAL</th>
                <th className="px-8 py-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.map(sale => (
                <React.Fragment key={sale.id}>
                  <tr 
                    onClick={() => toggleExpand(sale.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-8 text-center">
                      {expandedSaleId === sale.id ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />}
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col leading-none">
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 italic uppercase">{sale.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{new Date(sale.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col leading-none">
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{sale.customerName || 'Vente Comptoir'}</span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 tracking-widest">{sale.tableNumber ? `Table ${sale.tableNumber}` : 'Sans Table'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center justify-center gap-2">
                         {sale.paymentMethod === PaymentMethod.CASH ? <Wallet className="w-4 h-4 text-emerald-500" /> : <Smartphone className="w-4 h-4 text-indigo-500" />}
                         <span className="text-[10px] font-black uppercase tracking-tight">{sale.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right font-black text-xl italic tracking-tighter text-slate-900 dark:text-slate-100">
                      {sale.total.toLocaleString()} F
                    </td>
                    <td className="px-8 py-8 text-center">
                       <button 
                          onClick={(e) => { e.stopPropagation(); handlePrint(sale); }} 
                          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                       >
                         <Printer className="w-4 h-4" /> Réimprimer
                       </button>
                    </td>
                  </tr>
                  
                  {expandedSaleId === sale.id && (
                    <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-l-4 border-l-emerald-500 animate-in slide-in-from-top-2">
                      <td colSpan={6} className="px-12 py-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-inner">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Package className="w-4 h-4 text-emerald-500" /> Détail de la commande
                          </h4>
                          <div className="space-y-4">
                            {sale.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                <div className="flex items-center gap-4">
                                  <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-black text-[10px]">{item.quantity}x</span>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{item.productName}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{item.category}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-black text-slate-900 dark:text-white italic">{(item.quantity * item.price).toLocaleString()} F</span>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.price.toLocaleString()} F / unité</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caissier : <span className="text-slate-900 dark:text-white">{sale.managedBy}</span></p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TVA (${settings.tvaRate}%) : <span className="text-slate-900 dark:text-white">{Math.round(sale.tvaAmount).toLocaleString()} F</span></p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">TOTAL TTC</p>
                               <span className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">{sale.total.toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-slate-400 italic font-medium uppercase text-xs tracking-widest opacity-40">
                    Aucune vente ne correspond à votre recherche
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
