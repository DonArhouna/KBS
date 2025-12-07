
import { Link } from "react-router-dom";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-kbs-green text-white">
      <div className="container-custom pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/lovable-uploads/7c859f46-6008-4383-be71-894406d0c0ae.png" 
                alt="KB&S Logo" 
                className="h-16 w-16 rounded-full object-cover border-2 border-white/20" 
              />
              <div>
                <h3 className="font-bold text-xl">KB&S</h3>
                <p className="text-xs opacity-80">KEWE BUSINESS & SERVICES</p>
              </div>
            </div>
            <p className="text-sm mb-4 opacity-90">
              Spécialiste dans la transformation et vente de produits agroalimentaires 100% naturels du Sénégal.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white hover:text-kbs-gold transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white hover:text-kbs-gold transition-colors text-sm">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white hover:text-kbs-gold transition-colors text-sm">
                  Produits
                </Link>
              </li>
              <li>
                <Link to="/order" className="text-white hover:text-kbs-gold transition-colors text-sm">
                  Commander
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white hover:text-kbs-gold transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Adresse principale :</p>
                  <p className="text-sm">Villa 103 Cité ANCAR 2, Kounoune</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Dépôt :</p>
                  <p className="text-sm">Maristes, Dakar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+221770299821" className="text-sm hover:underline">+221 77 029 98 21</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:kewekane@yahoo.fr" className="text-sm hover:underline">kewekane@yahoo.fr</a>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-kbs-gold transition-colors">
                  <Instagram size={20} />
                </a>
                <a href={`https://wa.me/221770299821`} target="_blank" rel="noreferrer" className="hover:text-kbs-gold transition-colors">
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-80">
          <p>© {currentYear} KB&S KEWE BUSINESS & SERVICES. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
