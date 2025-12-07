
import { useState, useEffect } from "react";
import PageBanner from "@/components/PageBanner";
import CallToAction from "@/components/CallToAction";
import { getSiteContentOptimized, SiteContent } from "@/services/contentService";

const AboutPage = () => {
  const [content, setContent] = useState<SiteContent["about"]>({
    bannerImage: "",
    historyImage: "",
    historyTitle: "",
    historyDescription: "",
    historyContent: "",
    missionTitle: "",
    missionDescription: "",
    missionContent: "",
    visionTitle: "",
    visionDescription: "",
    missionVisionImage: "",
    valuesTitle: "",
    valuesDescription: "",
    servicesTitle: "",
    servicesDescription: ""
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const siteContent = await getSiteContentOptimized();
        if (siteContent.about) {
          setContent(siteContent.about);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du contenu:", error);
      }
    };

    loadContent();

    // Écouter les mises à jour de contenu
    const handleContentUpdate = () => {
      loadContent();
    };

    window.addEventListener('contentUpdated', handleContentUpdate);
    
    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate);
    };
  }, []);

  return (
    <div>
      <PageBanner
        title="À Propos de Nous"
        subtitle="Découvrez l'histoire et les valeurs qui guident KB&S KEWE BUSINESS & SERVICES"
        imageSrc={content.bannerImage || "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=1600&auto=format"}
      />

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl overflow-hidden shadow-card">
              <img 
                src={content.historyImage || "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=800&auto=format"} 
                alt="Notre Histoire - KB&S" 
                className="w-full h-auto"
              />
            </div>
            <div>
              <span className="text-kbs-gold font-medium mb-2 block">
                {content.historyTitle || "Notre Histoire"}
              </span>
              <h2 className="text-kbs-brown mb-6">L'histoire derrière KB&S</h2>
              <p className="text-gray-700 mb-6">
                {content.historyDescription || "KB&S KEWE BUSINESS & SERVICES est née de la passion d'une entrepreneure sénégalaise déterminée à valoriser les produits locaux et à promouvoir le savoir-faire traditionnel de son pays. Fondée à Dakar, notre entreprise s'est donnée pour mission de transformer des produits agricoles de qualité en délicieuses spécialités respectant les méthodes artisanales tout en garantissant des standards élevés de qualité."}
              </p>
              <p className="text-gray-700 mb-6">
                {content.historyContent || "Ce qui a commencé comme un petit projet est rapidement devenu une entreprise reconnue pour la qualité et l'authenticité de ses produits. Aujourd'hui, KB&S est fière de contribuer à l'économie locale et de partager les saveurs du Sénégal à travers ses produits 100% naturels."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="py-16 bg-kbs-beige">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <span className="text-kbs-gold font-medium mb-2 block">
                {content.missionTitle || "Notre Mission"}
              </span>
              <h2 className="text-kbs-brown mb-6">
                {content.visionTitle || "Notre Mission et Notre Vision"}
              </h2>
              <p className="text-gray-700 mb-6">
                <strong>Mission :</strong> {content.missionDescription || "Transformer et valoriser les produits agroalimentaires sénégalais de manière responsable et durable, en préservant leur authenticité et leurs qualités nutritionnelles."}
              </p>
              <p className="text-gray-700 mb-6">
                <strong>Vision :</strong> {content.visionDescription || "Devenir un acteur incontournable dans le secteur de la transformation agroalimentaire au Sénégal, reconnu pour la qualité de ses produits et son engagement en faveur du développement durable et de l'économie locale."}
              </p>
              {content.missionContent && (
                <div className="bg-white p-4 rounded-lg border-l-4 border-kbs-gold">
                  <p className="italic text-gray-700">
                    "{content.missionContent}"
                  </p>
                </div>
              )}
            </div>
            <div className="rounded-3xl overflow-hidden shadow-card order-1 md:order-2">
              <img 
                src={content.missionVisionImage || "https://images.unsplash.com/photo-1595351280942-837c0f7c200d?q=80&w=800&auto=format"} 
                alt="Notre Mission - KB&S" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-kbs-gold font-medium mb-2 block">Nos Valeurs</span>
            <h2 className="text-kbs-brown mb-4">
              {content.valuesTitle || "Ce qui guide nos actions"}
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {content.valuesDescription || "Chez KB&S, nous sommes guidés par un ensemble de valeurs fondamentales qui définissent notre approche et notre engagement envers nos clients, nos partenaires et notre communauté."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-kbs-beige p-6 rounded-3xl text-center shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="w-16 h-16 bg-kbs-green/10 flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="text-2xl text-kbs-green">🌟</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-kbs-brown">Qualité</h3>
              <p className="text-gray-700">
                Nous nous engageons à offrir des produits d'excellence qui respectent les plus hauts standards.
              </p>
            </div>
            
            <div className="bg-kbs-beige p-6 rounded-3xl text-center shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="w-16 h-16 bg-kbs-green/10 flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="text-2xl text-kbs-green">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-kbs-brown">Durabilité</h3>
              <p className="text-gray-700">
                Nous veillons à ce que nos pratiques respectent l'environnement et contribuent à un avenir durable.
              </p>
            </div>
            
            <div className="bg-kbs-beige p-6 rounded-3xl text-center shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="w-16 h-16 bg-kbs-green/10 flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="text-2xl text-kbs-green">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-kbs-brown">Intégrité</h3>
              <p className="text-gray-700">
                Nous agissons avec honnêteté et transparence dans toutes nos relations commerciales.
              </p>
            </div>
            
            <div className="bg-kbs-beige p-6 rounded-3xl text-center shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="w-16 h-16 bg-kbs-green/10 flex items-center justify-center rounded-full mx-auto mb-4">
                <span className="text-2xl text-kbs-green">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-kbs-brown">Innovation</h3>
              <p className="text-gray-700">
                Nous recherchons constamment de nouvelles façons d'améliorer nos produits et nos processus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-kbs-beige">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-kbs-gold font-medium mb-2 block">Nos Services</span>
            <h2 className="text-kbs-brown mb-4">
              {content.servicesTitle || "Au-delà des produits"}
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {content.servicesDescription || "En plus de nos produits agroalimentaires, KB&S offre plusieurs services dans le domaine."}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-elegant transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-kbs-green">Gestion de Projet</h3>
              <p className="text-gray-700">
                Nous accompagnons les entrepreneurs et les organisations dans la conception et la mise en œuvre 
                de projets dans le secteur agroalimentaire.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-elegant transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-kbs-green">Suivi & Évaluation</h3>
              <p className="text-gray-700">
                Nous offrons des services de suivi et d'évaluation pour garantir l'efficacité et la durabilité 
                des initiatives agroalimentaires.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-elegant transition-all duration-300">
              <h3 className="text-xl font-semibold mb-3 text-kbs-green">Formation</h3>
              <p className="text-gray-700">
                Nous dispensons des formations sur les meilleures pratiques en matière de transformation 
                agroalimentaire et de gestion d'entreprise dans ce secteur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <CallToAction 
        title="Envie de collaborer avec nous ?"
        description="Que ce soit pour nos produits ou nos services, nous sommes toujours ouverts à de nouvelles opportunités."
        buttonText="Contactez-nous"
        buttonLink="/contact"
      />
    </div>
  );
};

export default AboutPage;
