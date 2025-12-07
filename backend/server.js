const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../KBS/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir les images statiques
app.use('/images', express.static(path.join(__dirname, '../ImagesSite')));

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../ImagesSite');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'KBService',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Passer123',
});

// Initialize database on startup (only if tables don't exist)
const initializeDatabase = async () => {
  try {
    // Check if tables already exist
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'products'
      ) as products_exists,
      EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'categories'
      ) as categories_exists
    `);

    const { products_exists, categories_exists } = result.rows[0];

    if (products_exists && categories_exists) {
      console.log('Database tables already exist, skipping initialization');
      return;
    }

    console.log('Database tables not found, initializing...');
    const initSQL = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    await pool.query(initSQL);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.log('Database initialization:', error.message);
  }
};

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.post('/api/init-db', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    const imagePath = `/images/${req.file.filename}`;
    res.json({ success: true, imagePath, filename: req.file.filename });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupérer l'état du stock de tous les produits
app.get('/api/products/stock', async (req, res) => {
  try {
    console.log('Fetching products stock...');
    const result = await pool.query(`
      SELECT p.id, p.name, p.stock_quantity, p.price, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name
    `);
    console.log('Products fetched successfully:', result.rows.length);

    // Calculate stock_status in JavaScript instead of SQL
    const productsWithStatus = result.rows.map(product => ({
      ...product,
      min_stock_level: 5, // Default value since column doesn't exist in DB yet
      stock_status:
        product.stock_quantity <= 0 ? 'out_of_stock' :
          product.stock_quantity <= 5 ? 'low_stock' :
            'in_stock'
    }));

    res.json(productsWithStatus);
  } catch (error) {
    console.error('Error fetching products stock:', error);
    console.error('Error details:', error.message, error.code, error.detail);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image_url, category_id, stock_quantity } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const result = await pool.query(`
      INSERT INTO products (name, description, price, image_url, category_id, stock_quantity, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [name, description, price, image_url, category_id, stock_quantity || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, category_id, stock_quantity } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const result = await pool.query(`
      UPDATE products 
      SET name = $1, description = $2, price = $3, image_url = $4, category_id = $5, stock_quantity = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [name, description, price, image_url, category_id, stock_quantity || null, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    const result = await pool.query(`
      INSERT INTO categories (name, slug, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `, [name, slug]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }
    const result = await pool.query(`
      UPDATE categories 
      SET name = $1, slug = $2
      WHERE id = $3
      RETURNING *
    `, [name, slug, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Orders routes
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { customer_name, customer_email, customer_phone, customer_address, delivery_mode, notes, total_amount, items } = req.body;
    const orderNumber = `ORD-${Date.now()}`;

    // Récupérer les informations des produits pour vérifier le stock
    const productNames = items.map(item => item.name);
    const productsResult = await client.query(`
      SELECT id, name, stock_quantity, min_stock_level
      FROM products
      WHERE name = ANY($1)
    `, [productNames]);

    const productsMap = new Map(productsResult.rows.map(p => [p.name, p]));

    // Vérifier la disponibilité du stock
    for (const item of items) {
      const product = productsMap.get(item.name);
      if (!product) {
        throw new Error(`Produit "${item.name}" non trouvé`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Stock insuffisant pour "${item.name}". Disponible: ${product.stock_quantity}, demandé: ${item.quantity}`);
      }
    }

    const orderResult = await client.query(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, delivery_mode, notes, order_number, total_amount, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW(), NOW())
      RETURNING *
    `, [customer_name, customer_email, customer_phone, customer_address, delivery_mode, notes, orderNumber, total_amount]);
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(`
        INSERT INTO order_items (order_id, product_name, quantity, unit_price, subtotal, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [order.id, item.name, item.quantity, item.unit_price, item.subtotal]);

      // Déduire le stock et créer un mouvement
      const product = productsMap.get(item.name);
      await client.query(`
        UPDATE products
        SET stock_quantity = stock_quantity - $1, updated_at = NOW()
        WHERE id = $2
      `, [item.quantity, product.id]);

      await client.query(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reason, reference_number, notes, created_by, created_at)
        VALUES ($1, 'out', $2, 'Commande créée', $3, $4, 'system', NOW())
      `, [product.id, item.quantity, orderNumber, `Sortie automatique pour commande ${orderNumber}`]);

      // Vérifier et créer des alertes de stock après la mise à jour
      await checkAndCreateStockAlerts(product.id);
    }

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Site content routes
app.get('/api/site-content', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_content');
    const content = {};
    result.rows.forEach(row => {
      if (!content[row.section]) content[row.section] = {};
      content[row.section][row.field] = row.value;
    });
    res.json(content);
  } catch (error) {
    console.error('Error fetching site content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/site-content', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const contentItems = req.body;
    if (!Array.isArray(contentItems)) {
      return res.status(400).json({ error: 'Content items must be an array' });
    }
    await client.query('DELETE FROM site_content');
    for (const item of contentItems) {
      if (!item.section || !item.field) continue;
      await client.query(`
        INSERT INTO site_content (section, field, value, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
      `, [item.section, item.field, item.value]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Site content updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating site content:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// Stock routes
app.get('/api/stock-movements', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sm.*, p.name as product_name
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/stock-movements', async (req, res) => {
  try {
    const { product_id, movement_type, quantity, reason, reference_number, notes, created_by } = req.body;
    if (!product_id || !movement_type || !quantity) {
      return res.status(400).json({ error: 'Product ID, movement type, and quantity are required' });
    }

    // Update product stock quantity
    if (movement_type === 'in') {
      await pool.query(`
        UPDATE products
        SET stock_quantity = COALESCE(stock_quantity, 0) + $1, updated_at = NOW()
        WHERE id = $2
      `, [quantity, product_id]);
    } else if (movement_type === 'out') {
      await pool.query(`
        UPDATE products
        SET stock_quantity = GREATEST(COALESCE(stock_quantity, 0) - $1, 0), updated_at = NOW()
        WHERE id = $2
      `, [quantity, product_id]);
    }

    const result = await pool.query(`
      INSERT INTO stock_movements (product_id, movement_type, quantity, reason, reference_number, notes, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `, [product_id, movement_type, quantity, reason, reference_number, notes, created_by]);

    // Vérifier et créer des alertes de stock après le mouvement
    await checkAndCreateStockAlerts(product_id);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/api/stock-alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sa.*, p.name as product_name
      FROM stock_alerts sa
      JOIN products p ON sa.product_id = p.id
      WHERE sa.is_resolved = FALSE
      ORDER BY sa.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Marquer une alerte comme résolue
app.put('/api/stock-alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;
    await pool.query(`
      UPDATE stock_alerts
      SET is_resolved = TRUE, resolved_at = NOW()
      WHERE id = $1
    `, [alertId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error resolving stock alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupérer l'état du stock de tous les produits


// Mettre à jour les paramètres de stock d'un produit
app.put('/api/products/:productId/stock-settings', async (req, res) => {
  try {
    const { productId } = req.params;
    const { min_stock_level } = req.body;

    await pool.query(`
      UPDATE products
      SET min_stock_level = $1, updated_at = NOW()
      WHERE id = $2
    `, [min_stock_level, productId]);

    // Vérifier et créer des alertes de stock après la mise à jour du seuil
    await checkAndCreateStockAlerts(productId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product stock settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Services routes
app.get('/api/services', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quotes routes
app.get('/api/quotes', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Invoices routes
app.get('/api/invoices', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/send-order-email', async (req, res) => {
  try {
    const { to, subject, orderData } = req.body;
    console.log('Sending order email:', { to, subject, orderData });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WhatsApp routes
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { message, phone, apikey } = req.body;

    if (!message || !phone || !apikey) {
      return res.status(400).json({ error: 'Message, phone, and apikey are required' });
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apikey}`;

    console.log('Envoi du message WhatsApp via backend vers:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    console.log('Réponse WhatsApp:', response.status, response.statusText);
    const responseText = await response.text();
    console.log('Contenu de la réponse:', responseText);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${responseText}`);
    }

    // CallMeBot renvoie parfois du texte même en cas de succès
    if (responseText && !responseText.toLowerCase().includes('success') && !responseText.toLowerCase().includes('sent')) {
      console.warn('Réponse inattendue de CallMeBot:', responseText);
    }

    res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      response: responseText
    });

  } catch (error) {
    console.error('Erreur WhatsApp détaillée:', error);
    res.status(500).json({
      error: 'Failed to send WhatsApp message',
      details: error.message
    });
  }
});

// Fonction pour vérifier et créer des alertes de stock
const checkAndCreateStockAlerts = async (productId) => {
  try {
    // Récupérer les informations du produit
    const productResult = await pool.query(`
      SELECT id, name, stock_quantity, min_stock_level
      FROM products
      WHERE id = $1
    `, [productId]);

    if (productResult.rows.length === 0) return;

    const product = productResult.rows[0];
    const currentStock = product.stock_quantity || 0;
    const minStock = product.min_stock_level || 5;

    // Vérifier si une alerte de rupture existe déjà
    const existingOutOfStockAlert = await pool.query(`
      SELECT id FROM stock_alerts
      WHERE product_id = $1 AND alert_type = 'out_of_stock' AND is_resolved = FALSE
    `, [productId]);

    // Vérifier si une alerte de stock faible existe déjà
    const existingLowStockAlert = await pool.query(`
      SELECT id FROM stock_alerts
      WHERE product_id = $1 AND alert_type = 'low_stock' AND is_resolved = FALSE
    `, [productId]);

    // Créer alerte de rupture si stock <= 0 et pas d'alerte existante
    if (currentStock <= 0 && existingOutOfStockAlert.rows.length === 0) {
      await pool.query(`
        INSERT INTO stock_alerts (product_id, alert_type, current_quantity, threshold_quantity)
        VALUES ($1, 'out_of_stock', $2, 0)
      `, [productId, currentStock]);
    }
    // Résoudre l'alerte de rupture si stock > 0
    else if (currentStock > 0 && existingOutOfStockAlert.rows.length > 0) {
      await pool.query(`
        UPDATE stock_alerts
        SET is_resolved = TRUE, resolved_at = NOW()
        WHERE product_id = $1 AND alert_type = 'out_of_stock' AND is_resolved = FALSE
      `, [productId]);
    }

    // Créer alerte de stock faible si stock <= seuil minimum et > 0 et pas d'alerte existante
    if (currentStock > 0 && currentStock <= minStock && existingLowStockAlert.rows.length === 0) {
      await pool.query(`
        INSERT INTO stock_alerts (product_id, alert_type, current_quantity, threshold_quantity)
        VALUES ($1, 'low_stock', $2, $3)
      `, [productId, currentStock, minStock]);
    }
    // Résoudre l'alerte de stock faible si stock > seuil minimum
    else if (currentStock > minStock && existingLowStockAlert.rows.length > 0) {
      await pool.query(`
        UPDATE stock_alerts
        SET is_resolved = TRUE, resolved_at = NOW()
        WHERE product_id = $1 AND alert_type = 'low_stock' AND is_resolved = FALSE
      `, [productId]);
    }
  } catch (error) {
    console.error('Error checking stock alerts:', error);
  }
};

// Start server and initialize database
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  pool.end(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});