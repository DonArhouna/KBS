import jsPDF from 'jspdf';
import { QuoteWithItems } from './quoteService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const generateQuotePDF = (quote: QuoteWithItems): void => {
  const doc = new jsPDF();
  
  // Colors uniformisés avec le bordereau de commande
  const primaryColor = '#008751';
  const grayColor = '#6b7280';
  
  // Header style bordereau de commande
  doc.setFillColor(0, 135, 81); // Vert KB&S
  doc.rect(10, 10, 190, 25, 'F');
  
  // KB&S à gauche, DEVIS à droite
  doc.setFontSize(18);
  doc.setTextColor('#ffffff');
  doc.text('KB&S', 20, 27);
  doc.text('DEVIS', 160, 27);
  
  // Détails du devis (style bordereau)
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text('Détails du Devis', 20, 50);
  
  doc.setFontSize(10);
  doc.text(`Numéro de devis: ${quote.quote_number}`, 20, 65);
  doc.text(`Date: ${format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}`, 20, 72);
  doc.text('Statut: ' + (quote.status === 'draft' ? 'Brouillon' : 'Envoyé'), 20, 79);
  
  if (quote.validity_date) {
    doc.text(`Valide jusqu'au: ${format(new Date(quote.validity_date), 'dd/MM/yyyy', { locale: fr })}`, 20, 86);
  }
  
  // Informations client (style bordereau)
  let yPos = quote.validity_date ? 105 : 98;
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text('Informations Client', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.text(`Nom: ${quote.customer_name}`, 20, yPos);
  
  if (quote.customer_company) {
    yPos += 7;
    doc.text(`Entreprise: ${quote.customer_company}`, 20, yPos);
  }
  
  yPos += 7;
  doc.text(`Email: ${quote.customer_email}`, 20, yPos);
  
  if (quote.customer_phone) {
    yPos += 7;
    doc.text(`Téléphone: ${quote.customer_phone}`, 20, yPos);
  }
  
  if (quote.customer_address) {
    yPos += 7;
    doc.text(`Adresse: ${quote.customer_address}`, 20, yPos);
  }
  
  // Services proposés (style bordereau avec tableau structuré)
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text('Services Proposés', 20, yPos);
  
  yPos += 15;
  
  // En-tête du tableau avec bordures
  doc.setDrawColor(0, 135, 81);
  doc.setLineWidth(0.5);
  
  // Ligne horizontale du haut
  doc.line(20, yPos - 5, 190, yPos - 5);
  
  doc.setFontSize(10);
  doc.setTextColor('#000000');
  doc.text('Service', 25, yPos);
  doc.text('Qté', 115, yPos);
  doc.text('Prix Unit.', 140, yPos);
  doc.text('Sous-total', 165, yPos);
  
  // Ligne horizontale sous l'en-tête
  doc.line(20, yPos + 3, 190, yPos + 3);
  
  // Lignes verticales
  doc.line(20, yPos - 5, 20, yPos + 3);
  doc.line(110, yPos - 5, 110, yPos + 3);
  doc.line(135, yPos - 5, 135, yPos + 3);
  doc.line(160, yPos - 5, 160, yPos + 3);
  doc.line(190, yPos - 5, 190, yPos + 3);
  
  yPos += 15;
  
  // Contenu du tableau
  quote.quote_items.forEach((item, index) => {
    const startY = yPos - 5;
    
    doc.setFontSize(9);
    doc.setTextColor('#000000');
    
    // Service name
    const serviceLines = doc.splitTextToSize(item.service_name, 80);
    doc.text(serviceLines, 25, yPos);
    
    // Quantity
    doc.text(item.quantity.toString(), 117, yPos);
    
    // Unit price
    doc.text(`${item.unit_price.toLocaleString()} FCFA`, 142, yPos);
    
    // Subtotal
    doc.text(`${item.subtotal.toLocaleString()} FCFA`, 167, yPos);
    
    const lineHeight = Math.max(serviceLines.length * 4, 8);
    yPos += lineHeight;
    
    // Lignes du tableau
    doc.line(20, startY, 20, yPos);
    doc.line(110, startY, 110, yPos);
    doc.line(135, startY, 135, yPos);
    doc.line(160, startY, 160, yPos);
    doc.line(190, startY, 190, yPos);
    doc.line(20, yPos, 190, yPos);
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
  });
  
  // Total (aligné à droite comme dans le bordereau)
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor('#000000');
  doc.text(`Total: ${quote.total_amount.toLocaleString()} FCFA`, 140, yPos);
  
  // Notes
  if (quote.notes) {
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Notes:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor('#000000');
    const noteLines = doc.splitTextToSize(quote.notes, 170);
    doc.text(noteLines, 20, yPos);
  }
  
  // Terms and conditions
  if (quote.terms_conditions) {
    yPos += 30;
    
    // Add new page if needed
    if (yPos > 220) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Conditions générales:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor('#000000');
    const termsLines = doc.splitTextToSize(quote.terms_conditions, 170);
    doc.text(termsLines, 20, yPos);
  }
  
  // Footer style bordereau
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(grayColor);
    doc.text(`Page ${i} sur ${pageCount}`, 20, 285);
    doc.text('KB&S - Services informatiques', 80, 285);
  }

  // Download the PDF
  doc.save(`Devis_${quote.quote_number}.pdf`);
};

// Générer un PDF pour les factures
export const generateInvoicePDF = (invoice: any): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Couleurs
  const primaryColor = [0, 135, 81]; // KBS Green
  const textColor = [51, 51, 51];
  const lightGray = [245, 245, 245];

  // Titre FACTURE
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('FACTURE', 20, 30);
  
  // Informations de l'entreprise déplacées en haut à droite
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Kewe Business & Services', pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Adresse principale :', pageWidth - 20, 27, { align: 'right' });
  doc.text('Villa 103 Cité ANCAR 2, Kounoune', pageWidth - 20, 34, { align: 'right' });
  doc.text('Dépôt : Maristes, Dakar / 77 029 98 21', pageWidth - 20, 41, { align: 'right' });
  
  // Informations de la facture
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Numéro: ${invoice.invoice_number}`, 20, 50);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString('fr-FR')}`, 20, 57);
  doc.text(`Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`, 20, 64);

  // Informations client
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 90, pageWidth - 40, 40, 'F');
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('FACTURÉ À:', 25, 105);
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(invoice.customer_name, 25, 115);
  if (invoice.customer_company) {
    doc.text(invoice.customer_company, 25, 122);
  }
  doc.text(invoice.customer_email, 25, invoice.customer_company ? 129 : 122);
  if (invoice.customer_phone) {
    doc.text(invoice.customer_phone, 25, invoice.customer_company ? 136 : 129);
  }
  if (invoice.customer_address) {
    const addressLines = doc.splitTextToSize(invoice.customer_address, 80);
    doc.text(addressLines, 25, invoice.customer_phone ? 143 : 136);
  }

  // Tableau des articles
  let yPosition = 150;
  
  // En-tête du tableau
  doc.setFillColor(0, 135, 81);
  doc.rect(20, yPosition, pageWidth - 40, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('DESCRIPTION', 25, yPosition + 7);
  doc.text('QTÉ', pageWidth - 90, yPosition + 7, { align: 'center' });
  doc.text('PRIX UNIT.', pageWidth - 60, yPosition + 7, { align: 'center' });
  doc.text('TOTAL', pageWidth - 25, yPosition + 7, { align: 'right' });
  
  yPosition += 10;
  
  // Articles
  doc.setTextColor(51, 51, 51);
  doc.setFont(undefined, 'normal');
  
  if (invoice.invoice_items && invoice.invoice_items.length > 0) {
    invoice.invoice_items.forEach((item: any, index: number) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Alternance des couleurs de fond
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition, pageWidth - 40, 10, 'F');
      }
      
      // Description (avec retour à la ligne si nécessaire)
      const descriptionLines = doc.splitTextToSize(item.description, 100);
      doc.text(descriptionLines, 25, yPosition + 7);
      
      // Quantité
      doc.text(item.quantity.toString(), pageWidth - 90, yPosition + 7, { align: 'center' });
      
      // Prix unitaire
      doc.text(`${item.unit_price.toFixed(0)} Fr CFA`, pageWidth - 60, yPosition + 7, { align: 'center' });
      
      // Total
      doc.text(`${item.subtotal.toFixed(0)} Fr CFA`, pageWidth - 25, yPosition + 7, { align: 'right' });
      
      yPosition += Math.max(10, descriptionLines.length * 5);
    });
  }

  // Total
  yPosition += 10;
  doc.setFillColor(0, 135, 81);
  doc.rect(pageWidth - 80, yPosition, 60, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: ${invoice.total_amount.toFixed(0)} Fr CFA`, pageWidth - 25, yPosition + 7, { align: 'right' });

  // Notes
  if (invoice.notes) {
    yPosition += 25;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('NOTES:', 20, yPosition);
    
    doc.setFont(undefined, 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(notesLines, 20, yPosition + 7);
  }

  // Statut en filigrane
  if (invoice.status) {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.setFont(undefined, 'bold');
    
    // Calcul de la position pour centrer le texte
    const statusText = invoice.status === 'paid' ? 'PAYÉE' : 
                      invoice.status === 'pending' ? 'EN ATTENTE' : 
                      invoice.status === 'overdue' ? 'EN RETARD' : 
                      invoice.status.toUpperCase();
    
    // Positionner le texte au centre de la page avec rotation
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    doc.text(statusText, centerX, centerY, {
      align: 'center',
      angle: -45
    });
  }
  
  // Numéro de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }

  // Télécharger le PDF
  doc.save(`Facture_${invoice.invoice_number}.pdf`);
};