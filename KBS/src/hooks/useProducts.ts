
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  getAllProducts, 
  saveProduct, 
  deleteProduct, 
  getAllCategories,
  type Product
} from "@/services/productService";
import { uploadImage, base64ToFile } from "@/services/storageService";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData.map(cat => ({ id: cat.id, name: cat.name })));
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      console.error(error);
    }
  };

  const handleSaveProduct = async (formData: Product, selectedProduct: Product | null) => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast.error("Veuillez remplir tous les champs requis");
      return false;
    }

    setIsLoading(true);
    try {
      let imageUrl = formData.image;

      // Si l'image est en base64, on doit l'uploader d'abord
      if (formData.image.startsWith('data:image')) {
        const file = await base64ToFile(formData.image, `product-${Date.now()}.jpg`);
        if (file) {
          const uploadedUrl = await uploadImage(file, 'images', 'products');
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          } else {
            // Upload échoué : on bloque pour éviter de stocker la base64 en DB
            toast.error("Erreur lors de l'upload de l'image. Vérifiez votre connexion et réessayez.");
            return false;
          }
        } else {
          toast.error("Erreur lors du traitement de l'image.");
          return false;
        }
      }

      const savedProduct = await saveProduct({
        ...formData,
        image: imageUrl
      });

      if (savedProduct) {
        await loadProducts();
        toast.success(`Le produit ${formData.name} a été ${selectedProduct ? 'mis à jour' : 'ajouté'}`);
        return true;
      } else {
        toast.error("Erreur lors de l'enregistrement du produit");
        return false;
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setIsLoading(true);
      try {
        const success = await deleteProduct(productId);
        if (success) {
          await loadProducts();
          toast.success("Le produit a été supprimé");
        } else {
          toast.error("Erreur lors de la suppression du produit");
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    products,
    categories,
    isLoading,
    handleSaveProduct,
    handleDeleteProduct,
    loadProducts
  };
};
