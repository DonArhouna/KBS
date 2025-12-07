import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getSiteContentOptimized, updateSiteContent, getDefaultContent, SiteContent } from "@/services/contentService";
import { uploadImage, base64ToFile } from "@/services/storageService";

import ContentAccordion from "./ContentAccordion";
import SaveButton from "./SaveButton";
import AdminCard from "./AdminCard";

const ContentAdmin = () => {
  const [content, setContent] = useState<SiteContent>(getDefaultContent());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger le contenu du site depuis Supabase
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const siteContent = await getSiteContentOptimized();
      setContent(siteContent);
    } catch (error) {
      toast.error("Erreur lors du chargement du contenu");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Traiter les images base64 en les téléchargeant vers Supabase Storage
      const processedContent = { ...content };
      
      // Pour chaque section et chaque champ qui contient une image
      for (const section of Object.keys(content) as Array<keyof SiteContent>) {
        for (const field of Object.keys(content[section]) as Array<keyof SiteContent[typeof section]>) {
          const value = content[section][field] as string | string[];
          
          // Gérer les tableaux d'images (comme heroImages)
          if (Array.isArray(value)) {
            const processedArray = [];
            for (const item of value) {
              if (typeof item === 'string') {
                // Traiter les images base64
                if (item.startsWith('data:image')) {
                  const file = await base64ToFile(item, `content-${section}-${field}-${Date.now()}.jpg`);
                  if (file) {
                    const uploadedUrl = await uploadImage(file, 'images', 'content');
                    if (uploadedUrl) {
                      processedArray.push(uploadedUrl);
                    } else {
                      processedArray.push(item);
                    }
                  } else {
                    processedArray.push(item);
                  }
                } else {
                  processedArray.push(item);
                }
              } else {
                processedArray.push(item);
              }
            }
            (processedContent[section] as any)[field] = processedArray;
          }
          // Gérer les images individuelles
          else if (typeof value === 'string') {
            // Traiter les images base64
            if (value.startsWith('data:image')) {
              const file = await base64ToFile(value, `content-${section}-${field}-${Date.now()}.jpg`);
              if (file) {
                const uploadedUrl = await uploadImage(file, 'images', 'content');
                if (uploadedUrl) {
                  (processedContent[section] as any)[field] = uploadedUrl;
                }
              }
            } else {
              (processedContent[section] as any)[field] = value;
            }
          }
        }
      }
      
      // Enregistrer le contenu
      const success = await updateSiteContent(processedContent);
      
      if (success) {
        setContent(processedContent);
        toast.success("Contenu du site mis à jour avec succès");
        
        // Forcer le rechargement des données sur toutes les pages
        // En émettant un événement personnalisé
        window.dispatchEvent(new CustomEvent('contentUpdated'));
        
        // Recharger le contenu après un court délai pour s'assurer que la BD est à jour
        setTimeout(() => {
          loadContent();
        }, 1000);
      } else {
        toast.error("Erreur lors de la mise à jour du contenu");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: keyof SiteContent, field: string, value: string | string[]) => {
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: value
      }
    });
  };

  const handleImageSelected = (section: keyof SiteContent, field: string, imageUrl: string) => {
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: imageUrl
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-kbs-green mx-auto mb-4" />
          <p className="text-gray-600">Chargement du contenu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminCard title="Gestion du Contenu du Site">
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Personnalisez le contenu affiché sur toutes les pages de votre site
          </p>
          
          <div className="flex justify-end">
            <SaveButton onClick={handleSaveChanges} isSaving={isSaving} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <ContentAccordion 
            content={content}
            onInputChange={handleInputChange}
            onImageSelected={handleImageSelected}
          />
        </div>

        <div className="flex justify-end mt-6">
          <SaveButton onClick={handleSaveChanges} isSaving={isSaving} />
        </div>
      </AdminCard>
    </div>
  );
};

export default ContentAdmin;
