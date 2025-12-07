import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/useInvoices";
import { useToast } from "@/hooks/use-toast";

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  invoice?: any;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const InvoiceDialog = ({ open, onClose, invoice }: InvoiceDialogProps) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    due_date: "",
    status: "draft" as const,
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, subtotal: 0 }
  ]);

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { toast } = useToast();

  useEffect(() => {
    if (invoice) {
      setFormData({
        customer_name: invoice.customer_name || "",
        customer_email: invoice.customer_email || "",
        customer_phone: invoice.customer_phone || "",
        customer_address: invoice.customer_address || "",
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : "",
        status: invoice.status || "draft",
        notes: invoice.notes || "",
      });
      
      if (invoice.invoice_items && invoice.invoice_items.length > 0) {
        setItems(invoice.invoice_items.map((item: any) => ({
          description: item.description || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          subtotal: item.subtotal || 0,
        })));
      }
    } else {
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_address: "",
        due_date: "",
        status: "draft",
        notes: "",
      });
      setItems([{ description: "", quantity: 1, unit_price: 0, subtotal: 0 }]);
    }
  }, [invoice, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceData = {
      ...formData,
      total_amount: calculateTotal(),
      items: items.filter(item => item.description.trim() !== ""),
    };

    if (invoice) {
      updateInvoice.mutate(
        { id: invoice.id, ...invoiceData },
        {
          onSuccess: () => {
            toast({
              title: "Facture mise à jour",
              description: "La facture a été mise à jour avec succès",
            });
            onClose();
          },
          onError: () => {
            toast({
              title: "Erreur",
              description: "Impossible de mettre à jour la facture",
              variant: "destructive",
            });
          },
        }
      );
    } else {
      createInvoice.mutate(invoiceData, {
        onSuccess: () => {
          toast({
            title: "Facture créée",
            description: "La facture a été créée avec succès",
          });
          onClose();
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible de créer la facture",
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? "Modifier la facture" : "Nouvelle facture"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Nom du client *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange("customer_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleInputChange("customer_email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Téléphone</Label>
                  <Input
                    id="customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Date d'échéance *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange("due_date", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="customer_address">Adresse</Label>
                <Textarea
                  id="customer_address"
                  value={formData.customer_address}
                  onChange={(e) => handleInputChange("customer_address", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Articles</CardTitle>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Description de l'article"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantité</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit_price-${index}`}>Prix unitaire</Label>
                    <Input
                      id={`unit_price-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Sous-total</Label>
                      <div className="text-lg font-semibold pt-2">
                        {item.subtotal.toFixed(0)} Fr CFA
                      </div>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total: {calculateTotal().toFixed(0)} Fr CFA
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations additionnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations additionnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="sent">Envoyée</SelectItem>
                    <SelectItem value="paid">Payée</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Notes additionnelles..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createInvoice.isPending || updateInvoice.isPending}
            >
              {createInvoice.isPending || updateInvoice.isPending
                ? "Enregistrement..."
                : invoice
                ? "Mettre à jour"
                : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;