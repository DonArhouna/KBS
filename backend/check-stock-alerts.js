const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'KBService',
  user: 'postgres',
  password: 'Passer123'
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_alerts'", (err, res) => {
  if (err) {
    console.log('Erreur:', err.message);
  } else {
    if (res.rows.length > 0) {
      console.log('Table stock_alerts existe');
    } else {
      console.log('Table stock_alerts n\'existe pas');
    }
  }
  pool.end();
});
