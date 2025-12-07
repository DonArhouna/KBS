import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useCreateQuote, useUpdateQuote } from "@/hooks/useQuotes";
import { Service, CreateQuoteData } from "@/services/quoteService";

interface QuoteDialogProps {
  open: boolean;
  onClose: () => void;
  quote?: any;
  services: Service[];
}

interface QuoteItem {
  service_id?: string;
  service_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
}

export function QuoteDialog({ open, onClose, quote, services }: QuoteDialogProps) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    customer_company: "",
    validity_date: "",
    notes: "",
    terms_conditions: ""
  });

  const [items, setItems] = useState<QuoteItem[]>([
    { service_name: "", quantity: 1, unit_price: 0 }
  ]);

  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();

  useEffect(() => {
    if (quote) {
      setFormData({
        customer_name: quote.customer_name || "",
        customer_email: quote.customer_email || "",
        customer_phone: quote.customer_phone || "",
        customer_address: quote.customer_address || "",
        customer_company: quote.customer_company || "",
        validity_date: quote.validity_date || "",
        notes: quote.notes || "",
        terms_conditions: quote.terms_conditions || ""
      });

      if (quote.quote_items?.length > 0) {
        setItems(quote.quote_items.map((item: any) => ({
          service_id: item.service_id,
          service_name: item.service_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price
        })));
      }
    } else {
      // Reset form
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_address: "",
        customer_company: "",
        validity_date: "",
        notes: "",
        terms_conditions: ""
      });
      setItems([{ service_name: "", quantity: 1, unit_price: 0 }]);
    }
  }, [quote]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      handleItemChange(index, 'service_id', serviceId);
      handleItemChange(index, 'service_name', service.name);
      handleItemChange(index, 'unit_price', service.unit_price);
      handleItemChange(index, 'description', service.description || '');
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, { service_name: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quoteData: CreateQuoteData = {
      ...formData,
      items: items.filter(item => item.service_name && item.unit_price > 0)
    };

    if (quote) {
      // Update existing quote
      updateQuote.mutate(
        { id: quote.id, updates: formData },
        {
          onSuccess: () => {
            onClose();
          }
        }
      );
    } else {
      // Create new quote
      createQuote.mutate(quoteData, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {quote ? "Modifier le devis" : "Nouveau devis"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer_name">Nom *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Téléphone</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customer_company">Entreprise</Label>
                <Input
                  id="customer_company"
                  value={formData.customer_company}
                  onChange={(e) => handleInputChange('customer_company', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customer_address">Adresse</Label>
                <Textarea
                  id="customer_address"
                  value={formData.customer_address}
                  onChange={(e) => handleInputChange('customer_address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-6 items-end p-4 border rounded">
                  <div className="md:col-span-2">
                    <Label>Service</Label>
                    <Select
                      value={item.service_id || ""}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          handleItemChange(index, 'service_id', undefined);
                          handleItemChange(index, 'service_name', '');
                          handleItemChange(index, 'unit_price', 0);
                        } else {
                          handleServiceSelect(index, value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Service personnalisé</SelectItem>
                        {services.map((service) => (
                           <SelectItem key={service.id} value={service.id}>
                             {service.name} ({service.unit_price} FCFA)
                           </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!item.service_id && (
                      <Input
                        placeholder="Nom du service"
                        value={item.service_name}
                        onChange={(e) => handleItemChange(index, 'service_name', e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <Label>Quantité</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Prix unitaire</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                     <Input
                       value={`${(item.quantity * item.unit_price).toFixed(2)} FCFA`}
                       disabled
                     />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <p className="text-lg font-semibold">
                  Total: {calculateTotal().toFixed(2)} FCFA
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="validity_date">Date de validité</Label>
                <Input
                  id="validity_date"
                  type="date"
                  value={formData.validity_date}
                  onChange={(e) => handleInputChange('validity_date', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes internes..."
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="terms_conditions">Conditions générales</Label>
                <Textarea
                  id="terms_conditions"
                  value={formData.terms_conditions}
                  onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                  placeholder="Conditions générales du devis..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createQuote.isPending || updateQuote.isPending}
            >
              {quote ? "Modifier" : "Créer"} le devis
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}