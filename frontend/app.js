const API_BASE_URL = 'http://localhost:5000/api/products';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    // Attach Event Listeners
    document.getElementById('product-form').addEventListener('submit', handleAddProduct);
    document.getElementById('refresh-btn').addEventListener('click', fetchProducts);
});

// GET: Fetch products from Flask backend and render to DOM
async function fetchProducts() {
    const tableBody = document.getElementById('inventory-table-body');
    tableBody.innerHTML = '<tr><td colspan="7">Loading inventory data...</td></tr>';

    try {
        const response = await fetch(API_BASE_URL);
        const result = await response.json();

        if (result.success) {
            renderTable(result.data);
        } else {
            tableBody.innerHTML = '<tr><td colspan="7">Failed to load data.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        tableBody.innerHTML = '<tr><td colspan="7">API Connection Error. Ensure Backend is running.</td></tr>';
    }
}

// Render product list to HTML Table
function renderTable(products) {
    const tableBody = document.getElementById('inventory-table-body');
    tableBody.innerHTML = '';

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No products found in inventory.</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Badge styling based on status
        let badgeClass = 'badge-in-stock';
        if (product.status === 'Low Stock') badgeClass = 'badge-low-stock';
        if (product.status === 'Out of Stock') badgeClass = 'badge-out-of-stock';

        row.innerHTML = `
            <td>#${product.id}</td>
            <td><strong>${escapeHtml(product.name)}</strong></td>
            <td>${escapeHtml(product.category)}</td>
            <td>${product.quantity}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td><span class="badge ${badgeClass}">${product.status}</span></td>
            <td>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// POST: Send new product details to Flask backend
async function handleAddProduct(event) {
    event.preventDefault();

    const newProduct = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseFloat(document.getElementById('price').value)
    };

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById('product-form').reset();
            fetchProducts();
        } else {
            alert('Failed to add product: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('API Connection Failed');
    }
}

// DELETE: Send delete request for specific product ID
async function deleteProduct(productId) {
    if (!confirm(`Are you sure you want to delete Product #${productId}?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            fetchProducts();
        } else {
            alert('Delete failed: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Utility to sanitize HTML
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}