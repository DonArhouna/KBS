const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465, // true pour 465, false pour les autres
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérification de la configuration SMTP au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Configuration SMTP incomplète ou invalide. Les emails seront simulés dans la console.');
    console.debug('Détail erreur SMTP:', error.message);
  } else {
    console.log('✅ Serveur SMTP prêt à envoyer des messages');
  }
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Parsing indispensable tout au début
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 2. Logging global après parsing pour voir le body
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body trace:', req.body ? 'PAYLOAD_PRESENT' : 'EMPTY_BODY');
  }
  next();
});

// 3. CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware pour gérer les erreurs de parsing JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('ERREUR PARSING JSON:', err.message);
    return res.status(400).json({ error: 'Payload JSON invalide', details: err.message });
  }
  next();
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.token;

    if (!token) return res.status(401).json({ error: 'Accès non autorisé' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token invalide ou expiré' });
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

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
    console.log('Vérification et initialisation des tables de la base de données...');

    // 1. Scripts de base
    const initSQL = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    await pool.query(initSQL);
    console.log('✓ init-db.sql exécuté');

    // 2. Migration Auth/Cart
    const authCartSQL = fs.readFileSync(path.join(__dirname, 'auth-cart-tables.sql'), 'utf8');
    await pool.query(authCartSQL);
    console.log('✓ auth-cart-tables.sql exécuté');

    // 3. Réparations spécifiques stock_alerts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_alerts (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        alert_type VARCHAR(50),
        current_quantity INTEGER NOT NULL DEFAULT 0,
        threshold_quantity INTEGER NOT NULL DEFAULT 0,
        message TEXT,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
    `);

    // Migration progressive des colonnes
    const addCols = [
      "ALTER TABLE stock_alerts ADD COLUMN IF NOT EXISTS current_quantity INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE stock_alerts ADD COLUMN IF NOT EXISTS threshold_quantity INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE stock_alerts ADD COLUMN IF NOT EXISTS message TEXT",
      "ALTER TABLE stock_alerts ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT FALSE"
    ];

    for (const sql of addCols) {
      try {
        await pool.query(sql);
      } catch (e) {
        // Ignorer si déjà existant (même si ADD COLUMN IF NOT EXISTS gère déjà ça en PG 9.6+)
      }
    }

    // 4. Notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Réparations spécifiques products
    await pool.query(`
       ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 5;
    `).catch(e => console.log('Products migration (min_stock_level):', e.message));

    // 6. Table pour la récupération de mot de passe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('ERREUR CRITIQUE INITIALISATION:', error.message);
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

// --- AUTHENTIFICATION ROUTES ---

// Inscription classique
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
      [email, passwordHash, full_name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Envoyer le token dans un cookie sécurisé
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion classique
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Identifiants invalides' });

    const user = result.rows[0];
    if (!user.password_hash) return res.status(401).json({ error: 'Utilisez la connexion Google pour ce compte' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Envoyer le token dans un cookie sécurisé
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Connexion Google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name, sub: google_id } = ticket.getPayload();

    let userResult = await pool.query('SELECT * FROM users WHERE email = $1 OR google_id = $2', [email, google_id]);
    let user;

    if (userResult.rows.length === 0) {
      // Création du compte
      const result = await pool.query(
        'INSERT INTO users (email, google_id, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
        [email, google_id, name]
      );
      user = result.rows[0];
    } else {
      user = userResult.rows[0];
      // Lier Google ID si ce n'est pas fait
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [google_id, user.id]);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Erreur connexion Google' });
  }
});

// Mettre à jour le profil
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, email } = req.body;
    if (!full_name || !email) return res.status(400).json({ error: 'Nom et email requis' });

    // Vérifier si l'email n'est pas déjà pris par un autre utilisateur
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
    if (existingUser.rows.length > 0) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    const result = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, full_name, role',
      [full_name, email, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// Changer le mot de passe
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });

    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if (!user.password_hash) return res.status(400).json({ error: 'Action impossible pour un compte Google' });

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, req.user.id]);

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

// Mot de passe oublié (Demande)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Pour la sécurité, on ne dit pas si l'email existe
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 heures pour éviter les soucis de fuseau horaire

    await pool.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase(), token, expiresAt]
    );

    const resetLink = `http://localhost:8080/reset-password?token=${token}`;

    // Tenter d'envoyer un email réel si configuré
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"KB&S Service" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Réinitialisation de votre mot de passe - KB&S',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
              <h1 style="color: #2D5A27; text-align: center;">KB&S Service</h1>
              <p>Bonjour,</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte KB&S.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #2D5A27; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ce lien est valable pendant 24 heures.</p>
              <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #888; text-align: center;">Ceci est un email automatique, merci de ne pas y répondre.</p>
            </div>
          `
        });
        console.log(`✅ Email envoyé avec succès à ${email}`);
      } else {
        throw new Error('SMTP not configured');
      }
    } catch (mailError) {
      console.warn(`⚠️ Échec de l'envoi d'email à ${email} : ${mailError.message}`);
      // LOG DE DÉBOGAGE (Simule l'envoi d'email si SMTP échoue)
      console.log('-----------------------------------------');
      console.log('🔗 LIEN DE RÉINITIALISATION GÉNÉRÉ POUR :', email);
      console.log(`Lien : ${resetLink}`);
      console.log('-----------------------------------------');
    }

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erreur lors de la demande' });
  }
});

// Réinitialisation du mot de passe (Validation)
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const cleanToken = token ? token.trim() : null;

    console.log(`[DEBUG] Tentative de réinitialisation avec token: ${cleanToken ? cleanToken.substring(0, 10) + '...' : 'NULL'}`);

    if (!cleanToken || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' });
    }

    const resetResult = await pool.query(
      'SELECT email FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [cleanToken]
    );

    if (resetResult.rows.length === 0) {
      console.log('[DEBUG] Token invalide ou expiré dans la DB');
      // Vérifier si le token existe mais est expiré
      const checkExists = await pool.query('SELECT expires_at FROM password_resets WHERE token = $1', [cleanToken]);
      if (checkExists.rows.length > 0) {
        console.log(`[DEBUG] Token trouvé mais expiré le: ${checkExists.rows[0].expires_at}`);
      }
      return res.status(400).json({ error: 'Lien invalide ou expiré' });
    }

    const { email } = resetResult.rows[0];
    console.log(`[DEBUG] Token valide trouvé pour l'email: ${email}`);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const updateResult = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 OR email = $3 RETURNING id',
      [passwordHash, email, email.toLowerCase()]
    );

    if (updateResult.rows.length === 0) {
      console.error(`[DEBUG] Échec de la mise à jour : Utilisateur non trouvé pour ${email}`);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    console.log(`[DEBUG] Mot de passe mis à jour avec succès pour l'utilisateur ID: ${updateResult.rows[0].id}`);
    await pool.query('DELETE FROM password_resets WHERE token = $1', [cleanToken]);

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' });
  }
});

// Déconnexion (Vider le cookie)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Déconnecté avec succès' });
});

// --- NOTIFICATIONS ROUTES ---

// Récupérer les notifications de l'utilisateur
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Erreur récupération notifications' });
  }
});

// Marquer une notification comme lue
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Erreur mise à jour notification' });
  }
});

// Marquer toutes les notifications comme lues
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Read all notifications error:', error);
    res.status(500).json({ error: 'Erreur mise à jour notifications' });
  }
});

// --- ROUTES PANIER PERSISTANT ---

// Récupérer le panier
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cartResult = await pool.query('SELECT id FROM carts WHERE user_id = $1', [req.user.id]);
    if (cartResult.rows.length === 0) return res.json({ items: [] });

    const itemsResult = await pool.query(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      `, [cartResult.rows[0].id]);

    res.json({ items: itemsResult.rows });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Erreur récupération panier' });
  }
});

// Mettre à jour le panier (Synchronisation complète)
app.post('/api/cart/sync', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (!req.body || !req.body.items) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Items du panier manquants' });
    }
    const { items } = req.body; // Array de { product_id, quantity }

    // Obtenir ou créer le panier
    let cartResult = await client.query('SELECT id FROM carts WHERE user_id = $1', [req.user.id]);
    let cartId;

    if (cartResult.rows.length === 0) {
      const newCart = await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [req.user.id]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    // Supprimer les anciens items et insérer les nouveaux
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    for (const item of items) {
      await client.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, item.product_id, item.quantity]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sync cart error:', error);
    res.status(500).json({ error: 'Erreur synchronisation panier' });
  } finally {
    client.release();
  }
});

// Ajouter un article au panier
app.post('/api/cart/items', authenticateToken, async (req, res) => {
  try {
    console.log('DEBUG CART: body=', req.body, 'headers=', req.headers['content-type']);
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Corps de requête invalide ou manquant', received: typeof req.body });
    }
    const { product_id, quantity } = req.body;

    let cartResult = await pool.query('SELECT id FROM carts WHERE user_id = $1', [req.user.id]);
    let cartId;

    if (cartResult.rows.length === 0) {
      const newCart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [req.user.id]);
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    await pool.query(`
      INSERT INTO cart_items(cart_id, product_id, quantity)
    VALUES($1, $2, $3)
      ON CONFLICT(cart_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
      `, [cartId, product_id, quantity || 1]);

    res.json({ success: true });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      error: 'Erreur ajout article',
      message: error.message,
      detail: error.detail
    });
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
      SELECT p.id, p.name, p.stock_quantity, p.price, c.name as category_name, p.min_stock_level
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name
      `);
    console.log('Products fetched successfully:', result.rows.length);

    // Calculate stock_status in JavaScript instead of SQL
    const productsWithStatus = result.rows.map(product => ({
      ...product,
      min_stock_level: product.min_stock_level || 5, // Default value if not set
      stock_status:
        product.stock_quantity <= 0 ? 'out_of_stock' :
          product.stock_quantity <= (product.min_stock_level || 5) ? 'low_stock' :
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
    const { name, description, price, image_url, category_id, stock_quantity, min_stock_level } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const result = await pool.query(`
      INSERT INTO products(name, description, price, image_url, category_id, stock_quantity, min_stock_level, created_at, updated_at)
    VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING *
      `, [name, description, price, image_url, category_id, stock_quantity || null, min_stock_level || 5]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, category_id, stock_quantity, min_stock_level } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const result = await pool.query(`
      UPDATE products 
      SET name = $1, description = $2, price = $3, image_url = $4, category_id = $5, stock_quantity = $6, min_stock_level = $7, updated_at = NOW()
      WHERE id = $8
    RETURNING *
      `, [name, description, price, image_url, category_id, stock_quantity || null, min_stock_level || 5, id]);
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
      INSERT INTO categories(name, slug, created_at)
    VALUES($1, $2, NOW())
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

// Route pour l'historique des commandes d'un utilisateur
app.get('/api/orders/history', authenticateToken, async (req, res) => {
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
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Erreur récupération historique' });
  }
});

app.post('/api/orders', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log('Tentative création commande, body:', JSON.stringify(req.body, null, 2));
    await client.query('BEGIN');

    if (!req.body || !req.body.items || !Array.isArray(req.body.items)) {
      throw new Error('Données de commande invalides ou manquantes (items requis)');
    }

    const { customer_name, customer_email, customer_phone, customer_address, delivery_mode, notes, total_amount, items, user_id } = req.body;
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
      INSERT INTO orders(customer_name, customer_email, customer_phone, customer_address, delivery_mode, notes, order_number, total_amount, status, user_id, created_at, updated_at)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, NOW(), NOW())
    RETURNING *
      `, [customer_name, customer_email, customer_phone, customer_address, delivery_mode, notes, orderNumber, total_amount, user_id || null]);
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(`
        INSERT INTO order_items(order_id, product_name, quantity, unit_price, subtotal, created_at)
    VALUES($1, $2, $3, $4, $5, NOW())
      `, [order.id, item.name, item.quantity, item.unit_price, item.subtotal]);

      // Déduire le stock et créer un mouvement
      const product = productsMap.get(item.name);
      await client.query(`
        UPDATE products
        SET stock_quantity = stock_quantity - $1, updated_at = NOW()
        WHERE id = $2
      `, [item.quantity, product.id]);

      await client.query(`
        INSERT INTO stock_movements(product_id, movement_type, quantity, reason, reference_number, notes, created_by, created_at)
    VALUES($1, 'out', $2, 'Commande créée', $3, $4, 'system', NOW())
      `, [product.id, item.quantity, orderNumber, `Sortie automatique pour commande ${orderNumber}`]);

      // Vérifier et créer des alertes de stock après la mise à jour
      await checkAndCreateStockAlerts(product.id);
    }

    // CRÉER UNE NOTIFICATION POUR L'UTILISATEUR
    if (user_id) {
      await client.query(`
        INSERT INTO notifications(user_id, title, message, type, created_at)
    VALUES($1, $2, $3, 'order', NOW())
      `, [user_id, 'Commande confirmée', `Votre commande ${orderNumber} a été enregistrée avec succès.`]);
    }

    // VIDER LE PANIER PERSISTANT SI L'UTILISATEUR EST CONNECTÉ
    if (user_id) {
      const cartResult = await client.query('SELECT id FROM carts WHERE user_id = $1', [user_id]);
      if (cartResult.rows.length > 0) {
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
      }
    }

    await client.query('COMMIT');
    console.log('Commande créée avec succès:', orderNumber);
    res.status(201).json(order);
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      code: error.code,
      detail: error.detail
    });
  } finally {
    if (client) client.release();
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
        INSERT INTO site_content(section, field, value, created_at, updated_at)
    VALUES($1, $2, $3, NOW(), NOW())
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
      INSERT INTO stock_movements(product_id, movement_type, quantity, reason, reference_number, notes, created_by, created_at)
    VALUES($1, $2, $3, $4, $5, $6, $7, NOW())
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


// Connexion Google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Token Google manquant' });

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'La connexion Google nécessite un ClientId valide dans le .env côté serveur' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Vérifier si l'utilisateur existe
    let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userResult.rows.length === 0) {
      // Créer un utilisateur s'il n'existe pas
      const newUser = await pool.query(
        'INSERT INTO users (email, full_name, role, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
        [email, name, 'customer']
      );
      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 86400000 });

    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Authentification Google invalide' });
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
        INSERT INTO stock_alerts (product_id, alert_type, current_quantity, threshold_quantity, message)
        VALUES ($1, 'out_of_stock', $2, 0, $3)
      `, [productId, currentStock, `Le produit "${product.name}" est en rupture de stock.`]);
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
        INSERT INTO stock_alerts (product_id, alert_type, current_quantity, threshold_quantity, message)
        VALUES ($1, 'low_stock', $2, $3, $4)
      `, [productId, currentStock, minStock, `Le stock du produit "${product.name}" est faible (${currentStock} unités).`]);
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