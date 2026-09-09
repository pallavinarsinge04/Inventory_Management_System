-- Create Database
CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- Create Inventory Items Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'In Stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Sample Records
INSERT INTO products (name, category, quantity, price, status) VALUES
('Dell XPS 15 Laptop', 'Electronics', 12, 1250.00, 'In Stock'),
('Logitech MX Master 3S', 'Accessories', 45, 99.99, 'In Stock'),
('Ergonomic Office Chair', 'Furniture', 3, 250.00, 'Low Stock'),
('USB-C Hub Multiport', 'Accessories', 0, 29.99, 'Out of Stock');