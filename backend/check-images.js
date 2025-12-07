const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'KBService',
  user: 'postgres',
  password: 'Passer123',
});

pool.query('SELECT section, field, value FROM site_content WHERE field LIKE \'%image%\' OR field = \'heroImages\'', (err, res) => {
  if (err) {
    console.log('Erreur:', err.message);
  } else {
    console.log('Images dans la base de données:');
    res.rows.forEach(row => {
      console.log(`${row.section}.${row.field}: ${row.value}`);
    });
  }
  pool.end();
});
