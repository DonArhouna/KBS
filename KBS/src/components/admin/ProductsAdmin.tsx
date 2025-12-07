
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import ProductsTable from "./ProductsTable";
import ProductDialog from "./ProductDialog";
import { type Product } from "@/services/productService";
import AdminCard from "./AdminCard";

const ProductsAdmin = () => {
  const { 
    products, 
    categories, 
    isLoading, 
    handleSaveProduct, 
    handleDeleteProduct 
  } = useProducts();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleSave = async (formData: Product) => {
    const success = await handleSaveProduct(formData, selectedProduct);
    return success;
  };

  return (
    <div>
      <AdminCard title="Gestion des Produits">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {products.length} produit{products.length !== 1 ? 's' : ''} au total
          </p>
          <Button 
            className="bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" 
            onClick={handleAddProduct}
            disabled={isLoading}
          >
            Ajouter un produit
          </Button>
        </div>

        <ProductsTable
          products={products}
          categories={categories}
          isLoading={isLoading}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </AdminCard>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedProduct={selectedProduct}
        categories={categories}
        isLoading={isLoading}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProductsAdmin;
