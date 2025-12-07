
import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { getSiteContent, SiteContent } from "@/services/contentService";
import { sendOrderEmail } from "@/services/emailService";
import { createOrder } from "@/services/orderService";
import PageBanner from "@/components/PageBanner";
import PaymentMethods from "@/components/PaymentMethods";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const OrderPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [content, setContent] = useState<SiteContent['contact']>({ bannerImage: "" });
  
  // Informations utilisateur
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  // Options de livraison
  const [isDelivery, setIsDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const siteContent = await getSiteContent();
        setContent(siteContent.contact);
      } catch (error) {
        console.error("Erreur lors du chargement du contenu:", error);
      }
    };

    loadContent();
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `KB${timestamp}${random}`;
  };

  const sendWhatsAppOrder = async (baseOrderData: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    deliveryMode: string;
    products: { name: string; quantity: number; price: number; subtotal: number }[];
    total: number;
    notes: string;
  }) => {
    const orderDate = new Date().toLocaleDateString('fr-FR');
    const orderTime = new Date().toLocaleTimeString('fr-FR');

    const orderForWhatsApp = {
      ...baseOrderData,
      orderDate,
      orderTime,
    };

    try {
      console.log('Envoi de la commande WhatsApp...');
      const { formatOrderForWhatsApp, sendWhatsAppMessage } = await import('../services/whatsappService');
      const message = formatOrderForWhatsApp(orderForWhatsApp);
      await sendWhatsAppMessage(message);
      console.log('Commande WhatsApp envoyée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
      return false;
    }
  };
  const handlePaymentMethodSelect = async (method: string, details?: any) => {
    if (cartItems.length === 0) {
      toast.error("Veuillez ajouter des produits à votre panier avant de commander.");
      return;
    }

    if (!name || !phone || !address) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();
      const orderData = {
        orderNumber,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        deliveryMode: isDelivery ? "Livraison à domicile" : "Retrait en magasin",
        notes: notes || "Aucune note particulière",
        paymentMethod: method,
        paymentDetails: details,
        products: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        total: getTotalPrice()
      };

      // Enregistrer la commande dans la base de données
      console.log('Enregistrement de la commande dans la base de données...');
      const orderSaved = await createOrder(orderData);
      
      if (!orderSaved) {
        toast.error("Erreur lors de l'enregistrement de la commande. Veuillez réessayer.");
        setIsSubmitting(false);
        return;
      }

      console.log('Commande enregistrée avec succès dans la base de données');

      if (method === "whatsapp") {
        await sendWhatsAppOrder(orderData);
        toast.success("Commande enregistrée et envoyée via WhatsApp en arrière-plan !");
      } else if (method === "card") {
        toast.info("Paiement par carte bancaire - Redirection vers le processeur de paiement...");
        // TODO: Intégrer l'API de paiement par carte
        console.log("Détails de la carte:", details);
      } else if (method === "wave") {
        toast.info("Paiement Wave - Redirection vers Wave...");
        // TODO: Intégrer l'API Wave
        console.log("Numéro Wave:", details.phoneNumber);
      } else if (method === "orange_money") {
        toast.info("Paiement Orange Money - Redirection vers Orange Money...");
        // TODO: Intégrer l'API Orange Money
        console.log("Numéro Orange Money:", details.phoneNumber);
      }

      // Vider le panier après commande réussie
      clearCart();
      
      // Redirection vers la page d'accueil après un délai
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de l'envoi de la commande:", error);
      toast.error("Une erreur est survenue lors de l'envoi de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageBanner 
        title="Passer une commande"
        subtitle="Finalisez votre commande et choisissez votre mode de paiement"
        imageSrc={content.bannerImage}
      />

      <section className="py-16 bg-white">
        <div className="container-custom">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
              <p className="text-gray-600 mb-6">Ajoutez des produits à votre panier pour passer une commande.</p>
              <Button onClick={() => navigate("/products")} className="bg-kbs-green hover:bg-kbs-green/90">
                Découvrir nos produits
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Récapitulatif de la commande */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Votre commande
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-kbs-green font-semibold">{formatPrice(item.price)} CFA</p>
                          <p className="text-sm text-gray-600">Sous-total: {formatPrice(item.price * item.quantity)} CFA</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-kbs-green">{formatPrice(getTotalPrice())} CFA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Formulaire de commande */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de livraison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone *</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Votre adresse email (optionnel)"
                          />
                        </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse *</Label>
                        <Textarea
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          rows={3}
                          placeholder="Votre adresse complète"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Mode de livraison</Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="delivery" 
                            checked={isDelivery}
                            onCheckedChange={(checked) => setIsDelivery(checked as boolean)}
                          />
                          <Label htmlFor="delivery">Livraison à domicile</Label>
                        </div>
                        {!isDelivery && (
                          <p className="text-sm text-gray-600">📍 Retrait en magasin</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes supplémentaires</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          placeholder="Instructions spéciales, préférences de livraison..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Modes de paiement */}
                <PaymentMethods
                  totalAmount={getTotalPrice()}
                  onPaymentSelect={handlePaymentMethodSelect}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OrderPage;
