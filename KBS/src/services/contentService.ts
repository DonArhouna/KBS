import { apiRequest, API_CONFIG } from '../lib/api';

// Type pour le contenu du site sur l'interface utilisateur
export type SiteContent = {
  home: {
    heroImages: string[]; // Changé pour supporter plusieurs images
    heroTitle: string;
    heroSubtitle: string;
    aboutImage: string;
    aboutTitle: string;
    aboutDescription: string;
    featuresTitle: string;
    featuresDescription: string;
    features: Array<{
      title: string;
      description: string;
    }>;
  };
  about: {
    bannerImage: string;
    historyImage: string;
    historyTitle: string;
    historyDescription: string;
    historyContent: string;
    missionTitle: string;
    missionDescription: string;
    missionContent: string;
    visionTitle: string;
    visionDescription: string;
    missionVisionImage: string;
    valuesTitle: string;
    valuesDescription: string;
    servicesTitle: string;
    servicesDescription: string;
  };
  products: {
    bannerImage: string;
    qualityImage: string;
    qualityTitle: string;
    qualityDescription: string;
  };
  contact: {
    bannerImage: string;
  };
};

// Fonction helper pour parser en toute sécurité les valeurs JSON
function safeJsonParse(value: string, fallback: unknown[] = []) {
  try {
    const parsed = JSON.parse(value);
    // S'assurer que pour heroImages, on retourne toujours un tableau
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

// Récupérer tout le contenu du site
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const data = await apiRequest('/site-content');

    // Transformation des données de la BD en structure pour l'interface
    const content = getDefaultContent();

    Object.entries(data).forEach(([section, sectionData]: [string, Record<string, unknown>]) => {
      if (sectionData && typeof sectionData === 'object') {
        // Mapper les sections backend vers les sections frontend
        let mappedSection = section;
        if (section === 'hero') {
          mappedSection = 'home';
        }

        const typedSection = mappedSection as keyof SiteContent;

        if (content[typedSection]) {
          Object.entries(sectionData).forEach(([field, value]: [string, unknown]) => {
            // Mapper les champs si nécessaire
            let mappedField = field;
            if (section === 'hero') {
              if (field === 'title') mappedField = 'heroTitle';
              else if (field === 'subtitle') mappedField = 'heroSubtitle';
              else if (field === 'description') mappedField = 'aboutDescription';
              else if (field === 'image') mappedField = 'aboutImage';
            }

            const typedField = mappedField as keyof SiteContent[typeof typedSection];

            if (typedField && value !== null && value !== undefined) {
              // Gestion spéciale pour les champs qui doivent être des tableaux
              if (typedField === 'heroImages') {
                const imagesArray = safeJsonParse(String(value), []);
                // Ajouter l'URL de base à chaque image du tableau
                const processedImages = imagesArray.map((imageUrl: string) => {
                  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                    return `http://localhost:3001${imageUrl}`;
                  }
                  return imageUrl;
                });
                (content[typedSection] as Record<string, unknown>)[typedField] = processedImages;
              } else if (typedField === 'features') {
                (content[typedSection] as Record<string, unknown>)[typedField] = safeJsonParse(String(value), []);
              } else if (mappedField.includes('Image') && mappedField !== 'features') {
                // Construction de l'URL complète pour les images
                let imageUrl = String(value);
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                  imageUrl = `http://localhost:3001${imageUrl}`;
                }
                (content[typedSection] as Record<string, unknown>)[typedField] = imageUrl;
              } else {
                (content[typedSection] as Record<string, unknown>)[typedField] = String(value);
              }
            }
          });
        }
      }
    });

    return content;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return getDefaultContent();
  }
}

// Mettre à jour le contenu du site
export async function updateSiteContent(content: SiteContent): Promise<boolean> {
  try {
    // Préparation des données pour le format de la base de données
    const contentItems: Array<{
      section: string;
      field: string;
      value: string;
    }> = [];

    Object.entries(content).forEach(([section, sectionData]: [string, Record<string, unknown>]) => {
      Object.entries(sectionData).forEach(([field, value]: [string, unknown]) => {
        let processedValue = value;

        // Pour les champs d'images, retirer l'URL de base avant la sauvegarde
        if (field.includes('Image') && field !== 'features' && typeof value === 'string') {
          const baseUrl = 'http://localhost:3001';
          if (value.startsWith(baseUrl)) {
            processedValue = value.substring(baseUrl.length);
          }
        }

        // Pour les tableaux d'images (comme heroImages), traiter chaque URL
        if (field === 'heroImages' && Array.isArray(value)) {
          const baseUrl = 'http://localhost:3001';
          processedValue = value.map((imageUrl: string) => {
            if (typeof imageUrl === 'string' && imageUrl.startsWith(baseUrl)) {
              return imageUrl.substring(baseUrl.length);
            }
            return imageUrl;
          });
        }

        // Gérer les tableaux en les sérialisant
        const serializedValue = Array.isArray(processedValue) ? JSON.stringify(processedValue) : String(processedValue);

        contentItems.push({
          section,
          field,
          value: serializedValue,
        });
      });
    });

    // Envoi des données au backend
    await apiRequest('/site-content', {
      method: 'POST',
      body: JSON.stringify(contentItems),
    });

    return true;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return false;
  }
}

// Valeurs par défaut pour le contenu du site
export function getDefaultContent(): SiteContent {
  return {
    home: {
      heroImages: [], // Maintenant un tableau
      heroTitle: "Bienvenue chez KB&S",
      heroSubtitle: "Découvrez nos produits authentiques du Sénégal",
      aboutImage: "",
      aboutTitle: "À propos de nous",
      aboutDescription: "KB&S est spécialisé dans la transformation de produits agroalimentaires 100% naturels au Sénégal.",
      featuresTitle: "Nos Avantages",
      featuresDescription: "Découvrez ce qui nous distingue",
      features: [
        {
          title: "Qualité Premium",
          description: "Des produits sélectionnés avec soin pour leur qualité exceptionnelle"
        },
        {
          title: "100% Naturel",
          description: "Tous nos produits sont naturels et sans additifs artificiels"
        },
        {
          title: "Livraison Rapide",
          description: "Livraison express dans toute la région de Dakar"
        },
        {
          title: "Service Client",
          description: "Une équipe dédiée pour vous accompagner dans vos achats"
        }
      ]
    },
    about: {
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
    },
    products: {
      bannerImage: "",
      qualityImage: "",
      qualityTitle: "",
      qualityDescription: ""
    },
    contact: {
      bannerImage: "",
    }
  };
}

// Alias pour la compatibilité
export const getSiteContentOptimized = getSiteContent;
