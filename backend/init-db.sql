-- Création des tables pour le projet KB&S (uniquement si elles n'existent pas)

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    category_id INTEGER REFERENCES categories(id),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_address TEXT,
    delivery_mode VARCHAR(50),
    notes TEXT,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des articles de commande
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

-- Table des alertes de stock
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
    current_quantity INTEGER NOT NULL,
    threshold_quantity INTEGER NOT NULL,
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    UNIQUE(product_id, alert_type, is_resolved)
);

-- Table du contenu du site
CREATE TABLE IF NOT EXISTS site_content (
    id SERIAL PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    field VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section, field)
);

-- Insertion de données par défaut pour les catégories (seulement si la table est vide)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories) THEN
        INSERT INTO categories (name, slug) VALUES 
        ('Électronique', 'electronique'),
        ('Vêtements', 'vetements'),
        ('Maison & Jardin', 'maison-jardin');
    END IF;
END $$;

-- Insertion de contenu par défaut pour le site (seulement si la table est vide)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM site_content) THEN
        INSERT INTO site_content (section, field, value) VALUES 
        ('hero', 'title', 'Bienvenue chez KB&S'),
        ('hero', 'subtitle', 'Votre boutique en ligne de confiance'),
        ('hero', 'description', 'Découvrez notre sélection de produits de qualité'),
        ('hero', 'image', ''),
        ('about', 'title', 'À propos de nous'),
        ('about', 'description', 'KB&S est votre partenaire de confiance pour tous vos achats en ligne'),
        ('about', 'image', ''),
        ('products', 'title', 'Nos Produits'),
        ('products', 'description', 'Découvrez notre gamme de produits'),
        ('products', 'image', ''),
        ('home', 'title', 'Accueil'),
        ('home', 'description', 'Bienvenue sur notre site'),
        ('home', 'image', ''),
        ('contact', 'title', 'Contactez-nous'),
        ('contact', 'description', 'N''hésitez pas à nous contacter'),
        ('contact', 'phone', '+33 1 23 45 67 89'),
        ('contact', 'email', 'contact@kbs.fr'),
        ('contact', 'address', '123 Rue de la Paix, 75001 Paris'),
        ('contact', 'image', '');
    END IF;
END $$;