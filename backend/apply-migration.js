const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'KBService',
    user: 'postgres',
    password: 'Passer123',
});

const runMigration = async () => {
    try {
        console.log('Tentative de connexion à la base de données (p: 5433)...');
        const sql = fs.readFileSync(path.join(__dirname, 'auth-cart-tables.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Migration appliquée avec succès !');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ECONNREFUSED' && pool.options.port === 5433) {
            console.log('Port 5433 refusé, essai sur 5432...');
            pool.options.port = 5432;
            return runMigration();
        }
        console.error('❌ Erreur lors de la migration:', err.message);
        process.exit(1);
    }
};

runMigration();
