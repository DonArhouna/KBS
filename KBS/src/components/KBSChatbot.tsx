import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { getAllProducts, getAllCategories, Product, Category } from "@/services/productService";
import { getSiteContent } from "@/services/contentService";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotSiteContent {
  delivery?: { description?: string };
  payment?: { description?: string };
  contact?: { phone?: string; email?: string };
  hours?: { description?: string };
  location?: { description?: string };
  about?: { description?: string };
  activities?: { description?: string };
  products?: { bannerImage?: string; qualityImage?: string };
}

const KBSChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteContent, setSiteContent] = useState<ChatbotSiteContent>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les données du site au montage du composant
  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const [productsData, categoriesData, contentData] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
          getSiteContent()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setSiteContent(contentData);
      } catch (error) {
        console.error("Erreur lors du chargement des données du site:", error);
      }
    };

    loadSiteData();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message d'accueil
      const welcomeMessage: Message = {
        id: "welcome",
        text: "Bonjour ! Je suis l'assistant virtuel de KB&S. Je peux vous aider avec nos produits, services, livraisons et modes de paiement. Comment puis-je vous aider aujourd'hui ?",
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const getKBSResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Recherche de produits spécifiques
    const foundProduct = products.find(product =>
      message.includes(product.name.toLowerCase()) ||
      product.name.toLowerCase().includes(message.split(' ')[0])
    );

    if (foundProduct) {
      return `${foundProduct.name} : ${foundProduct.description} - Prix : ${foundProduct.price} FCFA. Vous pouvez le commander directement sur notre site !`;
    }

    // Recherche de catégories
    const foundCategory = categories.find(category =>
      message.includes(category.name.toLowerCase())
    );

    if (foundCategory) {
      const categoryProducts = products.filter(p => p.category === foundCategory.id);
      return `Dans la catégorie ${foundCategory.name}, nous avons ${categoryProducts.length} produits disponibles. Découvrez-les sur notre page Produits !`;
    }

    // Produits et services
    if (message.includes("produit") || message.includes("menu") || message.includes("que vendez-vous")) {
      const categoryNames = categories.map(cat => cat.name).join(", ");
      return `Chez KB&S, nous proposons ${products.length} produits répartis dans ${categories.length} catégories : ${categoryNames}. Vous pouvez consulter notre catalogue complet sur la page 'Produits' de notre site.`;
    }

    // Livraison
    if (message.includes("livraison") || message.includes("livrer") || message.includes("délai")) {
      return siteContent.delivery?.description || "Nous proposons deux options : livraison à domicile ou retrait en magasin. Les délais de livraison varient selon votre localisation. Vous pouvez préciser vos préférences lors de votre commande.";
    }

    // Paiement
    if (message.includes("paiement") || message.includes("payer") || message.includes("prix")) {
      return siteContent.payment?.description || "Nous acceptons plusieurs modes de paiement : WhatsApp (recommandé), carte bancaire, Wave, et Orange Money. Vous pouvez choisir votre mode de paiement préféré lors de la finalisation de votre commande.";
    }

    // Commande
    if (message.includes("commande") || message.includes("commander") || message.includes("acheter")) {
      return "Pour passer une commande, ajoutez vos produits au panier depuis notre page 'Produits', puis cliquez sur 'Passer une commande'. Vous pourrez ensuite choisir votre mode de livraison et de paiement.";
    }

    // Contact
    if (message.includes("contact") || message.includes("téléphone") || message.includes("adresse")) {
      return `📞 **Nos coordonnées :**\n\n📱 **WhatsApp :** +221 77 029 98 21\n📧 **Email :** kewekane@yahoo.fr\n\nVous pouvez également nous contacter via notre page 'Contact' pour plus d'informations !`;
    }

    // Horaires
    if (message.includes("horaire") || message.includes("ouvert") || message.includes("heure")) {
      return siteContent.hours?.description || "Nos horaires d'ouverture et informations de disponibilité sont disponibles sur notre page 'Contact'. N'hésitez pas à nous contacter pour des informations spécifiques.";
    }

    // Localisation
    if (message.includes("où") || message.includes("localisation") || message.includes("adresse")) {
      return siteContent.location?.description || "Vous pouvez trouver notre localisation exacte sur la page 'Localisation' de notre site, avec une carte interactive pour nous trouver facilement.";
    }

    // À propos
    if (message.includes("qui êtes-vous") || message.includes("à propos") || message.includes("histoire")) {
      return siteContent.about?.description || "KB&S est votre partenaire de confiance pour des produits de qualité. Découvrez notre histoire et nos valeurs sur la page 'À propos' de notre site.";
    }

    // Activités
    if (message.includes("activité") || message.includes("service") || message.includes("offre")) {
      return siteContent.activities?.description || "Nous proposons une variété de services et d'activités. Découvrez nos offres sur notre site !";
    }

    // Salutations
    if (message.includes("bonjour") || message.includes("salut") || message.includes("bonsoir")) {
      return "Bonjour ! Ravi de vous accueillir chez KB&S. Comment puis-je vous aider aujourd'hui ?";
    }

    // Remerciements
    if (message.includes("merci") || message.includes("merci beaucoup")) {
      return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions concernant KB&S.";
    }

    // Réponse par défaut avec contacts
    return `Je suis spécialisé dans les informations concernant KB&S (produits, commandes, livraison, paiement). Pouvez-vous reformuler votre question en rapport avec nos services ? Pour plus de précision, veuillez contacter notre support :\n\n📞 **Téléphone :** +221 77 029 98 21\n📧 **Email :** kewekane@yahoo.fr\n💬 **WhatsApp :** +221 77 029 98 21`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simuler un délai de réponse
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getKBSResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-6 h-14 w-14 rounded-full bg-kbs-green hover:bg-kbs-green/90 shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-8 right-6 w-80 h-96 shadow-xl z-50 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-kbs-green" />
            Assistant KB&S
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              {message.isBot && (
                <div className="w-6 h-6 rounded-full bg-kbs-green flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] p-2 rounded-lg text-sm ${
                  message.isBot
                    ? 'bg-white text-gray-800 border border-gray-200'
                    : 'bg-kbs-green text-white'
                }`}
              >
                {message.text}
              </div>
              {!message.isBot && (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-kbs-green flex items-center justify-center flex-shrink-0">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="bg-white p-2 rounded-lg text-sm border border-gray-200">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-kbs-green hover:bg-kbs-green/90"
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KBSChatbot;
