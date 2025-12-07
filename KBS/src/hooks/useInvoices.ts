import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  type CreateInvoiceData,
  type InvoiceWithItems,
  type Invoice,
  type InvoiceStatus,
} from "@/services/invoiceService";


// Hook pour récupérer toutes les factures
export const useInvoices = () => {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });
};

// Hook pour récupérer une facture spécifique
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });
};

// Hook pour créer une facture
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

// Hook pour mettre à jour une facture
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Invoice>) =>
      updateInvoice(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
    },
  });
};

// Hook pour mettre à jour le statut d'une facture
export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
    },
  });
};

// Hook pour supprimer une facture
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};