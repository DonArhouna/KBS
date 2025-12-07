import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getStockMovements,
  createStockMovement,
  getStockAlerts,
  resolveStockAlert,
  getProductsStock,
  updateProductStockSettings,
  type StockMovement,
  type StockAlert,
  type ProductStock
} from "@/services/stockService";

export const useStock = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [productsStock, setProductsStock] = useState<ProductStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    setIsLoading(true);
    try {
      const [movementsData, alertsData, stockData] = await Promise.all([
        getStockMovements(),
        getStockAlerts(),
        getProductsStock()
      ]);
      
      setMovements(movementsData);
      setAlerts(alertsData);
      setProductsStock(stockData);
    } catch (error) {
      toast.error("Erreur lors du chargement des données de stock");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMovement = async (movement: Omit<StockMovement, 'id' | 'created_at' | 'created_by'>) => {
    try {
      const success = await createStockMovement(movement);
      if (success) {
        // Recharger immédiatement toutes les données pour refléter les changements
        await loadStockData(); 
        toast.success("Mouvement de stock enregistré avec succès");
        return true;
      } else {
        toast.error("Erreur lors de l'enregistrement du mouvement");
        return false;
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du mouvement");
      console.error(error);
      return false;
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const success = await resolveStockAlert(alertId);
      if (success) {
        // Recharger immédiatement les données
        await loadStockData();
        toast.success("Alerte marquée comme résolue");
        return true;
      } else {
        toast.error("Erreur lors de la résolution de l'alerte");
        return false;
      }
    } catch (error) {
      toast.error("Erreur lors de la résolution de l'alerte");
      console.error(error);
      return false;
    }
  };

  const handleUpdateStockSettings = async (productId: string, minStockLevel: number) => {
    try {
      const success = await updateProductStockSettings(productId, minStockLevel);
      if (success) {
        // Recharger immédiatement les données
        await loadStockData();
        toast.success("Paramètres de stock mis à jour");
        return true;
      } else {
        toast.error("Erreur lors de la mise à jour");
        return false;
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
      return false;
    }
  };

  return {
    movements,
    alerts,
    productsStock,
    isLoading,
    loadStockData,
    handleCreateMovement,
    handleResolveAlert,
    handleUpdateStockSettings
  };
};