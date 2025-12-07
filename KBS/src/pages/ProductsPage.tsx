
import { useState, useEffect } from "react";
import PageBanner from "@/components/PageBanner";
import ProductCard from "@/components/ProductCard";
import CallToAction from "@/components/CallToAction";
import { getAllProducts, getProductsByCategory } from "@/services/productService";
import { getAllCategories } from "@/services/productService";
import { getSiteContent } from "@/services/contentService";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type pour les produits et catégories
import { Product } from "@/services/productService";
type Category = { id: string; name: string; };

const ProductsPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentImages, setContentImages] = useState({
    bannerImage: "https://images.unsplash.com/photo-1626201850129-a96cf24c4cd7?q=80&w=1600&auto=format",
    qualityImage: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=800&auto=format",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 rows of 3 products each

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Charger les produits et catégories depuis Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charger les catégories
        const categoriesData = await getAllCategories();
        const formattedCategories = [
          { id: "all", name: "Tous les produits" },
          ...categoriesData.map(cat => ({ id: cat.id, name: cat.name }))
        ];
        setCategories(formattedCategories);
        
        // Charger les produits
        const productsData = await getAllProducts();
        setProducts(productsData);
        
        // Charger les images personnalisées
        const content = await getSiteContent();
        setContentImages({
          bannerImage: content.products.bannerImage || contentImages.bannerImage,
          qualityImage: content.products.qualityImage || contentImages.qualityImage,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filtrer les produits lorsque la catégorie change
  useEffect(() => {
    const filterProducts = async () => {
      setIsLoading(true);
      setCurrentPage(1); // Reset to first page when category changes
      try {
        if (activeCategory === "all") {
          const allProducts = await getAllProducts();
          setProducts(allProducts);
        } else {
          const filteredProducts = await getProductsByCategory(activeCategory);
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Erreur lors du filtrage des produits:", error);
      } finally {
        setIsLoading(false);
      }
    };

    filterProducts();
  }, [activeCategory]);

  return (
    <div>
      <PageBanner
        title="Nos Produits"
        subtitle="Découvrez notre gamme de produits 100% naturels et authentiques"
        imageSrc={contentImages.bannerImage}
      />

      {/* Product Filters */}
      <section className="bg-white py-8 border-b">
        <div className="container-custom">
          <div className="flex overflow-x-auto pb-2 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 whitespace-nowrap rounded-full transition-colors ${
                  activeCategory === category.id
                    ? "bg-kbs-green text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-kbs-beige">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-kbs-green" />
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {currentProducts.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-full border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`rounded-full min-w-[40px] ${
                            currentPage === page
                              ? "bg-kbs-green text-white hover:bg-kbs-green/90"
                              : "border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-full border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-700">Aucun produit trouvé dans cette catégorie.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Product Quality Section */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-kbs-gold font-medium mb-2 block">Qualité Garantie</span>
              <h2 className="text-kbs-brown mb-4">Des produits d'exception</h2>
              <p className="text-gray-700 mb-4">
                Chez KB&S, nous accordons une importance primordiale à la qualité de nos produits. 
                Chaque article que nous proposons est soigneusement sélectionné et transformé selon 
                des méthodes qui préservent les nutriments et les saveurs naturelles.
              </p>
              <p className="text-gray-700 mb-4">
                Nous travaillons directement avec des producteurs locaux de confiance qui partagent 
                nos valeurs d'authenticité et de durabilité. Cela nous permet de vous garantir des 
                produits frais, sains et riches en saveurs.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-kbs-green/10 flex items-center justify-center rounded-full">
                    <span className="text-kbs-green text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">100% naturel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-kbs-green/10 flex items-center justify-center rounded-full">
                    <span className="text-kbs-green text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Sans conservateurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-kbs-green/10 flex items-center justify-center rounded-full">
                    <span className="text-kbs-green text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Méthodes traditionnelles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-kbs-green/10 flex items-center justify-center rounded-full">
                    <span className="text-kbs-green text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Producteurs locaux</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-card">
              <img 
                src={contentImages.qualityImage}
                alt="Contrôle qualité des produits" 
                className="w-full h-80 object-cover hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <CallToAction 
        title="Prêt à savourer nos produits ?"
        description="Commandez dès maintenant et faites-vous livrer à domicile ou passez récupérer vos produits à notre dépôt aux Maristes."
        buttonText="Commander maintenant"
        buttonLink="/order"
        bgColor="bg-gradient-to-r from-kbs-green/90 to-kbs-light/90"
      />
    </div>
  );
};

export default ProductsPage;
