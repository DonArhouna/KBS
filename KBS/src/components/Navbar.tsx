
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, ShoppingBag, Award, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { LogOut, User, LogIn, UserPlus, Settings, Bell, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems: items } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await authService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
      // On pourrait mettre un intervalle ici pour du temps réel
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" onClick={handleLinkClick} className="flex items-center space-x-3 group transition-transform hover:scale-105 active:scale-95 shrink-0">
          <img
            src="/lovable-uploads/7c859f46-6008-4383-be71-894406d0c0ae.png"
            alt="KB&S Logo"
            className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-full border-2 border-kbs-green shadow-sm"
          />
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-bold text-kbs-green leading-tight">KB&S</h1>
            <p className="text-gray-500 font-medium text-[9px] sm:text-[10px] uppercase tracking-tighter">KEWE BUSINESS & SERVICES</p>
          </div>
        </Link>

        {/* NAVIGATION DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-sm font-semibold transition-colors relative group py-2 ${location.pathname === item.path ? "text-kbs-green font-bold" : "text-gray-600 hover:text-kbs-green"
                }`}
            >
              {item.name}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-kbs-green transition-all group-hover:w-full ${location.pathname === item.path ? "w-full" : "w-0"
                }`}></span>
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* PANIER */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl bg-gray-50 hover:bg-kbs-green/10 group transition-all">
              <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-kbs-green" />
              {items.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-kbs-green text-white border-2 border-white text-[10px] font-bold shadow-md">
                  {items.length}
                </Badge>
              )}
            </Button>
          </Link>

          {/* USER MENU */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-gray-50 hover:bg-kbs-green/10 group transition-all ring-1 ring-gray-100">
                    <User className="h-5 w-5 text-gray-600 group-hover:text-kbs-green" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white ring-1 ring-red-200"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 mt-2 p-0 rounded-3xl border-kbs-green/10 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden bg-white/95 backdrop-blur-md">
                  <div className="bg-gradient-to-br from-kbs-green/5 to-transparent p-6 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-kbs-green to-kbs-green/70 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-kbs-green/20 ring-4 ring-white">
                        {user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/80 text-kbs-green border-kbs-green/10 text-[10px] h-5 px-2 font-bold uppercase shadow-sm">Client Gold</Badge>
                      <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                      <span className="text-[10px] text-gray-400 font-medium tracking-tight">Membre Actif</span>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <DropdownMenuSeparator className="bg-gray-100/50 mx-2" />

                    <Link to="/notifications">
                      <DropdownMenuItem className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-kbs-green/5 focus:bg-kbs-green/5 transition-all group border border-transparent hover:border-kbs-green/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors shadow-sm">
                            <Bell className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Notifications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full border-2 border-white shadow-sm font-bold">{unreadCount}</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-kbs-green group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </DropdownMenuItem>
                    </Link>

                    <Link to="/orders-history">
                      <DropdownMenuItem className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-kbs-green/5 focus:bg-kbs-green/5 transition-all group border border-transparent hover:border-kbs-green/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors shadow-sm">
                            <ShoppingBag className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Mes Commandes</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-kbs-green group-hover:translate-x-0.5 transition-all" />
                      </DropdownMenuItem>
                    </Link>

                    <Link to="/settings">
                      <DropdownMenuItem className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-kbs-green/5 focus:bg-kbs-green/5 transition-all group border border-transparent hover:border-kbs-green/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-gray-100 transition-colors shadow-sm">
                            <Settings className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Paramètres</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-kbs-green group-hover:translate-x-0.5 transition-all" />
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuSeparator className="bg-gray-100/50 mx-2" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 transition-all group border border-transparent hover:border-red-100"
                    >
                      <div className="p-2 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-100 shadow-sm">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold">Déconnexion</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0 border-kbs-green/20 hover:border-kbs-green/40 bg-white"
                  >
                    <User className="h-5 w-5 text-kbs-green" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2 p-0 rounded-3xl border-kbs-green/10 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden bg-white/95 backdrop-blur-md">
                  <div className="bg-gradient-to-br from-kbs-green/5 to-transparent p-5">
                    <p className="text-base font-bold text-gray-900 tracking-tight">Mon Compte</p>
                    <p className="text-xs text-gray-500 mt-1">Connectez-vous pour voir vos offres</p>
                  </div>

                  <div className="p-2 space-y-1">
                    <DropdownMenuSeparator className="bg-gray-100/50 mx-2" />

                    <Link to="/login">
                      <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-kbs-green/5 focus:bg-kbs-green/5 transition-all group border border-transparent hover:border-kbs-green/10">
                        <div className="p-2 rounded-xl bg-kbs-green/10 text-kbs-green group-hover:bg-kbs-green/20 transition-colors shadow-sm">
                          <LogIn className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Connexion</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link to="/register">
                      <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-kbs-green/5 focus:bg-kbs-green/5 transition-all group border border-transparent hover:border-kbs-green/10">
                        <div className="p-2 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-gray-100 transition-colors shadow-sm">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">S'inscrire</span>
                      </DropdownMenuItem>
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

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

        {/* MOBILE MENU OVERLAY */}
        <div className={`fixed inset-0 z-50 md:hidden bg-white/95 backdrop-blur-md transition-all duration-500 ease-in-out ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-full"
          }`}>
          <div className="flex flex-col h-full p-6 pt-24">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-gray-50 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="h-6 w-6 text-kbs-green" />
            </Button>

            <div className="flex flex-col space-y-2">
              {menuItems.map((item, index) => {
                const icons = [Award, Shield, ShoppingBag, Mail]; // Fallback icons
                const IconComp = icons[index] || ChevronRight;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between p-5 rounded-3xl transition-all duration-300 ${location.pathname === item.path
                        ? "bg-kbs-green text-white shadow-lg shadow-kbs-green/20"
                        : "text-gray-700 hover:bg-kbs-green/5 border border-transparent hover:border-kbs-green/10"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${location.pathname === item.path ? "bg-white/20" : "bg-kbs-green/10 text-kbs-green"}`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className="text-lg font-bold">{item.name}</span>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${location.pathname === item.path ? "text-white/70" : "text-gray-300"}`} />
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto pb-10">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-kbs-green/5 to-transparent border border-kbs-green/10 mb-6">
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-kbs-green text-white flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white">
                      {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Mon Compte KB&S</h4>
                    <p className="text-xs text-gray-500 mb-4">Rejoignez-nous pour plus d'avantages</p>
                    <div className="flex gap-3">
                      <Link to="/login" className="flex-1" onClick={handleLinkClick}>
                        <Button className="w-full rounded-2xl bg-kbs-green font-bold">Connexion</Button>
                      </Link>
                      <Link to="/register" className="flex-1" onClick={handleLinkClick}>
                        <Button variant="outline" className="w-full rounded-2xl border-kbs-green text-kbs-green font-bold">S'inscrire</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-center p-5 rounded-3xl text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 transition-all font-bold"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Déconnexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
