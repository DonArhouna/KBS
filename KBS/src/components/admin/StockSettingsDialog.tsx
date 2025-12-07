import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStock } from "@/hooks/useStock";
import type { ProductStock } from "@/services/stockService";

interface StockSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductStock | null;
}

const StockSettingsDialog = ({ isOpen, onClose, product }: StockSettingsDialogProps) => {
  const { handleUpdateStockSettings } = useStock();
  const [minStockLevel, setMinStockLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setMinStockLevel((product.min_stock_level || 5).toString());
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !minStockLevel) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await handleUpdateStockSettings(
      product.id, 
      parseInt(minStockLevel)
    );

    if (success) {
      onClose();
    }
    
    setIsSubmitting(false);
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Paramètres de stock - {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Stock actuel:</span>
              <span className="font-medium">{product.stock_quantity} unités</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Statut actuel:</span>
              <span className={`font-medium ${
                product.stock_status === 'in_stock' ? 'text-green-600' :
                product.stock_status === 'low_stock' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {product.stock_status === 'in_stock' ? 'En stock' :
                 product.stock_status === 'low_stock' ? 'Stock faible' :
                 'Rupture'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStock">Seuil d'alerte minimum</Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(e.target.value)}
              placeholder="5"
              required
            />
            <p className="text-xs text-muted-foreground">
              Une alerte sera créée quand le stock descendra à ce niveau ou en dessous.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Configuration des alertes</h4>
            <div className="space-y-1 text-xs text-blue-800">
              <div>• Stock faible: ≤ {minStockLevel || product.min_stock_level} unités</div>
              <div>• Rupture de stock: 0 unité</div>
              <div>• Email d'alerte: kewekane@yahoo.fr</div>
              <div>• Téléphone: +221 77 029 98 21</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockSettingsDialog;