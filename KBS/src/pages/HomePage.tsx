import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getSiteContent, SiteContent } from "@/services/contentService";
import { getAllProducts } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import CallToAction from "@/components/CallToAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/productService";
import { ShoppingCart, Star, Award, Shield, Clock, Sparkles, Leaf, Truck, Users } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [content, setContent] = useState<SiteContent["home"]>({
    heroTitle: "Bienvenue chez KB&S",
    heroSubtitle: "Découvrez nos produits authentiques du Sénégal",
    heroImages: [],
    aboutTitle: "À propos de nous",
    aboutDescription: "KB&S est spécialisé dans la transformation de produits agroalimentaires 100% naturels au Sénégal.",
    aboutImage: "",
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
  });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks d'animation - utilisés uniquement pour les animations, pas pour l'affichage
  const aboutSection = useIntersectionObserver({ threshold: 0.3 });
  const featuresSection = useIntersectionObserver({ threshold: 0.2 });
  const productsSection = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    const loadContent = async () => {
      try {
        setError(null);
        setLoading(true);
        console.log("Chargement du contenu de la page d'accueil...");
        
        const [siteContent, products] = await Promise.all([
          getSiteContent().catch(() => ({
            home: {
              heroTitle: "Bienvenue chez KB&S",
              heroSubtitle: "Découvrez nos produits authentiques du Sénégal",
              heroImages: [],
              aboutTitle: "À propos de nous",
              aboutDescription: "KB&S est spécialisé dans la transformation de produits agroalimentaires 100% naturels au Sénégal.",
              aboutImage: "",
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
            }
          })),
          getAllProducts().catch(() => [])
        ]);
        
        console.log("Contenu chargé:", siteContent);
        console.log("Produits chargés:", products);
        
        // S'assurer que toutes les propriétés existent
        const homeContent = {
          heroTitle: siteContent.home?.heroTitle || "Bienvenue chez KB&S",
          heroSubtitle: siteContent.home?.heroSubtitle || "Découvrez nos produits authentiques du Sénégal",
          heroImages: Array.isArray(siteContent.home?.heroImages) ? siteContent.home.heroImages : [
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop"
          ],
          aboutTitle: siteContent.home?.aboutTitle || "À propos de nous",
          aboutDescription: siteContent.home?.aboutDescription || "KB&S est spécialisé dans la transformation de produits agroalimentaires 100% naturels au Sénégal.",
          aboutImage: siteContent.home?.aboutImage || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop",
          featuresTitle: siteContent.home?.featuresTitle || "Nos Avantages",
          featuresDescription: siteContent.home?.featuresDescription || "Découvrez ce qui nous distingue",
          features: Array.isArray(siteContent.home?.features) ? siteContent.home.features : [
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
        };
        
        setContent(homeContent);
        setFeaturedProducts(products.slice(0, 6));
        console.log("État mis à jour avec succès");
      } catch (error) {
        console.error("Erreur lors du chargement du contenu:", error);
        setError("Erreur lors du chargement du contenu");
        toast.error("Erreur lors du chargement du contenu");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} ajouté au panier !`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kbs-beige via-white to-kbs-beige/50">
        <div className="text-center animate-fadeInUp bg-white p-12 rounded-3xl shadow-hero border border-kbs-green/10">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-kbs-green/20 border-t-kbs-green rounded-full animate-spin mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-kbs-green animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-kbs-brown mb-3">Chargement en cours...</h2>
          <p className="text-gray-600">Préparation de votre expérience KB&S</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kbs-beige via-white to-kbs-beige/50">
        <div className="text-center bg-white p-12 rounded-3xl shadow-hero border border-red-100 max-w-md mx-4 animate-fadeInUp">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Oups ! Une erreur s'est produite</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Actualiser la page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kbs-beige via-white to-kbs-beige/30">
      {/* Hero Section - Carrousel */}
      <section className="relative overflow-hidden">
        <div className="animate-fadeInUp">
          <HeroCarousel
            images={content.heroImages}
          >
            <div className="flex flex-col sm:flex-row gap-4 mt-36">
              <Button
                onClick={() => navigate("/products")}
                size="lg"
                className="rounded-2xl bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white px-10 py-4 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Découvrir nos produits
              </Button>
              <Button
                onClick={() => navigate("/about")}
                variant="outline"
                size="lg"
                className="rounded-2xl bg-white/95 hover:bg-white border-2 border-white text-kbs-brown hover:text-kbs-brown px-10 py-4 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 font-semibold backdrop-blur-sm"
              >
                En savoir plus
              </Button>
            </div>
          </HeroCarousel>
        </div>
      </section>

      {/* Section À Propos */}
      <section className="py-20 bg-white relative overflow-hidden" ref={aboutSection.elementRef}>
        <div className="absolute inset-0 bg-gradient-to-r from-kbs-green/3 to-kbs-light/3"></div>
        <div className="container-custom relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center animate-fadeInUp">
            <div className={`${
              aboutSection.isIntersecting 
                ? 'animate-fadeInLeft animate-delay-200' 
                : 'animate-fadeInLeft'
            }`}>
              <Badge className="bg-gradient-to-r from-kbs-green/10 to-kbs-light/10 text-kbs-green border-kbs-green/20 mb-6 px-6 py-3 rounded-2xl font-semibold">
                <Leaf className="mr-2 h-4 w-4" />
                À propos de nous
              </Badge>
              <h2 className="text-4xl font-bold text-kbs-brown mb-6 leading-tight">
                {content.aboutTitle}
              </h2>
              <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
                {content.aboutDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate("/about")}
                  className="rounded-2xl bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Notre histoire
                </Button>
                <Button 
                  onClick={() => navigate("/contact")}
                  variant="outline"
                  className="rounded-2xl border-2 border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white px-8 py-4 shadow-lg transition-all duration-300 hover:shadow-xl font-semibold"
                >
                  Nous contacter
                </Button>
              </div>
            </div>
            
            <div className={`${
              aboutSection.isIntersecting 
                ? 'animate-fadeInRight animate-delay-400' 
                : 'animate-fadeInRight'
            }`}>
              {content.aboutImage ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-kbs-green to-kbs-light rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <img
                    src={content.aboutImage}
                    alt="À propos de KB&S"
                    className="relative rounded-3xl shadow-hero w-full h-auto transition-all duration-500 hover:shadow-3xl transform hover:scale-105"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-kbs-green to-kbs-light rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <ShoppingCart className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Image à venir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section Caractéristiques */}
      <section className="py-20 bg-gradient-to-br from-kbs-beige/30 via-white to-kbs-beige/10 relative" ref={featuresSection.elementRef}>
        <div className="absolute inset-0 bg-gradient-to-br from-kbs-green/3 to-kbs-light/5 opacity-50"></div>
        <div className="container-custom relative">
          <div className={`text-center mb-16 animate-fadeInUp ${
            featuresSection.isIntersecting ? 'animate-delay-0' : ''
          }`}>
            <Badge className="bg-gradient-to-r from-kbs-green/10 to-kbs-light/10 text-kbs-green border-kbs-green/20 mb-6 px-6 py-3 rounded-2xl font-semibold">
              <Award className="mr-2 h-4 w-4" />
              Nos avantages
            </Badge>
            <h2 className="text-4xl font-bold text-kbs-brown mb-6 leading-tight">
              {content.featuresTitle}
            </h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
              {content.featuresDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.map((feature, index) => {
              const icons = [Star, Award, Shield, Clock];
              const gradients = [
                'from-amber-400 to-orange-500',
                'from-purple-400 to-pink-500', 
                'from-blue-400 to-cyan-500',
                'from-green-400 to-teal-500'
              ];
              const IconComponent = icons[index] || Star;
              const gradient = gradients[index] || gradients[0];
              
              return (
                <Card 
                  key={index} 
                  className={`bg-white rounded-3xl shadow-xl border border-gray-100 text-center p-8 group hover:shadow-2xl hover:scale-105 transition-all duration-500 animate-fadeInUp ${
                    featuresSection.isIntersecting 
                      ? `animate-delay-${(index + 1) * 200}` 
                      : ''
                  }`}
                >
                  <CardContent className="p-0">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-3xl mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-kbs-brown mb-4 group-hover:text-kbs-green transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Produits Populaires */}
      <section className="py-20 bg-white relative overflow-hidden" ref={productsSection.elementRef}>
        <div className="absolute inset-0 bg-gradient-to-r from-kbs-light/3 to-kbs-green/3"></div>
        <div className="container-custom relative">
          <div className={`text-center mb-12 animate-fadeInUp ${
            productsSection.isIntersecting ? 'animate-delay-0' : ''
          }`}>
            <Badge className="bg-gradient-to-r from-kbs-green/10 to-kbs-light/10 text-kbs-green border-kbs-green/20 mb-6 px-6 py-3 rounded-2xl font-semibold">
              <Sparkles className="mr-2 h-4 w-4" />
              Produits populaires
            </Badge>
            <h2 className="text-4xl font-bold text-kbs-brown mb-6 leading-tight">
              Des produits d'exception
            </h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
              Découvrez une sélection de nos meilleurs produits naturels et biologiques
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className={`animate-fadeInUp ${
                    productsSection.isIntersecting 
                      ? `animate-delay-${(index % 3 + 1) * 200}` 
                      : ''
                  }`}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    image={product.image}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-kbs-green to-kbs-light rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-kbs-brown mb-4">Bientôt disponible</h3>
              <p className="text-gray-600 font-light">Nos produits arriveront très prochainement</p>
            </div>
          )}

          <div className={`text-center mt-12 animate-fadeInUp ${
            productsSection.isIntersecting ? 'animate-delay-800' : ''
          }`}>
            <Button 
              onClick={() => navigate("/products")}
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white px-12 py-5 shadow-3xl hover:shadow-hero transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Truck className="mr-3 h-6 w-6" />
              Voir nos produits
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="animate-fadeInUp">
        <CallToAction 
          title="Commandez maintenant"
          description="Découvrez nos produits authentiques du Sénégal et passez votre commande dès aujourd'hui"
          buttonText="Voir nos produits"
          buttonLink="/products"
        />
      </div>
    </div>
  );
};

export default HomePage;
