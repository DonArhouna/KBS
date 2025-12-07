import { apiRequest } from '../lib/api';

// Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  due_date: string;
  status: InvoiceStatus;
  notes?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface CreateInvoiceData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  due_date: string;
  status?: InvoiceStatus;
  notes?: string;
  total_amount: number;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

// Générer un numéro de facture unique
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime();
  return `FACT-${year}${month}-${timestamp.toString().slice(-6)}`;
};

// Récupérer toutes les factures avec leurs articles
export const getInvoices = async (): Promise<InvoiceWithItems[]> => {
  try {
    const invoices = await apiRequest<InvoiceWithItems[]>('/invoices');
    return invoices;
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return [];
  }
};

// Récupérer une facture spécifique avec ses articles
export const getInvoice = async (id: string): Promise<InvoiceWithItems | null> => {
  try {
    const invoice = await apiRequest<InvoiceWithItems>(`/invoices/${id}`);
    return invoice;
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    return null;
  }
};

// Créer une nouvelle facture
export const createInvoice = async (invoiceData: CreateInvoiceData): Promise<Invoice | null> => {
  try {
    const invoice = await apiRequest<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
    return invoice;
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return null;
  }
};

// Mettre à jour une facture
export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice | null> => {
  try {
    const invoice = await apiRequest<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return invoice;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    return null;
  }
};

// Mettre à jour le statut d'une facture
export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<Invoice | null> => {
  try {
    const invoice = await apiRequest<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return invoice;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la facture:', error);
    return null;
  }
};

// Supprimer une facture
export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    return false;
  }
};