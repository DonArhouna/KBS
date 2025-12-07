
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Loader2 } from "lucide-react";

type ImageUploaderProps = {
  currentImageUrl: string;
  onImageSelected: (imageUrl: string) => void;
  label?: string;
};

const ImageUploader = ({ currentImageUrl, onImageSelected, label = "Image" }: ImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);

  // Fonction pour gérer l'upload de fichiers
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image");
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse. Maximum 5MB autorisé");
      return;
    }

    setIsUploading(true);

    try {
      // Convertir l'image en URL Data pour prévisualisation locale
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageUrl(base64String);
        onImageSelected(base64String);
        toast.success("Image téléchargée avec succès");
        setIsUploading(false);
      };

      reader.onerror = () => {
        toast.error("Erreur lors du chargement de l'image");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erreur lors du téléchargement de l'image");
      setIsUploading(false);
    }
  };

  // Fonction pour utiliser une URL externe
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error("Veuillez entrer une URL d'image valide");
      return;
    }

    onImageSelected(imageUrl);
    toast.success("URL d'image enregistrée");
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      <Tabs defaultValue="url">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="upload" className="flex-1">
            <Upload size={16} className="mr-2" /> Télécharger
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1">
            <LinkIcon size={16} className="mr-2" /> URL externe
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="flex items-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p className="text-sm text-muted-foreground">Chargement en cours...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="url" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Appliquer</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {imageUrl && (
        <div className="mt-4 border rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-auto max-h-[200px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+non+disponible";
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
