from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from config import DB_CONFIG

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

def get_db_connection():
    """Establishes connection with MySQL database."""
    return mysql.connector.connect(**DB_CONFIG)

# ---------------------------------------------------------
# REST API ENDPOINTS
# ---------------------------------------------------------

# GET: Fetch all inventory items
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products ORDER BY id DESC")
        products = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "data": products}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# POST: Add a new inventory product
@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        data = request.json
        name = data.get('name')
        category = data.get('category')
        quantity = int(data.get('quantity', 0))
        price = float(data.get('price', 0.0))

        # Determine automated status based on stock level
        status = 'In Stock'
        if quantity == 0:
            status = 'Out of Stock'
        elif quantity <= 5:
            status = 'Low Stock'

        conn = get_db_connection()
        cursor = conn.cursor()
        query = "INSERT INTO products (name, category, quantity, price, status) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(query, (name, category, quantity, price, status))
        conn.commit()
        product_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Product added successfully", "id": product_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# DELETE: Remove an inventory item
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": f"Product {product_id} deleted"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)