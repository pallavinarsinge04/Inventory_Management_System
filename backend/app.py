from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

RAW_URL = "https://vrputjlowmijaxeuhaj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycHV0amxvd21pamF4eGV1aGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NzI2ODMsImV4cCI6MjEwNDU0ODY4M30.0E0FWJ4qHmXvq1z15Fi-WjCwiKbTdBIwA6sJMfCskLU"

SUPABASE_URL = RAW_URL.strip().rstrip('/')

app = Flask(__name__)
CORS(app)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Password123"
SECRET_TOKEN = "Bearer secret-admin-session-token"


def is_authenticated():
    auth_header = request.headers.get('Authorization')
    return auth_header == SECRET_TOKEN


@app.route('/')
def home():
    return jsonify({
        "status": "Online",
        "message": "Inventory Management API is running."
    }), 200


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return jsonify({
            "success": True,
            "token": "secret-admin-session-token",
            "message": "Login successful"
        }), 200
    return jsonify({"success": False, "message": "Invalid credentials"}), 401


@app.route('/api/products', methods=['GET'])
def get_products():
    if not is_authenticated():
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    try:
        response = supabase.table('products').select('*').order('id', desc=True).execute()
        return jsonify({"success": True, "data": response.data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/products', methods=['POST'])
def add_product():
    if not is_authenticated():
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    try:
        data = request.json or {}
        quantity = int(data.get('quantity', 0))
        
        status = 'In Stock'
        if quantity == 0:
            status = 'Out of Stock'
        elif quantity <= 5:
            status = 'Low Stock'

        payload = {
            "name": data.get('name'),
            "category": data.get('category'),
            "quantity": quantity,
            "price": float(data.get('price', 0.0)),
            "status": status
        }

        response = supabase.table('products').insert(payload).execute()
        return jsonify({"success": True, "data": response.data}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    if not is_authenticated():
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    try:
        supabase.table('products').delete().eq('id', product_id).execute()
        return jsonify({"success": True, "message": f"Product {product_id} deleted"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)