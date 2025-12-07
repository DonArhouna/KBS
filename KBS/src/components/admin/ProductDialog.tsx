import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { type Product } from "@/services/productService";

type ProductDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  categories: {id: string, name: string}[];
  isLoading: boolean;
  onSave: (formData: Product) => Promise<boolean>;
};

const ProductDialog = ({ 
  isOpen, 
  onClose, 
  selectedProduct, 
  categories, 
  isLoading, 
  onSave 
}: ProductDialogProps) => {
  const [formData, setFormData] = useState<Product>({
    id: "",
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    stock_quantity: 0,
  });

  useEffect(() => {
    if (selectedProduct) {
      setFormData({ ...selectedProduct });
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        price: 0,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format",
        category: categories.length > 0 ? categories[0].id : "",
        stock_quantity: 0,
      });
    }
  }, [selectedProduct, categories, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: (name === "price" || name === "stock_quantity") ? parseFloat(value) || 0 : value,
    });
  };

  const handleImageSelected = (imageUrl: string) => {
    setFormData({
      ...formData,
      image: imageUrl
    });
  };

  const handleSave = async () => {
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dialog-content">
        <DialogHeader>
          <DialogTitle>
            {selectedProduct ? `Modifier ${selectedProduct.name}` : "Ajouter un produit"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations du produit ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <div className="admin-form">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right" htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3 admin-input"
              />
            </div>

            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right" htmlFor="category">Catégorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="col-span-3 admin-select">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right" htmlFor="price">Prix (FCFA)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price || ''}
                onChange={handleInputChange}
                className="col-span-3 admin-input"
              />
            </div>

            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right" htmlFor="stock_quantity">Quantité Stock</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                value={formData.stock_quantity || 0}
                onChange={handleInputChange}
                className="col-span-3 admin-input"
                placeholder="Quantité à ajouter au stock"
              />
            </div>

            <div className="grid grid-cols-4 gap-4 items-start">
              <Label className="text-right" htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3 admin-textarea"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 gap-4 items-start">
              <Label className="text-right">Image</Label>
              <div className="col-span-3">
                <ImageUploader
                  currentImageUrl={formData.image}
                  onImageSelected={handleImageSelected}
                  label="Image du produit"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0 rounded-2xl">
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-kbs-green hover:bg-kbs-green/90 rounded-2xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                En cours...
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" /> Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
