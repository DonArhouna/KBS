
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

const CartPage = () => {
  useScrollToTop();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  const handleClearCart = () => {
    clearCart();
    toast.success("Panier vidé avec succès");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-kbs-beige">
        <div className="container-custom py-16">
          <div className="text-center bg-white rounded-3xl shadow-xl p-20 max-w-2xl mx-auto">
            <ShoppingCart className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
            <Link to="/products">
              <Button className="bg-kbs-green hover:bg-kbs-green/90 rounded-2xl px-8 py-3">
                Voir nos produits
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kbs-beige">
      <div className="container-custom py-8">
        <Link to="/products" className="inline-flex items-center text-kbs-green hover:text-kbs-green/80 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continuer les achats
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h1 className="text-2xl font-bold text-kbs-brown mb-6">Mon Panier</h1>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-kbs-green font-medium">{formatPrice(item.price)} FCFA</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-2xl"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center rounded-2xl"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-2xl"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatPrice(item.price * item.quantity)} FCFA
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 mt-1 rounded-2xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-kbs-brown mb-4">Résumé de la commande</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(getTotalPrice())} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>À définir</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold text-kbs-brown">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())} FCFA</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/order" className="block">
                  <Button size="lg" className="w-full bg-kbs-green hover:bg-kbs-green/90 rounded-2xl">
                    Passer la commande
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-red-500 text-red-500 hover:bg-red-50 rounded-2xl"
                  onClick={handleClearCart}
                >
                  Vider le panier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
