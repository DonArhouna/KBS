-- Script pour ajouter la colonne min_stock_level à la table products
-- Exécutez ce script dans votre base de données PostgreSQL

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 5;

-- Mettre à jour les produits existants avec une valeur par défaut
UPDATE products 
SET min_stock_level = 5 
WHERE min_stock_level IS NULL;
