const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'KBService',
  user: 'postgres',
  password: 'Passer123'
});

// Ajouter des données de test
async function addTestData() {
  try {
    // Ajouter une catégorie de test
    await pool.query(`
      INSERT INTO categories (name, slug, created_at)
      VALUES ('Test Category', 'test-category', NOW())
      ON CONFLICT (slug) DO NOTHING
    `);

    // Ajouter un produit de test
    await pool.query(`
      INSERT INTO products (name, description, price, created_at, updated_at)
      VALUES ('Test Product', 'Produit de test pour vérifier la persistance', 99.99, NOW(), NOW())
    `);

    console.log('Données de test ajoutées avec succès');
  } catch (error) {
    console.log('Erreur lors de l\'ajout des données de test:', error.message);
  } finally {
    pool.end();
  }
}

addTestData();
