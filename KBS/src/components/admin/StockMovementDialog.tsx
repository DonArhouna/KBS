import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStock } from "@/hooks/useStock";
import type { ProductStock } from "@/services/stockService";

interface StockMovementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductStock[];
}

const StockMovementDialog = ({ isOpen, onClose, products }: StockMovementDialogProps) => {
  const { handleCreateMovement } = useStock();
  const [formData, setFormData] = useState({
    product_id: "",
    movement_type: "" as 'in' | 'out' | 'adjustment',
    quantity: "",
    reason: "",
    reference_number: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.movement_type || !formData.quantity) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await handleCreateMovement({
      product_id: formData.product_id,
      movement_type: formData.movement_type,
      quantity: parseInt(formData.quantity),
      reason: formData.reason || undefined,
      reference_number: formData.reference_number || undefined,
      notes: formData.notes || undefined
    });

    if (success) {
      setFormData({
        product_id: "",
        movement_type: "" as 'in' | 'out' | 'adjustment',
        quantity: "",
        reason: "",
        reference_number: "",
        notes: ""
      });
      onClose();
    }
    
    setIsSubmitting(false);
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Entrée en stock';
      case 'out': return 'Sortie de stock';
      case 'adjustment': return 'Ajustement';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau mouvement de stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Produit</Label>
            <Select value={formData.product_id} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, product_id: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock_quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de mouvement</Label>
            <Select value={formData.movement_type} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, movement_type: value as 'in' | 'out' | 'adjustment' }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrée en stock</SelectItem>
                <SelectItem value="out">Sortie de stock</SelectItem>
                <SelectItem value="adjustment">Ajustement de stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantité {formData.movement_type === 'adjustment' ? '(nouvelle quantité totale)' : ''}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Ex: Réception fournisseur, Vente, Inventaire..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Numéro de référence</Label>
            <Input
              id="reference"
              value={formData.reference_number}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              placeholder="Ex: BL-2024-001, CMD-123..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockMovementDialog;