import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Wrench, Receipt, Mail, Download, MessageCircle } from "lucide-react";
import { useQuotes, useServices, useConvertQuoteToInvoice } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { QuoteDialog } from "./QuoteDialog";
import { ServiceDialog } from "./ServiceDialog";
import { QuoteStatus } from "@/services/quoteService";
import { generateQuotePDF } from "@/services/pdfService";
import { sendWhatsAppMessage, formatQuoteForWhatsApp } from "@/services/whatsappService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest } from "@/lib/api";

const statusColors: Record<QuoteStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  converted: "bg-purple-100 text-purple-800"
};

const statusLabels: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  rejected: "Rejeté",
  converted: "Converti"
};

export function QuotesAdmin() {
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);

  const { data: quotes = [], isLoading: quotesLoading } = useQuotes();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const convertQuote = useConvertQuoteToInvoice();
  const { toast } = useToast();

  const handleEditQuote = (quote: any) => {
    setSelectedQuote(quote);
    setQuoteDialogOpen(true);
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setServiceDialogOpen(true);
  };

  const handleConvertQuote = (quoteId: string) => {
    convertQuote.mutate(quoteId);
  };

  const handleDownloadPDF = (quote: any) => {
    generateQuotePDF(quote);
  };

  const handleSendWhatsApp = async (quote: any) => {
    try {
      const message = formatQuoteForWhatsApp(quote);
      await sendWhatsAppMessage(message);
      toast({
        title: "WhatsApp envoyé",
        description: "Devis envoyé via WhatsApp avec succès !",
      });
    } catch (error) {
      console.error('Erreur WhatsApp:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi WhatsApp",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async (quote: any) => {
    try {
      await apiRequest('/send-quote-email', {
        method: 'POST',
        body: JSON.stringify({ quote })
      });

      toast({
        title: "Email envoyé",
        description: "Le devis a été envoyé par email avec succès.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email. Vérifiez votre configuration.",
        variant: "destructive",
      });
    }
  };

  const handleCloseQuoteDialog = () => {
    setQuoteDialogOpen(false);
    setSelectedQuote(null);
  };

  const handleCloseServiceDialog = () => {
    setServiceDialogOpen(false);
    setSelectedService(null);
  };

  if (quotesLoading || servicesLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Devis</h1>
      </div>

      <Tabs defaultValue="quotes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Devis
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Liste des Devis</h2>
            <Button
              onClick={() => setQuoteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau Devis
            </Button>
          </div>

          <div className="grid gap-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{quote.quote_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {quote.customer_name} - {quote.customer_company || 'Particulier'}
                    </p>
                  </div>
                  <Badge className={statusColors[quote.status as QuoteStatus]}>
                    {statusLabels[quote.status as QuoteStatus]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Total:</strong> {quote.total_amount} FCFA
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Créé le {format(new Date(quote.created_at), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      {quote.validity_date && (
                        <p className="text-sm text-muted-foreground">
                          Valide jusqu'au {format(new Date(quote.validity_date), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuote(quote)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(quote)}
                        className="flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendWhatsApp(quote)}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(quote)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                      {quote.status === 'accepted' && (
                        <Button
                          size="sm"
                          onClick={() => handleConvertQuote(quote.id)}
                          disabled={convertQuote.isPending}
                          className="flex items-center gap-1"
                        >
                          <Receipt className="h-3 w-3" />
                          Convertir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Services Disponibles</h2>
            <Button
              onClick={() => setServiceDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nouveau Service
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  {service.category && (
                    <Badge variant="outline">{service.category}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                     <p className="text-lg font-semibold">
                       {service.unit_price} FCFA / {service.unit}
                     </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="w-full mt-2"
                    >
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <QuoteDialog
        open={quoteDialogOpen}
        onClose={handleCloseQuoteDialog}
        quote={selectedQuote}
        services={services}
      />

      <ServiceDialog
        open={serviceDialogOpen}
        onClose={handleCloseServiceDialog}
        service={selectedService}
      />
    </div>
  );
}