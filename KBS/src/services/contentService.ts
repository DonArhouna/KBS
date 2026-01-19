import { apiRequest } from '../lib/api';
export interface SiteContent {
  home: {
    heroImages: string[];
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
}
function parseArray(value: string, defaultValue: any[] = []): any[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const data = await apiRequest('/site-content');
    const content = getDefaultContent();
    
    Object.entries(data).forEach(([section, fields]) => {
      if (fields && typeof fields === 'object') {
        let targetSection = section;
        if (section === 'hero') {
          targetSection = 'home';
        }
        
        const typedSection = targetSection as keyof SiteContent;
        
        if (content[typedSection]) {
          Object.entries(fields).forEach(([field, value]) => {
            let targetField = field;
            
            if (section === 'hero') {
              if (field === 'title') targetField = 'heroTitle';
              else if (field === 'subtitle') targetField = 'heroSubtitle';
              else if (field === 'description') targetField = 'aboutDescription';
              else if (field === 'image') targetField = 'aboutImage';
            }
            
            const typedField = targetField as keyof typeof content[typeof typedSection];
            
            if (typedField && value !== null && value !== undefined) {
              if (typedField === 'heroImages') {
                const images = parseArray(String(value), []);
                const processedImages = images.map(img => {
                  if (img && !img.startsWith('http') && !img.startsWith('data:')) {
                    return img.startsWith("/") ? img : `/images${img}`;
                  }
                  return img;
                });
                (content[typedSection] as any)[typedField] = processedImages;
              } else if (typedField === 'features') {
                (content[typedSection] as any)[typedField] = parseArray(String(value), []);
              } else if (targetField.includes('Image') && targetField !== 'features') {
                let imageUrl = String(value);
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                  imageUrl = imageUrl.startsWith("/") ? imageUrl : `/images${imageUrl}`;
                }
                (content[typedSection] as any)[typedField] = imageUrl;
              } else {
                (content[typedSection] as any)[typedField] = String(value);
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
export async function updateSiteContent(content: SiteContent): Promise<boolean> {
  try {
    const updates: Array<{ section: string; field: string; value: string }> = [];
    
    Object.entries(content).forEach(([section, fields]) => {
      Object.entries(fields).forEach(([field, value]) => {
        let processedValue = value;
        
        if (field.includes('Image') && field !== 'features' && typeof value === 'string') {
          if (value.startsWith('/images')) {
            processedValue = value;
          }
        }
        
        if (field === 'heroImages' && Array.isArray(value)) {
          const processedImages = value.map(img => 
            typeof img === 'string' && img.startsWith('/images') ? img : img
          );
          processedValue = processedImages as any;
        }
        
        const stringValue = Array.isArray(processedValue) 
          ? JSON.stringify(processedValue) 
          : String(processedValue);
        
        updates.push({
          section,
          field,
          value: stringValue
        });
      });
    });
    
    await apiRequest('/site-content', {
      method: 'POST',
      body: JSON.stringify(updates)
    });
    
    return true;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return false;
  }
}
export function getDefaultContent(): SiteContent {
  return {
    home: {
      heroImages: [],
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
      bannerImage: ""
    }
  };
}
export const fetchSiteContent = getSiteContent;
export const getSiteContentOptimized = getSiteContent;
