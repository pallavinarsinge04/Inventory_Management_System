const API_BASE_URL = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadProducts);
    }
});

function getAuthHeader() {
    const token = localStorage.getItem('adminToken');
    return token ? `Bearer ${token}` : '';
}

function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    const loginModal = document.getElementById('login-modal');
    const userControls = document.getElementById('user-controls');

    if (!token) {
        if (loginModal) loginModal.classList.remove('hidden');
        if (userControls) userControls.classList.add('hidden');
    } else {
        if (loginModal) loginModal.classList.add('hidden');
        if (userControls) userControls.classList.remove('hidden');
        loadProducts();
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('login-user').value;
    const passwordInput = document.getElementById('login-pass').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('adminToken', data.token);
            checkAuthStatus();
        } else {
            alert(data.message || 'Invalid Credentials');
        }
    } catch (err) {
        alert('Could not connect to authentication server. Ensure Flask backend is running.');
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    checkAuthStatus();
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: { 'Authorization': getAuthHeader() }
        });

        const data = await response.json();

        if (response.status === 401) {
            handleLogout();
            return;
        }

        if (data.success) {
            renderTable(data.data);
        } else {
            alert(`Error fetching products: ${data.error}`);
        }
    } catch (err) {
        const tableBody = document.getElementById('inventory-table-body');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444; padding:20px;">API Connection Error. Ensure Backend is running.</td></tr>`;
        }
    }
}

function renderTable(products) {
    const tableBody = document.getElementById('inventory-table-body');
    if (!tableBody) return;

    if (!products || products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No products found in inventory.</td></tr>`;
        return;
    }

    tableBody.innerHTML = products.map(item => `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td><span class="badge ${getBadgeClass(item.status)}">${item.status}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="deleteProduct(${item.id})" style="padding: 4px 8px; font-size: 0.8rem; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
            </td>
        </tr>
    `).join('');
}

function getBadgeClass(status) {
    switch (status) {
        case 'In Stock': return 'badge-success';
        case 'Low Stock': return 'badge-warning';
        case 'Out of Stock': return 'badge-danger';
        default: return '';
    }
}

async function handleAddProduct(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getAuthHeader()
            },
            body: JSON.stringify({ name, category, quantity, price })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('product-form').reset();
            loadProducts();
        } else {
            alert(`Failed to add product: ${data.error}`);
        }
    } catch (err) {
        alert('API Connection Failed.');
    }
}

async function deleteProduct(id) {
    if (!confirm(`Are you sure you want to delete product #${id}?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': getAuthHeader() }
        });

        const data = await response.json();

        if (data.success) {
            loadProducts();
        } else {
            alert(`Failed to delete product: ${data.error}`);
        }
    } catch (err) {
        alert('API Connection Failed.');
    }
}