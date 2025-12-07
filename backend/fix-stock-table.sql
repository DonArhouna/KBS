-- Fix the stock_movements table to use INTEGER for product_id instead of UUID
DROP TABLE IF EXISTS stock_movements CASCADE;

CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('in', 'out')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);
