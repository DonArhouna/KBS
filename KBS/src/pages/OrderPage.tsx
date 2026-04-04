
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getSiteContent, SiteContent } from "@/services/contentService";
import { createOrder } from "@/services/orderService";
import PageBanner from "@/components/PageBanner";
import CheckoutStepper from "@/components/CheckoutStepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, CheckCircle2, Package, MapPin, User as UserIcon, Phone, MessageSquare, ArrowRight, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const OrderPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [content, setContent] = useState<SiteContent['contact']>({ bannerImage: "" });
  const [currentStep, setCurrentStep] = useState(2); // Démarrage à l'étape 2 (Informations)

  // Informations utilisateur
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isDelivery, setIsDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.full_name);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `KB${timestamp}${random}`;
  };

  const handleGoToRecap = () => {
    if (!name || !phone || !address) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  const finalizeOrder = async () => {
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
        paymentMethod: "whatsapp",
        products: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        total: getTotalPrice(),
        user_id: user?.id
      };

      const orderSaved = await createOrder(orderData);
      if (!orderSaved) {
        toast.error("Erreur lors de l'enregistrement. Veuillez réessayer.");
        setIsSubmitting(false);
        return;
      }

      // Envoi WhatsApp
      const { formatOrderForWhatsApp, sendWhatsAppMessage } = await import('../services/whatsappService');
      const message = formatOrderForWhatsApp({
        ...orderData,
        orderDate: new Date().toLocaleDateString('fr-FR'),
        orderTime: new Date().toLocaleTimeString('fr-FR'),
      });
      await sendWhatsAppMessage(message);

      setOrderDetails({ ...orderData, orderNumber });
      setCurrentStep(4);
      clearCart();
      toast.success("Commande validée avec succès !");
    } catch (error) {
      console.error("Order finalization error:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // VUE ÉTAPE 2: INFORMATIONS
  const renderInfoStep = () => (
    <div className="grid lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-kbs-green/10 to-transparent p-6">
            <CardTitle className="flex items-center gap-3 text-kbs-brown">
              <UserIcon className="h-6 w-6 text-kbs-green" />
              Vos Coordonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-gray-700">Nom Complet *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold text-gray-700">Téléphone *</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="7x xxx xx xx" className="rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-gray-700">Email (optionnel)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-bold text-gray-700">Adresse de Livraison *</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} placeholder="Quartier, Rue, Porte..." className="rounded-3xl border-gray-100 bg-gray-50 focus:bg-white transition-all min-h-[120px]" />
            </div>
            <div className="p-4 bg-kbs-green/5 rounded-2xl border border-kbs-green/10 space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox id="delivery" checked={isDelivery} onCheckedChange={(c) => setIsDelivery(c as boolean)} className="rounded-lg border-kbs-green data-[state=checked]:bg-kbs-green" />
                <Label htmlFor="delivery" className="text-sm font-bold text-gray-800 cursor-pointer">Je souhaite me faire livrer à domicile</Label>
              </div>
              {!isDelivery && <p className="text-[xs] text-kbs-green font-medium flex items-center gap-2 pl-7"><MapPin className="w-3 h-3" /> Retrait gratuit en magasin</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardHeader className="bg-gray-50/50 p-6">
            <CardTitle className="flex items-center gap-3 text-kbs-brown">
              <Package className="h-6 w-6 text-kbs-green" />
              Récapitulatif Panier
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500">Qté: {item.quantity} × {formatPrice(item.price)} CFA</p>
                  </div>
                  <p className="font-bold text-kbs-green">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
              <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl">
                <span className="text-lg font-bold text-gray-600">Total à payer</span>
                <span className="text-3xl font-black text-kbs-green">{formatPrice(getTotalPrice())} CFA</span>
              </div>
              <Button onClick={handleGoToRecap} className="w-full mt-8 h-14 bg-kbs-green hover:bg-kbs-green/90 text-white rounded-2xl font-bold text-lg shadow-lg shadow-kbs-green/20 group transition-all">
                Suivant : Récapitulatif
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // VUE ÉTAPE 3: RÉCAPITULATIF
  const renderRecapStep = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-kbs-green/5 p-6 border-b border-kbs-green/10">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-kbs-green" />
              Client & Livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between pb-3 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Nom :</span>
              <span className="font-bold text-gray-900">{name}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Téléphone :</span>
              <span className="font-bold text-gray-900">{phone}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-50">
              <span className="text-gray-500 font-medium">Mode :</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{isDelivery ? "Livraison domicile" : "Retrait magasin"}</span>
            </div>
            <div className="space-y-2">
              <span className="text-gray-500 font-medium block">Adresse :</span>
              <p className="bg-gray-50 p-4 rounded-xl text-gray-700 font-medium">{address}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-kbs-green/5 p-6 border-b border-kbs-green/10">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-kbs-green" />
              Articles commandés
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-gray-700"><span className="font-bold text-kbs-green">{item.quantity}x</span> {item.name}</span>
                  <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 p-6 rounded-2xl text-white">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">Total Global</p>
                  <p className="text-3xl font-black text-kbs-green">{formatPrice(getTotalPrice())} CFA</p>
                </div>
                <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button onClick={() => setCurrentStep(2)} variant="ghost" className="h-14 px-8 rounded-2xl font-bold text-gray-500 hover:text-kbs-green">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Modifier infos
        </Button>
        <Button onClick={finalizeOrder} disabled={isSubmitting} className="h-14 px-12 rounded-2xl bg-kbs-green hover:bg-kbs-green/90 text-white font-black text-xl shadow-2xl shadow-kbs-green/30 animate-pulse-slow">
          {isSubmitting ? "Traitement..." : "VALIDER & ENVOYER"}
          {!isSubmitting && <CheckCircle2 className="ml-3 h-6 w-6" />}
        </Button>
      </div>
    </div>
  );

  // VUE ÉTAPE 4: CONFIRMATION
  const renderConfirmationStep = () => (
    <div className="max-w-2xl mx-auto text-center py-12 animate-in zoom-in duration-700">
      <div className="w-24 h-24 bg-kbs-green text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-kbs-green/40 ring-8 ring-kbs-green/10">
        <CheckCircle2 className="w-14 h-14" />
      </div>
      <h2 className="text-4xl font-black text-gray-900 mb-4">Commande Confirmée !</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Merci pour votre confiance. Votre commande <span className="font-bold text-kbs-green">#{orderDetails?.orderNumber}</span> est en cours de préparation.
      </p>

      <Card className="border-0 shadow-lg bg-white p-8 rounded-3xl mb-8">
        <div className="flex items-center justify-center gap-2 text-kbs-green mb-6">
          <MessageSquare className="w-5 h-5" />
          <span className="font-bold">Commande envoyée via WhatsApp</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Notre équipe a reçu votre demande. Nous reviendrons vers vous très prochainement sur votre numéro WhatsApp pour finaliser la livraison.
        </p>
      </Card>

      <Button onClick={() => navigate("/")} variant="outline" className="h-14 px-12 rounded-2xl border-2 border-kbs-green text-kbs-green font-bold hover:bg-kbs-green hover:text-white transition-all">
        Retour à l'accueil
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-kbs-beige">
      <PageBanner
        title={currentStep === 4 ? "Merci pour votre commande" : "Finalisation de commande"}
        subtitle={currentStep === 4 ? "Votre demande a bien été enregistrée" : "Suivez les étapes pour valider votre panier"}
        imageSrc={content.bannerImage}
      />

      <div className="container-custom py-8">
        <CheckoutStepper currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 2 && renderInfoStep()}
          {currentStep === 3 && renderRecapStep()}
          {currentStep === 4 && renderConfirmationStep()}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
