const { Pool } = require('pg');
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'KBService',
    user: 'postgres',
    password: 'Passer123'
});

async function checkColumns() {
    try {
        const tables = ['users', 'password_resets'];
        for (const table of tables) {
            const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
            console.log(`\nColumns for ${table}:`);
            res.rows.forEach(row => {
                console.log(`- ${row.column_name} (${row.data_type})`);
            });
        }
    } catch (err) {
        console.log('Erreur:', err.message);
    } finally {
        pool.end();
    }
}

checkColumns();
