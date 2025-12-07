
import { apiRequest } from '../lib/api';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMode: string;
  notes: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  total: number;
  orderDate: string;
  orderTime: string;
}

export const sendOrderEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('Tentative d\'envoi d\'email avec les données:', orderData);
    
    const response = await apiRequest('/send-order-email', {
      method: 'POST',
      body: JSON.stringify({
        to: 'kewekane@yahoo.fr',
        subject: `Nouvelle commande KB&S - ${orderData.orderNumber}`,
        orderData
      })
    });

    console.log('Email envoyé avec succès:', response);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

export const openEmailClient = (clientType: 'gmail' | 'outlook' | 'default') => {
  const to = 'kewekane@yahoo.fr';
  const subject = 'Demande d\'information - KB&S';
  const body = 'Bonjour,\n\nJe souhaiterais avoir des informations sur vos produits.\n\nCordialement,';
  
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  let url = '';
  
  switch (clientType) {
    case 'gmail':
      url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodedSubject}&body=${encodedBody}`;
      break;
    case 'outlook':
      url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${encodedSubject}&body=${encodedBody}`;
      break;
    case 'default':
    default:
      url = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
      break;
  }
  
  window.open(url, '_blank');
};
