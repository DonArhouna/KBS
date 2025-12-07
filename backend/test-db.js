const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Passer123'
});

async function testConnection() {
  try {
    console.log('Test de connexion à PostgreSQL...');

    // Vérifier la connexion
    const client = await pool.connect();
    console.log('✅ Connexion réussie à PostgreSQL');

    // Vérifier si la base KBService existe
    const result = await client.query("SELECT datname FROM pg_database WHERE datname = 'KBService'");
    if (result.rows.length === 0) {
      console.log('Base de données KBService n\'existe pas. Création en cours...');
      await client.query('CREATE DATABASE "KBService"');
      console.log('✅ Base de données KBService créée avec succès!');
    } else {
      console.log('✅ Base de données KBService existe déjà.');
    }

    // Tester la connexion à KBService
    const kbsPool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'KBService',
      user: 'postgres',
      password: 'Passer123'
    });

    const kbsClient = await kbsPool.connect();
    console.log('✅ Connexion à la base KBService réussie');

    // Vérifier les tables
    const tablesResult = await kbsClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️ Aucune table trouvée. Les tables seront créées au démarrage du serveur.');
    } else {
      console.log('✅ Tables existantes:', tablesResult.rows.map(r => r.table_name).join(', '));
    }

    kbsClient.release();
    kbsPool.end();
    client.release();
    pool.end();

    console.log('\n🎉 Configuration de la base de données terminée!');
    console.log('Vous pouvez maintenant démarrer votre application.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    pool.end();
    process.exit(1);
  }
}

testConnection();
