import { QuoteWithItems } from './quoteService';

const WHATSAPP_PHONE = '221770299821';
const WHATSAPP_API_KEY = '7255012';

export const sendWhatsAppMessage = async (message: string): Promise<void> => {
  try {
    console.log('Envoi du message WhatsApp via backend proxy');

    const response = await fetch('http://localhost:3001/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        phone: WHATSAPP_PHONE,
        apikey: WHATSAPP_API_KEY
      })
    });

    console.log('Réponse du backend:', response.status, response.statusText);
    const responseData = await response.json();
    console.log('Contenu de la réponse:', responseData);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${responseData.error || 'Erreur inconnue'}`);
    }

    if (!responseData.success) {
      throw new Error(`Échec de l'envoi WhatsApp: ${responseData.error || 'Erreur inconnue'}`);
    }

    console.log('Message WhatsApp envoyé avec succès');

  } catch (error) {
    console.error('Erreur WhatsApp détaillée:', error);
    throw error;
  }
};

export const formatQuoteForWhatsApp = (quote: QuoteWithItems): string => {
  const validityText = quote.validity_date 
    ? `\n📅 Valide jusqu'au: ${new Date(quote.validity_date).toLocaleDateString('fr-FR')}`
    : '';

  const itemsText = quote.items.map(item => {
    const description = item.description ? `\n   ${item.description}` : '';
    return `• ${item.service_name}${description}\n   Qté: ${item.quantity} | Prix: ${item.unit_price.toLocaleString()} FCFA | Total: ${item.subtotal.toLocaleString()} FCFA`;
  }).join('\n');

  const notesText = quote.notes ? `\n📝 Notes:\n${quote.notes}` : '';

  return `
🏢 *KB&S - DEVIS ${quote.quote_number}*

👤 *Client:* ${quote.customer_name}
${quote.customer_company ? `🏢 *Entreprise:* ${quote.customer_company}` : ''}
📧 *Email:* ${quote.customer_email}
📞 *Téléphone:* ${quote.customer_phone || 'Non renseigné'}
${quote.customer_address ? `📍 *Adresse:* ${quote.customer_address}` : ''}${validityText}

🛍️ *Services proposés:*
${itemsText}

💰 *TOTAL: ${quote.total_amount.toLocaleString()} FCFA*${notesText}

📞 Contact: +221 77 029 98 21
✉️ Email: kewekane@yahoo.fr

Merci de votre confiance !
`.trim();
};

interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface WhatsAppOrder {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMode: string;
  orderDate: string;
  orderTime: string;
  products: OrderProduct[];
  total: number;
  notes?: string;
}

export const formatOrderForWhatsApp = (order: WhatsAppOrder): string => {
  const itemsText = order.products.map((product: OrderProduct) => {
    return `• ${product.name}\n   Qté: ${product.quantity} | Prix: ${product.price.toLocaleString()} FCFA | Total: ${product.subtotal.toLocaleString()} FCFA`;
  }).join('\n');

  const notesText = order.notes ? `\n📝 Notes:\n${order.notes}` : '';

  return `
🏢 *KB&S - COMMANDE ${order.orderNumber}*

👤 *Client:* ${order.customerName}
📧 *Email:* ${order.customerEmail}
📞 *Téléphone:* ${order.customerPhone}
📍 *Adresse:* ${order.customerAddress}
🚚 *Mode de livraison:* ${order.deliveryMode}
📅 *Date:* ${order.orderDate}
🕒 *Heure:* ${order.orderTime}

🛍️ *Produits commandés:*
${itemsText}

💰 *TOTAL: ${order.total.toLocaleString()} FCFA*${notesText}

📞 Contact: +221 77 029 98 21
✉️ Email: kewekane@yahoo.fr

Merci de votre confiance !
`.trim();
};
