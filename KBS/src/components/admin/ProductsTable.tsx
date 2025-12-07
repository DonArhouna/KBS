
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Trash2 } from "lucide-react";
import { type Product } from "@/services/productService";
import ActionButton from "./ActionButton";
import { formatPrice } from "@/lib/utils";

type ProductsTableProps = {
  products: Product[];
  categories: {id: string, name: string}[];
  isLoading: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
};

const ProductsTable = ({ 
  products, 
  categories, 
  isLoading, 
  onEditProduct, 
  onDeleteProduct 
}: ProductsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-kbs-green" />
      </div>
    );
  }

  return (
    <div className="admin-table">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-kbs-green to-kbs-light text-white">
            <tr>
              <th className="text-left p-4 font-semibold">Image</th>
              <th className="text-left p-4 font-semibold">Nom</th>
              <th className="text-left p-4 font-semibold">Catégorie</th>
              <th className="text-left p-4 font-semibold">Prix</th>
              <th className="text-center p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Aucun produit disponible
                </td>
              </tr>
            )}
            {products.map((product, index) => (
              <tr key={product.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="p-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-16 h-12 object-cover rounded-lg shadow-sm"
                  />
                </td>
                <td className="p-4 font-medium text-gray-700">{product.name}</td>
                <td className="p-4 text-gray-600">
                  {categories.find(cat => cat.id === product.category)?.name || product.categoryName || "Non catégorisé"}
                </td>
                <td className="p-4 font-semibold text-kbs-green">{formatPrice(product.price)} FCFA</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <ActionButton 
                      onClick={() => onEditProduct(product)} 
                      variant="edit"
                    >
                      <Pencil size={16} />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => onDeleteProduct(product.id)}
                      variant="delete"
                    >
                      <Trash2 size={16} />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
