
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { getAllProducts, Product } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { formatPrice } from "@/lib/utils";

const ProductDetailPage = () => {
  useScrollToTop();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        const products = await getAllProducts();
        const foundProduct = products.find(p => p.id === id);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error("Erreur lors du chargement du produit:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity);
    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} x ${product.name} ajouté(s) au panier`,
    });
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kbs-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
          <Link to="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kbs-beige">
      <div className="container-custom py-8">
        <Link to="/products" className="inline-flex items-center text-kbs-green hover:text-kbs-green/80 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux produits
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image du produit */}
            <div className="aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Détails du produit */}
            <div className="p-6 md:p-8">
              <div className="mb-4">
                {product.categoryName && (
                  <span className="inline-block bg-kbs-green/10 text-kbs-green px-3 py-1 rounded-full text-sm font-medium mb-2">
                    {product.categoryName}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-kbs-brown mb-2">{product.name}</h1>
                <p className="text-2xl font-semibold text-kbs-green">{formatPrice(product.price)} FCFA</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-kbs-brown mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "Aucune description disponible pour ce produit."}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">En stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-kbs-green rounded-full"></div>
                  <span className="text-sm text-gray-600">100% naturel</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full bg-kbs-green hover:bg-kbs-green/90"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ajouter au panier - {formatPrice(product.price * quantity)} FCFA
                </Button>
                
                <Link to="/cart" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Voir le panier
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
