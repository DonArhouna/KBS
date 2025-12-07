import { apiRequest } from '../lib/api';

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  created_by: string;
  product_name?: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock';
  current_quantity: number;
  threshold_quantity: number;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
  product_name?: string;
}

export interface ProductStock {
  id: string;
  name: string;
  stock_quantity: number;
  min_stock_level: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  price: number;
  category_name?: string;
}

// Récupérer tous les mouvements de stock
export const getStockMovements = async (): Promise<StockMovement[]> => {
  const data = await apiRequest<any[]>('/stock-movements');

  return data.map((movement: any) => ({
    ...movement,
    movement_type: movement.movement_type as 'in' | 'out' | 'adjustment',
    product_name: movement.product_name
  }));
};

// Créer un mouvement de stock
export const createStockMovement = async (movement: Omit<StockMovement, 'id' | 'created_at' | 'created_by'>): Promise<boolean> => {
  await apiRequest('/stock-movements', {
    method: 'POST',
    body: JSON.stringify({
      product_id: movement.product_id,
      movement_type: movement.movement_type,
      quantity: movement.quantity,
      reason: movement.reason,
      reference_number: movement.reference_number,
      notes: movement.notes,
    }),
  });

  return true;
};


// Récupérer toutes les alertes de stock
export const getStockAlerts = async (): Promise<StockAlert[]> => {
  const data = await apiRequest<any[]>('/stock-alerts');

  return data.map((alert: any) => ({
    ...alert,
    alert_type: alert.alert_type as 'low_stock' | 'out_of_stock',
    product_name: alert.product_name
  }));
};

// Marquer une alerte comme résolue
export const resolveStockAlert = async (alertId: string): Promise<boolean> => {
  await apiRequest(`/stock-alerts/${alertId}/resolve`, {
    method: 'PUT',
  });

  return true;
};

// Récupérer l'état du stock de tous les produits
export const getProductsStock = async (): Promise<ProductStock[]> => {
  const data = await apiRequest<any[]>('/products/stock');

  return data.map((product: any) => ({
    ...product,
    stock_status: product.stock_status as 'in_stock' | 'low_stock' | 'out_of_stock',
    category_name: product.category_name
  }));
};

// Mettre à jour les paramètres de stock d'un produit
export const updateProductStockSettings = async (
  productId: string,
  minStockLevel: number
): Promise<boolean> => {
  await apiRequest(`/products/${productId}/stock-settings`, {
    method: 'PUT',
    body: JSON.stringify({ min_stock_level: minStockLevel }),
  });

  return true;
};
