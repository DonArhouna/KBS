
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { SiteContent } from "@/services/contentService";

interface HomeSectionProps {
  content: SiteContent['home'];
  onInputChange: (field: string, value: string | string[]) => void;
  onImageSelected: (field: string, imageUrl: string) => void;
}

const HomeSection = ({ content, onInputChange, onImageSelected }: HomeSectionProps) => {
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleAddHeroImage = () => {
    if (newImageUrl.trim()) {
      const currentImages = Array.isArray(content.heroImages) ? content.heroImages : [];
      const updatedImages = [...currentImages, newImageUrl.trim()];
      onInputChange("heroImages", updatedImages);
      setNewImageUrl("");
    }
  };

  const handleRemoveHeroImage = (index: number) => {
    const currentImages = Array.isArray(content.heroImages) ? content.heroImages : [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    onInputChange("heroImages", updatedImages);
  };

  const handleHeroImageSelected = (imageUrl: string) => {
    const currentImages = Array.isArray(content.heroImages) ? content.heroImages : [];
    const updatedImages = [...currentImages, imageUrl];
    onInputChange("heroImages", updatedImages);
  };

  const heroImages = Array.isArray(content.heroImages) ? content.heroImages : [];

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Section Hero - Carrousel d'images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Images du carrousel</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Ajoutez plusieurs images pour créer un carrousel automatique. La première image sera celle affichée par défaut.
                </p>
                
                {/* Upload d'image */}
                <ImageUploader
                  currentImageUrl=""
                  onImageSelected={handleHeroImageSelected}
                  label="Ajouter une nouvelle image"
                />

                {/* Ou URL manuelle */}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ou collez une URL d'image..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddHeroImage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Liste des images actuelles */}
                {heroImages.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Images actuelles ({heroImages.length})</Label>
                    {heroImages.map((image, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <img 
                          src={image} 
                          alt={`Hero ${index + 1}`} 
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMi41IDI3LjVMMjAgMTcuNUwyNyAyN0gxMi41WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                          }}
                        />
                        <span className="flex-1 text-sm text-gray-600 truncate">
                          Image {index + 1}
                          {index === 0 && " (principale)"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveHeroImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="homeHeroTitle">Titre principal</Label>
                <Input
                  id="homeHeroTitle"
                  value={content.heroTitle}
                  onChange={(e) => onInputChange("heroTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="homeHeroSubtitle">Sous-titre</Label>
                <Textarea
                  id="homeHeroSubtitle"
                  value={content.heroSubtitle}
                  onChange={(e) => onInputChange("heroSubtitle", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Section À Propos (Page d'accueil)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUploader
                currentImageUrl={content.aboutImage}
                onImageSelected={(url) => onImageSelected("aboutImage", url)}
                label="Image de la section À propos"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="homeAboutTitle">Titre de la section</Label>
                <Input
                  id="homeAboutTitle"
                  value={content.aboutTitle}
                  onChange={(e) => onInputChange("aboutTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="homeAboutDescription">Description</Label>
                <Textarea
                  id="homeAboutDescription"
                  value={content.aboutDescription}
                  onChange={(e) => onInputChange("aboutDescription", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default HomeSection;
