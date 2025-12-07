
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodsProps {
  totalAmount: number;
  onPaymentSelect: (method: string, details?: any) => void;
}

const PaymentMethods = ({ totalAmount, onPaymentSelect }: PaymentMethodsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("whatsapp");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: ""
  });
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePayment = () => {
    switch (selectedMethod) {
      case "card":
        if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardHolder) {
          toast.error("Veuillez remplir tous les champs de la carte");
          return;
        }
        onPaymentSelect("card", cardDetails);
        break;
      case "wave":
        if (!phoneNumber) {
          toast.error("Veuillez entrer votre numéro Wave");
          return;
        }
        onPaymentSelect("wave", { phoneNumber });
        break;
      case "orange_money":
        if (!phoneNumber) {
          toast.error("Veuillez entrer votre numéro Orange Money");
          return;
        }
        onPaymentSelect("orange_money", { phoneNumber });
        break;
      default:
        onPaymentSelect("whatsapp");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Modes de paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          {/* WhatsApp */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp" id="whatsapp" />
            <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              WhatsApp (Recommandé)
            </Label>
          </div>

          {/* Carte bancaire */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" />
              Carte bancaire
            </Label>
          </div>

          {/* Wave */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="wave" id="wave" />
            <Label htmlFor="wave" className="flex items-center gap-2 cursor-pointer">
              <Smartphone className="h-4 w-4" />
              Wave
            </Label>
          </div>

          {/* Orange Money */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="orange_money" id="orange_money" />
            <Label htmlFor="orange_money" className="flex items-center gap-2 cursor-pointer">
              <Phone className="h-4 w-4" />
              Orange Money
            </Label>
          </div>
        </RadioGroup>

        {/* Champs spécifiques selon le mode de paiement */}
        {selectedMethod === "card" && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium">Informations de carte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="cardHolder">Nom du titulaire</Label>
                <Input
                  id="cardHolder"
                  value={cardDetails.cardHolder}
                  onChange={(e) => setCardDetails({...cardDetails, cardHolder: e.target.value})}
                  placeholder="Nom complet"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input
                  id="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Date d'expiration</Label>
                <Input
                  id="expiryDate"
                  value={cardDetails.expiryDate}
                  onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {(selectedMethod === "wave" || selectedMethod === "orange_money") && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium">
              {selectedMethod === "wave" ? "Numéro Wave" : "Numéro Orange Money"}
            </h3>
            <div>
              <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+221 XX XXX XX XX"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total à payer:</span>
            <span className="text-xl font-bold text-kbs-green">
              {totalAmount.toLocaleString()} CFA
            </span>
          </div>
          
          <Button
            onClick={handlePayment}
            className="w-full bg-kbs-green hover:bg-kbs-green/90"
          >
            {selectedMethod === "whatsapp" 
              ? "Envoyer commande via WhatsApp"
              : selectedMethod === "card"
              ? "Payer par carte"
              : selectedMethod === "wave"
              ? "Payer avec Wave"
              : "Payer avec Orange Money"
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
