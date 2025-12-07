import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateService, useUpdateService, useDeleteService } from "@/hooks/useQuotes";
import { Service } from "@/services/quoteService";

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  service?: Service;
}

const SERVICE_CATEGORIES = [
  "Conseil",
  "Installation", 
  "Maintenance",
  "Formation",
  "Support",
  "Audit",
  "Développement",
  "Autre"
];

const SERVICE_UNITS = [
  "service",
  "heure", 
  "jour",
  "mois",
  "année",
  "forfait"
];

export function ServiceDialog({ open, onClose, service }: ServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit_price: 0,
    unit: "service",
    category: "",
    is_active: true
  });

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        unit_price: service.unit_price || 0,
        unit: service.unit || "service",
        category: service.category || "",
        is_active: service.is_active ?? true
      });
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        unit_price: 0,
        unit: "service",
        category: "",
        is_active: true
      });
    }
  }, [service]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (service) {
      // Update existing service
      updateService.mutate(
        { id: service.id, service: formData },
        {
          onSuccess: () => {
            onClose();
          }
        }
      );
    } else {
      // Create new service
      createService.mutate(formData, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const handleDelete = () => {
    if (service && window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      deleteService.mutate(service.id, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>
            {service ? "Modifier le service" : "Nouveau service"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nom du service *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="ex: Consultation technique"
              />
            </div>

            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit">Unité</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit_price">Prix unitaire (FCFA) *</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée du service..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              {service && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteService.isPending}
                >
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createService.isPending || updateService.isPending}
              >
                {service ? "Modifier" : "Créer"} le service
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}