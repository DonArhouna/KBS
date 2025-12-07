import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Send, Eye } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import InvoiceDialog from "./InvoiceDialog";
import { generateInvoicePDF } from "@/services/pdfService";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  notes?: string;
  invoice_items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const InvoicesAdmin = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { data: invoices = [], isLoading } = useInvoices();
  const { toast } = useToast();

  const handleEdit = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setIsDialogOpen(true);
  };

  const handleDownloadPDF = (invoice: any) => {
    try {
      generateInvoicePDF(invoice);
      toast({
        title: "PDF généré",
        description: "La facture a été téléchargée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'sent':
        return 'Envoyée';
      case 'overdue':
        return 'En retard';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'Brouillon';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Facturation</h2>
          <p className="text-muted-foreground">
            Gérez vos factures et générez de nouveaux documents
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="admin-table">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-kbs-green to-kbs-light text-white">
              <tr>
                <th className="text-left p-4 font-semibold">N° Facture</th>
                <th className="text-left p-4 font-semibold">Client</th>
                <th className="text-left p-4 font-semibold">Échéance</th>
                <th className="text-left p-4 font-semibold">Montant</th>
                <th className="text-left p-4 font-semibold">Statut</th>
                <th className="text-center p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={invoice.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="p-4 font-medium text-gray-700">{invoice.invoice_number}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-700">{invoice.customer_name}</p>
                      <p className="text-sm text-gray-600">{invoice.customer_email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</td>
                  <td className="p-4 font-semibold text-kbs-green">{invoice.total_amount.toLocaleString()} FCFA</td>
                  <td className="p-4">
                    <Badge className={`rounded-full px-3 py-1 ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(invoice)}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice)}
                        title="Télécharger PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invoices.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première facture
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une facture
            </Button>
          </CardContent>
        </Card>
      )}

      <InvoiceDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default InvoicesAdmin;