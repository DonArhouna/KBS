import { apiRequest } from '../lib/api';

// Type pour l'interface utilisateur
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  categoryName?: string;
  stock_quantity?: number;
  image_url?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
  min_stock_level?: number;
  stock_status?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

// Récupérer tous les produits
export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await apiRequest<any[]>('/products');
    return products.map((product: any) => {
      // Construire l'URL complète de l'image
      let imageUrl = product.image_url || '';
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = imageUrl;
      }
      
      return {
        id: String(product.id),
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: imageUrl,
        category: product.category_id || '',
        categoryName: product.category_name || '',
        stock_quantity: product.stock_quantity,
        image_url: imageUrl,
        category_id: product.category_id,
        created_at: product.created_at,
        updated_at: product.updated_at,
        min_stock_level: product.min_stock_level,
        stock_status: product.stock_status,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }
}

// Récupérer les produits par catégorie
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const products = await apiRequest<any[]>('/products');
    return products
      .filter((product: any) => product.category_id === categoryId)
      .map((product: any) => {
        // Construire l'URL complète de l'image
        let imageUrl = product.image_url || '';
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          imageUrl = imageUrl;
        }
        
        return {
          id: String(product.id),
          name: product.name,
          description: product.description || '',
          price: product.price,
          image: imageUrl,
          category: product.category_id || '',
          categoryName: product.category_name || '',
          stock_quantity: product.stock_quantity,
        };
      });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits par catégorie:', error);
    return [];
  }
}

// Ajouter ou mettre à jour un produit
export async function saveProduct(product: Product): Promise<Product | null> {
  try {
    const method = product.id ? 'PUT' : 'POST';

    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image,
      category_id: product.category,
      stock_quantity: product.stock_quantity,
    };

    const savedProduct = await apiRequest(product.id ? `/products/${product.id}` : '/products', {
      method,
      body: JSON.stringify(productData),
    }) as any;
    return {
      id: String(savedProduct.id),
      name: savedProduct.name,
      description: savedProduct.description || '',
      price: savedProduct.price,
      image: savedProduct.image_url || '',
      category: savedProduct.category_id || '',
      stock_quantity: savedProduct.stock_quantity,
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du produit:', error);
    return null;
  }
}

// Supprimer un produit
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    await apiRequest(`/products/${productId}`, {
      method: 'DELETE',
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return false;
  }
}

// Récupérer toutes les catégories
export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = await apiRequest<any[]>('/categories');
    return categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      created_at: category.created_at,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }
}

// Ajouter ou mettre à jour une catégorie
export async function saveCategory(category: { id?: string; name: string; slug: string }): Promise<Category | null> {
  try {
    const method = category.id ? 'PUT' : 'POST';

    const savedCategory = await apiRequest(category.id ? `/categories/${category.id}` : '/categories', {
      method,
      body: JSON.stringify({
        name: category.name,
        slug: category.slug,
      }),
    }) as any;
    return {
      id: savedCategory.id,
      name: savedCategory.name,
      slug: savedCategory.slug,
      created_at: savedCategory.created_at,
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la catégorie:', error);
    return null;
  }
}
