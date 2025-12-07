import { apiRequest } from '../lib/api';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit_price: number;
  is_active: boolean;
  created_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  customer_company?: string;
  validity_date?: string;
  notes?: string;
  terms_conditions?: string;
  total_amount: number;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  service_id?: string;
  service_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}

export interface CreateQuoteData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  customer_company?: string;
  validity_date?: string;
  notes?: string;
  terms_conditions?: string;
  items: {
    service_id?: string;
    service_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }[];
}

// Generate quote number
export const generateQuoteNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-6);
  return `DEV-${year}${month}${day}-${time}`;
};

// Services functions
export const getServices = async (): Promise<Service[]> => {
  try {
    const services = await apiRequest<Service[]>('/services');
    return services;
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return [];
  }
};

export const createService = async (service: Omit<Service, 'id' | 'created_at'>): Promise<Service | null> => {
  try {
    const newService = await apiRequest<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    });
    return newService;
  } catch (error) {
    console.error('Erreur lors de la création du service:', error);
    return null;
  }
};

export const updateService = async (id: string, service: Partial<Service>): Promise<Service | null> => {
  try {
    const updatedService = await apiRequest<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
    return updatedService;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du service:', error);
    return null;
  }
};

export const deleteService = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/services/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    return false;
  }
};

// Quotes functions
export const getQuotes = async (): Promise<QuoteWithItems[]> => {
  try {
    const quotes = await apiRequest<QuoteWithItems[]>('/quotes');
    return quotes;
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    return [];
  }
};

export const getQuote = async (id: string): Promise<QuoteWithItems | null> => {
  try {
    const quote = await apiRequest<QuoteWithItems>(`/quotes/${id}`);
    return quote;
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    return null;
  }
};

export const createQuote = async (quoteData: CreateQuoteData): Promise<Quote | null> => {
  try {
    const quote = await apiRequest<Quote>('/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
    return quote;
  } catch (error) {
    console.error('Erreur lors de la création du devis:', error);
    return null;
  }
};

export const updateQuote = async (id: string, updates: Partial<Quote>): Promise<Quote | null> => {
  try {
    const updatedQuote = await apiRequest<Quote>(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return updatedQuote;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis:', error);
    return null;
  }
};

export const updateQuoteStatus = async (id: string, status: QuoteStatus): Promise<Quote | null> => {
  return updateQuote(id, { status });
};

export const deleteQuote = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/quotes/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    return false;
  }
};

// Convert quote to invoice (creates an order)
export const convertQuoteToInvoice = async (quoteId: string): Promise<any | null> => {
  try {
    const order = await apiRequest(`/quotes/${quoteId}/convert-to-order`, {
      method: 'POST',
    });
    return order;
  } catch (error) {
    console.error('Erreur lors de la conversion du devis en commande:', error);
    return null;
  }
};