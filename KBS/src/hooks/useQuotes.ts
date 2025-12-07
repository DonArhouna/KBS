import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import * as quoteService from "@/services/quoteService";

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: quoteService.getServices,
  });
};

export const useQuotes = () => {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: quoteService.getQuotes,
  });
};

export const useQuote = (id: string) => {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: () => quoteService.getQuote(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quoteService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Service créé",
        description: "Le service a été créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le service.",
        variant: "destructive",
      });
      console.error("Error creating service:", error);
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, service }: { id: string; service: any }) =>
      quoteService.updateService(id, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Service modifié",
        description: "Le service a été modifié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le service.",
        variant: "destructive",
      });
      console.error("Error updating service:", error);
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quoteService.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Service supprimé",
        description: "Le service a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service.",
        variant: "destructive",
      });
      console.error("Error deleting service:", error);
    },
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quoteService.createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Devis créé",
        description: "Le devis a été créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le devis.",
        variant: "destructive",
      });
      console.error("Error creating quote:", error);
    },
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      quoteService.updateQuote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Devis modifié",
        description: "Le devis a été modifié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le devis.",
        variant: "destructive",
      });
      console.error("Error updating quote:", error);
    },
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quoteService.deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast({
        title: "Devis supprimé",
        description: "Le devis a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le devis.",
        variant: "destructive",
      });
      console.error("Error deleting quote:", error);
    },
  });
};

export const useConvertQuoteToInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: quoteService.convertQuoteToInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Devis converti",
        description: "Le devis a été converti en facture avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de convertir le devis en facture.",
        variant: "destructive",
      });
      console.error("Error converting quote:", error);
    },
  });
};