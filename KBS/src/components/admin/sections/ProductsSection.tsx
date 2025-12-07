
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/admin/ImageUploader";
import { SiteContent } from "@/services/contentService";

interface ProductsSectionProps {
  content: SiteContent['products'];
  onInputChange: (field: string, value: string) => void;
  onImageSelected: (field: string, imageUrl: string) => void;
}

const ProductsSection = ({ content, onInputChange, onImageSelected }: ProductsSectionProps) => {
  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Bannière de la page Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUploader
                currentImageUrl={content.bannerImage}
                onImageSelected={(url) => onImageSelected("bannerImage", url)}
                label="Image de bannière"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Section Qualité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUploader
                currentImageUrl={content.qualityImage}
                onImageSelected={(url) => onImageSelected("qualityImage", url)}
                label="Image section qualité"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="qualityTitle">Titre de la section</Label>
                <Input
                  id="qualityTitle"
                  value={content.qualityTitle}
                  onChange={(e) => onInputChange("qualityTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="qualityDescription">Description</Label>
                <Textarea
                  id="qualityDescription"
                  value={content.qualityDescription}
                  onChange={(e) => onInputChange("qualityDescription", e.target.value)}
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

export default ProductsSection;
