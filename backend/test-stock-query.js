const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'KBService',
  user: 'postgres',
  password: 'Passer123'
});

async function testStockQuery() {
  try {
    console.log('Testing /api/products/stock query...');

    const query = `
      SELECT
        p.id,
        p.name,
        p.stock_quantity,
        COALESCE(p.min_stock_level, 5) as min_stock_level,
        CASE
          WHEN p.stock_quantity <= 0 THEN 'out_of_stock'
          WHEN p.stock_quantity <= COALESCE(p.min_stock_level, 5) THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status,
        p.price,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name
    `;

    const result = await pool.query(query);
    console.log('Query executed successfully!');
    console.log('Number of products:', result.rows.length);
    console.log('Sample product:', result.rows[0] || 'No products found');

    console.log('\nTesting stock_alerts table...');
    const alertsQuery = 'SELECT * FROM stock_alerts';
    const alertsResult = await pool.query(alertsQuery);
    console.log('Stock alerts:', alertsResult.rows.length, 'alerts found');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    pool.end();
  }
}

testStockQuery();
