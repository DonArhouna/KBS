
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteContent } from "@/services/contentService";
import HomeSection from "./sections/HomeSection";
import AboutSection from "./sections/AboutSection";
import ProductsSection from "./sections/ProductsSection";
import ContactSection from "./sections/ContactSection";

interface ContentAccordionProps {
  content: SiteContent;
  onInputChange: (section: keyof SiteContent, field: string, value: string | string[]) => void;
  onImageSelected: (section: keyof SiteContent, field: string, imageUrl: string) => void;
}

const ContentAccordion = ({ content, onInputChange, onImageSelected }: ContentAccordionProps) => {
  const [activeAccordion, setActiveAccordion] = useState<string>("home");

  return (
    <Accordion
      type="single"
      value={activeAccordion}
      onValueChange={setActiveAccordion}
      className="mb-6"
    >
      <AccordionItem value="home">
        <AccordionTrigger className="text-lg font-medium">Page d'Accueil</AccordionTrigger>
        <AccordionContent>
          <HomeSection 
            content={content.home} 
            onInputChange={(field, value) => onInputChange("home", field, value)} 
            onImageSelected={(field, url) => onImageSelected("home", field, url)}
          />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="about">
        <AccordionTrigger className="text-lg font-medium">Page À Propos</AccordionTrigger>
        <AccordionContent>
          <AboutSection 
            content={content.about} 
            onInputChange={(field, value) => onInputChange("about", field, value)}
            onImageSelected={(field, url) => onImageSelected("about", field, url)} 
          />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="products">
        <AccordionTrigger className="text-lg font-medium">Page Produits</AccordionTrigger>
        <AccordionContent>
          <ProductsSection 
            content={content.products} 
            onInputChange={(field, value) => onInputChange("products", field, value)}
            onImageSelected={(field, url) => onImageSelected("products", field, url)} 
          />
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="contact">
        <AccordionTrigger className="text-lg font-medium">Page Contact</AccordionTrigger>
        <AccordionContent>
          <ContactSection 
            content={content.contact} 
            onImageSelected={(field, url) => onImageSelected("contact", field, url)} 
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ContentAccordion;
