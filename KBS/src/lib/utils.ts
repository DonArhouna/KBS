import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour formater les prix
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0';
  
  // Arrondir à l'entier le plus proche et formater avec des espaces comme séparateurs de milliers
  return Math.round(numPrice).toLocaleString('fr-FR');
}