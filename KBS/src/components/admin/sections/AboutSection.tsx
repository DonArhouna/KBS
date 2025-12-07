
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/admin/ImageUploader";
import { SiteContent } from "@/services/contentService";

interface AboutSectionProps {
  content: SiteContent['about'];
  onInputChange: (field: string, value: string) => void;
  onImageSelected: (field: string, imageUrl: string) => void;
}

const AboutSection = ({ content, onInputChange, onImageSelected }: AboutSectionProps) => {
  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Bannière de la page À propos</CardTitle>
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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Notre Histoire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUploader
                currentImageUrl={content.historyImage}
                onImageSelected={(url) => onImageSelected("historyImage", url)}
                label="Image de l'historique"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="historyTitle">Titre de la section</Label>
                <Input
                  id="historyTitle"
                  value={content.historyTitle}
                  onChange={(e) => onInputChange("historyTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="historyDescription">Description courte</Label>
                <Textarea
                  id="historyDescription"
                  value={content.historyDescription}
                  onChange={(e) => onInputChange("historyDescription", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="historyContent">Contenu détaillé</Label>
            <Textarea
              id="historyContent"
              value={content.historyContent}
              onChange={(e) => onInputChange("historyContent", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Mission et Vision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ImageUploader
                currentImageUrl={content.missionVisionImage}
                onImageSelected={(url) => onImageSelected("missionVisionImage", url)}
                label="Image Mission/Vision"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="missionTitle">Titre de la mission</Label>
                <Input
                  id="missionTitle"
                  value={content.missionTitle}
                  onChange={(e) => onInputChange("missionTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="visionTitle">Titre de la vision</Label>
                <Input
                  id="visionTitle"
                  value={content.visionTitle}
                  onChange={(e) => onInputChange("visionTitle", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="missionDescription">Description de la mission</Label>
            <Textarea
              id="missionDescription"
              value={content.missionDescription}
              onChange={(e) => onInputChange("missionDescription", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="visionDescription">Description de la vision</Label>
            <Textarea
              id="visionDescription"
              value={content.visionDescription}
              onChange={(e) => onInputChange("visionDescription", e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="missionContent">Citation ou contenu inspirant</Label>
            <Textarea
              id="missionContent"
              value={content.missionContent}
              onChange={(e) => onInputChange("missionContent", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Nos Valeurs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="valuesTitle">Titre de la section</Label>
            <Input
              id="valuesTitle"
              value={content.valuesTitle}
              onChange={(e) => onInputChange("valuesTitle", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="valuesDescription">Description</Label>
            <Textarea
              id="valuesDescription"
              value={content.valuesDescription}
              onChange={(e) => onInputChange("valuesDescription", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nos Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="servicesTitle">Titre de la section</Label>
            <Input
              id="servicesTitle"
              value={content.servicesTitle}
              onChange={(e) => onInputChange("servicesTitle", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="servicesDescription">Description</Label>
            <Textarea
              id="servicesDescription"
              value={content.servicesDescription}
              onChange={(e) => onInputChange("servicesDescription", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AboutSection;
