import { uploadFile } from '../lib/api';

// Fonction pour convertir base64 en File
export const base64ToFile = async (base64String: string, filename: string): Promise<File | null> => {
  try {
    const response = await fetch(base64String);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Erreur lors de la conversion base64 vers File:', error);
    return null;
  }
};

// Fonction pour télécharger une image
export const uploadImage = async (
  file: File,
  bucket?: string,
  folder?: string
): Promise<string | null> => {
  try {
    console.log('Upload d\'image via le backend Express');
    
    const result = await uploadFile(file);
    return result.imagePath;
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    return null;
  }
};

// Fonction pour supprimer une image
export const deleteImage = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    // Pour l'instant, on simule la suppression
    // Dans une implémentation complète, on ajouterait une route DELETE au backend
    console.log('Suppression d\'image simulée:', path);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return false;
  }
};