// Configuration de l'API backend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 secondes
};

// Helper pour les requêtes API
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && (errorData.error || errorData.message)) {
          errorMessage = errorData.error || errorData.message;
        }
      } catch (e) {
        // Corps non JSON, on garde le message par défaut
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API request failed for ${endpoint}:`, error.message);
      throw error;
    }
    throw new Error('Une erreur inattendue est survenue');
  }
}

// Helper pour les uploads de fichiers
export async function uploadFile(file: File): Promise<{ imagePath: string; filename: string }> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_CONFIG.BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json();
}