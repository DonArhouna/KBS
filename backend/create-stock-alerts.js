const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'KBService',
  user: 'postgres',
  password: 'Passer123'
});

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_alerts (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
        current_quantity INTEGER NOT NULL,
        threshold_quantity INTEGER NOT NULL,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        UNIQUE(product_id, alert_type, is_resolved)
      );
    `);
    console.log('stock_alerts table created successfully');
  } catch (error) {
    console.error('Error creating stock_alerts table:', error);
  } finally {
    pool.end();
  }
};

createTable();
