
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, X, User, Phone, Mail, MapPin, Calendar, Package, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from 'jspdf';
import { toast } from "sonner";

interface OrderDetailProps {
  order: any;
  onClose: () => void;
}

const OrderDetail = ({ order, onClose }: OrderDetailProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fonction pour formater les montants avec des espaces
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR').replace(/\s/g, ' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;

      // Configuration des couleurs - définies comme tuples
      const primaryColor: [number, number, number] = [0, 135, 81]; // Vert KB&S
      const secondaryColor: [number, number, number] = [140, 198, 63]; // Vert clair KB&S
      const textColor: [number, number, number] = [51, 51, 51];
      const lightGray: [number, number, number] = [248, 249, 250];

      // En-tête avec logo et titre
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KB&S', 20, 20);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Bordereau de Commande', pageWidth - 20, 20, { align: 'right' });

      yPosition = 50;

      // Informations de la commande
      pdf.setTextColor(...textColor);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Détails de la Commande', 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const orderInfo = [
        `Numéro de commande: #${order.order_number}`,
        `Date: ${format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}`,
        `Statut: ${getStatusText(order.status)}`,
        `Mode de livraison: ${order.delivery_mode === 'delivery' ? 'Livraison' : 'Retrait'}`
      ];

      orderInfo.forEach(info => {
        pdf.text(info, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Informations client
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informations Client', 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const clientInfo = [
        `Nom: ${order.customer_name}`,
        `Email: ${order.customer_email}`,
        `Téléphone: ${order.customer_phone}`,
        `Adresse: ${order.customer_address}`
      ];

      clientInfo.forEach(info => {
        pdf.text(info, 20, yPosition);
        yPosition += 8;
      });

      yPosition += 15;

      // Tableau des articles
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Articles Commandés', 20, yPosition);
      
      yPosition += 15;

      // En-tête du tableau
      pdf.setFillColor(...lightGray);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Produit', 25, yPosition + 3);
      pdf.text('Qté', pageWidth - 100, yPosition + 3);
      pdf.text('Prix Unit.', pageWidth - 70, yPosition + 3);
      pdf.text('Sous-total', pageWidth - 35, yPosition + 3);
      
      yPosition += 15;

      // Articles
      pdf.setFont('helvetica', 'normal');
      let totalAmount = 0;
      
      order.items.forEach((item: any) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const subtotal = item.quantity * item.unit_price;
        totalAmount += subtotal;
        
        pdf.text(item.product_name, 25, yPosition);
        pdf.text(item.quantity.toString(), pageWidth - 100, yPosition);
        pdf.text(`${formatAmount(item.unit_price)} FCFA`, pageWidth - 70, yPosition);
        pdf.text(`${formatAmount(subtotal)} FCFA`, pageWidth - 35, yPosition);
        
        yPosition += 10;
      });

      // Ligne de séparation
      pdf.setDrawColor(...primaryColor);
      pdf.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
      
      yPosition += 15;

      // Total
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total:', pageWidth - 80, yPosition);
      pdf.text(`${formatAmount(totalAmount)} FCFA`, pageWidth - 35, yPosition);

      // Notes (si présentes)
      if (order.notes) {
        yPosition += 20;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Notes:', 20, yPosition);
        
        yPosition += 10;
        pdf.setFont('helvetica', 'normal');
        const splitNotes = pdf.splitTextToSize(order.notes, pageWidth - 40);
        pdf.text(splitNotes, 20, yPosition);
      }

      // Pied de page
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('KB&S - Produits Agroalimentaires Naturels', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Sauvegarde du PDF
      pdf.save(`Commande_${order.order_number}.pdf`);
      
      toast.success('Bordereau généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const calculateTotal = () => {
    return order.items?.reduce((total: number, item: any) => {
      return total + (item.quantity * item.unit_price);
    }, 0) || 0;
  };

  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
        <DialogHeader className="pb-6 bg-gradient-to-r from-kbs-green to-kbs-light text-white rounded-t-2xl -m-6 mb-6 p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Commande #{order.order_number}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Badge className={`rounded-full px-4 py-2 font-semibold ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 bg-gray-50 p-6 rounded-2xl">
          {/* Informations générales */}
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-kbs-green">
                <Package className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="font-medium">
                    {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Montant total:</span>
                  <span className="font-bold text-kbs-green">
                    {formatAmount(order.total_amount)} FCFA
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mode de livraison:</span>
                <Badge variant="outline" className="rounded-full">
                  {order.delivery_mode === 'delivery' ? 'Livraison' : 'Retrait'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-kbs-green">
                <User className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{order.customer_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <span className="text-sm">{order.customer_address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Articles commandés - Tableau amélioré */}
          <Card className="bg-white rounded-2xl shadow-sm border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-kbs-green">
                <Package className="h-5 w-5" />
                Articles commandés
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-full">
                {/* En-tête du tableau */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700 mb-2">
                  <div className="col-span-5">Produit</div>
                  <div className="col-span-2 text-center">Qté</div>
                  <div className="col-span-2 text-right">Prix Unit.</div>
                  <div className="col-span-3 text-right">Sous-total</div>
                </div>
                
                {/* Articles */}
                <div className="space-y-2">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg items-center">
                      <div className="col-span-5">
                        <h4 className="font-medium text-kbs-brown text-sm">{item.product_name}</h4>
                      </div>
                      <div className="col-span-2 text-center text-sm font-medium">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right text-sm font-medium">
                        {formatAmount(item.unit_price)} FCFA
                      </div>
                      <div className="col-span-3 text-right font-bold text-kbs-green text-sm">
                        {formatAmount(item.quantity * item.unit_price)} FCFA
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Total */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-kbs-green/10 rounded-lg">
                  <div className="col-span-9 text-right text-lg font-bold text-kbs-brown">
                    Total:
                  </div>
                  <div className="col-span-3 text-right text-lg font-bold text-kbs-green">
                    {formatAmount(calculateTotal())} FCFA
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-kbs-green">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Génération...' : 'Télécharger PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetail;
