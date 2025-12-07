// Utilitaire pour initialiser la base de données
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3001/api/init-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Database initialized:', result);
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};