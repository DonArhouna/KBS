
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/admin/ImageUploader";
import { SiteContent } from "@/services/contentService";

interface ContactSectionProps {
  content: SiteContent['contact'];
  onImageSelected: (field: string, imageUrl: string) => void;
}

const ContactSection = ({ content, onImageSelected }: ContactSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image de la page Contact</CardTitle>
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
  );
};

export default ContactSection;
