
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItems } = useCart();
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const menuItems = [
    { name: "Accueil", path: "/" },
    { name: "À propos", path: "/about" },
    { name: "Produits", path: "/products" },
    { name: "Contact", path: "/contact" }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    scrollToTop();
  };

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link to="/" onClick={handleLinkClick} className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/7c859f46-6008-4383-be71-894406d0c0ae.png" 
              alt="KB&S Logo" 
              className="h-16 w-16 object-contain rounded-full border-2 border-kbs-green" 
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-kbs-green">KB&S</h1>
              <p className="text-green-800 font-normal text-sm">KEWE BUSINESS & SERVICES</p>
            </div>
          </Link>

          <div className="hidden md:flex space-x-8">
            {menuItems.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
                onClick={handleLinkClick} 
                className={`text-gray-700 hover:text-kbs-green transition-colors ${
                  location.pathname === item.path ? "text-kbs-green font-medium" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative group">
              <Button 
                variant="outline" 
                size="sm" 
                className="relative bg-gradient-to-r from-kbs-green/10 to-kbs-light/10 border-kbs-green/20 hover:from-kbs-green/20 hover:to-kbs-light/20 hover:border-kbs-green/40 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="h-5 w-5 text-kbs-green group-hover:text-kbs-green/80 transition-colors" />
                {cartItemsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 border-0 shadow-lg animate-pulse"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden rounded-2xl" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white/95 backdrop-blur-sm rounded-b-2xl">
            <div className="flex flex-col space-y-4">
              {menuItems.map(item => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  onClick={handleLinkClick} 
                  className={`text-gray-700 hover:text-kbs-green transition-colors ${
                    location.pathname === item.path ? "text-kbs-green font-medium" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
