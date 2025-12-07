import { apiRequest } from '../lib/api';
import { CartItem } from '@/context/CartContext';
import * as XLSX from 'xlsx';
import { createStockMovement } from './stockService';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  delivery_mode: string;
  notes: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CreateOrderData {
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
}

export const createOrder = async (orderData: CreateOrderData): Promise<boolean> => {
  try {
    console.log('Création de la commande:', orderData);

    const order = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        delivery_mode: orderData.deliveryMode,
        notes: orderData.notes,
        total_amount: orderData.total,
        items: orderData.products.map(product => ({
          name: product.name,
          quantity: product.quantity,
          unit_price: product.price,
          subtotal: product.subtotal
        }))
      }),
    });
    console.log('Commande créée avec succès:', order);
    return true;

  } catch (error) {
    console.error('Erreur inattendue lors de la création de la commande:', error);
    return false;
  }
};

// Renommer getOrders en getAllOrders pour correspondre à l'usage
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const orders = await apiRequest<Order[]>('/orders');
    return orders;
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return [];
  }
};

// Garder l'ancienne fonction pour la compatibilité
export const getOrders = getAllOrders;

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const items = await apiRequest<OrderItem[]>(`/orders/${orderId}/items`);
    return items;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<boolean> => {
  try {
    // 1. Récupérer l'ordre actuel
    const orders = await apiRequest<Order[]>('/orders');
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      console.error('Commande non trouvée:', orderId);
      return false;
    }

    // 2. Récupérer les articles de la commande
    const orderItems = await apiRequest<OrderItem[]>(`/orders/${orderId}/items`);

    const oldStatus = order.status;

    // 3. Mettre à jour le statut de la commande
    await apiRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });

    // 4. Gérer les mouvements de stock selon les changements de statut
    await handleStockMovementsForStatusChange(oldStatus, newStatus, orderItems, order.order_number);

    return true;
  } catch (error) {
    console.error('Erreur inattendue lors de la mise à jour du statut:', error);
    return false;
  }
};

// Interface pour les données de produit utilisées dans les mouvements de stock
interface ProductForStock {
  id: string;
  name: string;
}

// Fonction helper pour gérer les mouvements de stock
const handleStockMovementsForStatusChange = async (
  oldStatus: string,
  newStatus: string,
  orderItems: OrderItem[],
  orderNumber: string
) => {
  try {
    // Récupérer tous les produits pour créer le mapping nom -> id
    const products = await apiRequest<ProductForStock[]>('/products');

    // Créer un map pour correspondre nom -> id
    const productMap = new Map(products.map((p) => [p.name, p.id]));

    // Logique de gestion du stock selon les transitions de statut
    // Note: Le stock est déjà déduit lors de la création de la commande (statut pending)
    for (const item of orderItems) {
      const productId = productMap.get(item.product_name) as string;
      if (!productId) continue;

      // Commande annulée: restaurer le stock (car il a été déduit à la création)
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        await createStockMovement({
          product_id: productId,
          movement_type: 'in' as const,
          quantity: item.quantity,
          reason: 'Annulation de commande',
          reference_number: orderNumber,
          notes: `Restauration automatique suite à l'annulation de la commande ${orderNumber}`
        });
      }

      // Commande remise en attente après annulation: déduire à nouveau le stock
      else if (oldStatus === 'cancelled' && newStatus === 'pending') {
        await createStockMovement({
          product_id: productId,
          movement_type: 'out' as const,
          quantity: item.quantity,
          reason: 'Commande réactivée',
          reference_number: orderNumber,
          notes: `Nouvelle déduction suite à la réactivation de la commande ${orderNumber}`
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des mouvements de stock:', error);
  }
};

// Nouvelle fonction pour exporter les commandes en Excel
export const exportOrdersToExcel = async (orders: any[]): Promise<void> => {
  try {
    // Préparer les données pour l'export
    const exportData = orders.map(order => ({
      'N° Commande': order.order_number,
      'Date': new Date(order.created_at).toLocaleDateString('fr-FR'),
      'Client': order.customer_name,
      'Email': order.customer_email,
      'Téléphone': order.customer_phone,
      'Adresse': order.customer_address,
      'Mode de livraison': order.delivery_mode,
      'Montant Total (FCFA)': order.total_amount,
      'Statut': order.status,
      'Notes': order.notes || ''
    }));

    // Créer le workbook et la worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Commandes');

    // Générer le nom du fichier avec la date
    const fileName = `commandes_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Télécharger le fichier
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error;
  }
};
