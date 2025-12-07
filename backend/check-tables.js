const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'KBService',
  user: 'postgres',
  password: 'Passer123'
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", (err, res) => {
  if (err) {
    console.log('Erreur:', err.message);
  } else {
    console.log('Tables existantes:', res.rows.map(r => r.table_name));
  }
  pool.end();
});
