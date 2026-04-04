
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

const ProductCard = ({ id, name, description, price, image }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name, description, price, image, category: '', categoryName: '' });
    toast({
      title: "Produit ajouté",
      description: `${name} a été ajouté à votre panier`,
    });
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:-rotate-1">
      {/* Badge Premium */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-gradient-to-r from-kbs-green to-kbs-light text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          <Star className="inline w-3 h-3 mr-1 fill-current" />
          Premium
        </div>
      </div>

      <Link to={`/product/${id}`} className="block">
        {/* Image Container */}
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <div 
            className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: `url(${image})`, backgroundColor: '#f8f8f6' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-xl transform scale-95 group-hover:scale-100 transition-transform duration-300">
              <Eye className="w-5 h-5 text-kbs-green mx-auto" />
              <span className="text-kbs-green text-sm font-semibold">Voir détails</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-kbs-brown mb-2 sm:mb-3 group-hover:text-kbs-green transition-colors duration-300 line-clamp-1">
            {name}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 font-light leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 sm:mb-4">
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-kbs-green to-kbs-light bg-clip-text text-transparent">
              {formatPrice(price)} FCFA
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex gap-2 sm:gap-3">
          <Link to={`/product/${id}`} className="flex-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full border-2 border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white rounded-2xl transition-all duration-300 font-semibold h-10 px-2 sm:px-4"
            >
              <Eye className="sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline sm:inline">Voir détails</span>
            </Button>
          </Link>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white px-4 sm:px-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 h-10 relative group"
            onClick={handleAddToCart}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-kbs-green rounded-full m-0.5"></div>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-kbs-light/20 to-kbs-green/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-kbs-green/20 to-kbs-light/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    </div>
  );
};

export default ProductCard;
