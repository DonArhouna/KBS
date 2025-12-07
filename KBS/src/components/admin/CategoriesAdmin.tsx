
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Save, Loader2, Plus, Trash2 } from "lucide-react";

import { getAllCategories, saveCategory } from "@/services/productService";
import ActionButton from "./ActionButton";
import AdminCard from "./AdminCard";

type Category = {
  id: string;
  name: string;
  slug: string;
};

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    id: "",
    name: "",
    slug: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Charger les catégories depuis Supabase
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setIsEditing(false);
    setFormData({
      id: "",
      name: "",
      slug: ""
    });
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setIsEditing(true);
    setFormData({
      id: category.id,
      name: category.name,
      slug: category.slug
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ? Cela pourrait affecter les produits associés.")) {
      setIsLoading(true);
      try {
        // Supprimer via l'API backend
        const response = await fetch(`http://localhost:3001/api/categories/${categoryId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          toast.error("Erreur lors de la suppression");
          return;
        }

        await loadCategories(); // Recharger la liste
        toast.success("Catégorie supprimée avec succès");
      } catch (error) {
        toast.error("Une erreur est survenue");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Si le nom de la catégorie change et que le slug n'a pas été modifié manuellement
    // ou s'il s'agit d'une nouvelle catégorie, mettre à jour le slug automatiquement
    if (name === "name" && (!isEditing || formData.slug === "")) {
      const autoSlug = value.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
        
      setFormData({
        ...formData,
        name: value,
        slug: autoSlug
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Le nom et le slug sont requis");
      return;
    }

    setIsLoading(true);
    try {
      // Vérification basique côté client
      // La vérification du slug unique sera gérée par le backend

      // Préparer les données pour l'insertion/mise à jour
      // S'assurer que name et slug sont définis et non optionnels
      const categoryData = {
        name: formData.name || '',  // Conversion explicite pour garantir une valeur non-nulle
        slug: formData.slug || '',  // Conversion explicite pour garantir une valeur non-nulle
        id: formData.id || undefined // Permettre à Supabase de générer un ID si nouveau
      };

      // Insérer ou mettre à jour la catégorie en utilisant la méthode saveCategory du service
      const savedCategory = await saveCategory(categoryData);
      
      if (savedCategory) {
        await loadCategories(); // Recharger la liste
        setIsDialogOpen(false);
        toast.success(`Catégorie ${isEditing ? 'mise à jour' : 'ajoutée'} avec succès`);
      } else {
        toast.error("Erreur lors de l'enregistrement de la catégorie");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AdminCard title="Gestion des Catégories">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''} au total
          </p>
          <Button 
            className="bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" 
            onClick={handleAddCategory}
            disabled={isLoading}
          >
            <Plus size={16} className="mr-1" /> Ajouter une catégorie
          </Button>
        </div>

        <div className="admin-table">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-kbs-green" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-kbs-green to-kbs-light text-white">
                  <tr>
                    <th className="text-left p-4 font-semibold">Nom</th>
                    <th className="text-left p-4 font-semibold">Slug</th>
                    <th className="text-center p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">
                        Aucune catégorie disponible
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="p-4 font-medium text-gray-700">{category.name}</td>
                        <td className="p-4 text-gray-600">{category.slug}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <ActionButton 
                              onClick={() => handleEditCategory(category)} 
                              variant="edit"
                            >
                              <Pencil size={16} />
                            </ActionButton>
                            <ActionButton 
                              onClick={() => handleDeleteCategory(category.id)}
                              variant="delete"
                            >
                              <Trash2 size={16} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dialog-content bg-white">
          <DialogHeader>
            <DialogTitle className="text-kbs-brown">
              {isEditing ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </DialogTitle>
          </DialogHeader>

          <div className="admin-form bg-white">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right font-medium text-gray-700" htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="col-span-3 admin-input"
                  placeholder="Nom de la catégorie"
                />
              </div>

              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right font-medium text-gray-700" htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug || ""}
                  onChange={handleInputChange}
                  className="col-span-3 admin-input"
                  placeholder="slug-de-la-categorie"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="mt-2 sm:mt-0 rounded-2xl border-gray-300">
              Annuler
            </Button>
            <Button 
              onClick={handleSaveCategory} 
              className="bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  En cours...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" /> Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesAdmin;
