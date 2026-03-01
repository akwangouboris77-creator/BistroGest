
import { Sale, Settings } from '../types';

export const printReceipt = (sale: Sale, settings: Settings) => {
  let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const itemsHtml = sale.items.map(item => `
    <div style="margin-bottom: 5px; font-size: 12px; border-bottom: 0.5px dashed #ccc; padding-bottom: 3px; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; font-weight: bold;">
        <span style="max-width: 180px;">${item.productName}</span>
        <span>${(item.quantity * item.price).toLocaleString()}</span>
      </div>
      <div style="font-size: 10px; color: #444;">
        ${item.quantity} x ${item.price.toLocaleString()} FCFA
      </div>
    </div>
  `).join('');

  const logoFontSize = settings.logoFontSize || 20;
  const logoHtml = settings.logoUrl 
    ? `<img src="${settings.logoUrl}" style="max-height: 80px; width: auto; margin: 0 auto 10px; display: block;" />`
    : `<h1 style="text-transform: uppercase; font-size: ${logoFontSize}px; font-weight: 900; margin-bottom: 2px; text-align: center; line-height: 1;">${settings.bistroName}</h1>`;

  const footerMessage = settings.receiptFooterMessage || 'MERCI ET À BIENTÔT !';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { margin: 0; size: auto; }
          body { 
            font-family: 'Courier New', Courier, monospace, 'Helvetica', sans-serif; 
            margin: 0; 
            padding: 10px;
            width: 75mm;
            background: white;
            color: black;
            font-weight: bold;
          }
          * { box-sizing: border-box; }
          .dashed-line { border-top: 1px dashed black; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 10px;">
          ${logoHtml}
          ${settings.bistroSlogan ? `<div style="font-size: 11px; font-style: italic; margin-bottom: 5px;">"${settings.bistroSlogan}"</div>` : ''}
          <div style="font-size: 10px; text-transform: uppercase;">${settings.location} • GABON</div>
          ${settings.bistroPhone ? `<div style="font-size: 10px;">Tél: ${settings.bistroPhone}</div>` : ''}
          ${settings.nifNumber ? `<div style="font-size: 9px; margin-top: 2px;">${settings.nifNumber}</div>` : ''}
        </div>
        
        <div class="dashed-line"></div>
        <div style="font-size: 10px; line-height: 1.4;">
          <div style="display: flex; justify-content: space-between;">
            <span>TICKET: <b>${sale.orderNumber}</b></span>
            <span>${new Date(sale.timestamp).toLocaleDateString('fr-GA')}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>TABLE: <b>${sale.tableNumber || 'COMPTOIR'}</b></span>
            <span>${new Date(sale.timestamp).toLocaleTimeString('fr-GA', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          ${sale.customerName ? `
          <div style="margin-top: 5px; border-top: 0.5px solid #eee; padding-top: 3px;">
            CLIENT: <b style="text-transform: uppercase;">${sale.customerName}</b>
          </div>` : ''}
        </div>
        <div class="dashed-line"></div>

        <div style="margin-bottom: 10px;">
          ${itemsHtml}
        </div>

        <div style="text-align: right; border-top: 2px solid black; padding-top: 5px; margin-bottom: 15px;">
          <div style="font-size: 20px; font-weight: 900; display: flex; justify-content: space-between;">
            <span>TOTAL</span>
            <span>${sale.total.toLocaleString()} F</span>
          </div>
          <div style="font-size: 9px; opacity: 0.7;">HT: ${(sale.total / (1 + (settings.tvaRate / 100))).toLocaleString()} | TVA (${settings.tvaRate}%): ${Math.round(sale.tvaAmount).toLocaleString()} F</div>
        </div>

        <div style="font-size: 9px; background: #eee; padding: 6px; border-radius: 4px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>PAIEMENT:</span> <b>${sale.paymentMethod.toUpperCase()}</b></div>
          ${sale.transactionId ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>TRANS ID:</span> <b>${sale.transactionId}</b></div>` : ''}
          <div style="display: flex; justify-content: space-between;"><span>CAISSIER:</span> <span>${sale.managedBy}</span></div>
        </div>

        <div style="text-align: center; font-size: 11px; font-weight: 900; border-top: 1px dashed black; padding-top: 8px;">
          ${footerMessage}
          <div style="font-size: 7px; color: #555; margin-top: 6px; font-weight: normal;">BistroGest Gabon • Système de Gestion Optimisé</div>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Erreur d'impression:", e);
    }
  }, 500);
};
