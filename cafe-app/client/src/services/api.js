const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Lỗi không xác định');
  return data;
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => request('/auth/me'),

  // Menu
  getMenu: () => request('/menu'),
  getItems: () => request('/menu/items'),
  addItem: (item) => request('/menu/items', { method: 'POST', body: JSON.stringify(item) }),
  updateItem: (id, item) => request(`/menu/items/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  deleteItem: (id) => request(`/menu/items/${id}`, { method: 'DELETE' }),
  toggleItemStatus: (id, TrangThai) => request(`/menu/items/${id}/status`, { method: 'PATCH', body: JSON.stringify({ TrangThai }) }),

  // Tables
  getTables: () => request('/tables'),
  addTable: (table) => request('/tables', { method: 'POST', body: JSON.stringify(table) }),
  updateTable: (id, table) => request(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(table) }),
  deleteTable: (id) => request(`/tables/${id}`, { method: 'DELETE' }),
  updateTableStatus: (id, TrangThai) => request(`/tables/${id}/status`, { method: 'PATCH', body: JSON.stringify({ TrangThai }) }),

  // Cart
  getCart: (tableId) => request(`/cart/${tableId}`),
  addToCart: (tableId, item) => request(`/cart/${tableId}/items`, { method: 'POST', body: JSON.stringify(item) }),
  updateCartItem: (tableId, itemId, data) => request(`/cart/${tableId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeFromCart: (tableId, itemId) => request(`/cart/${tableId}/items/${itemId}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? '?' + query : ''}`);
  },
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (MaBan) => request('/orders', { method: 'POST', body: JSON.stringify({ MaBan }) }),
  updateOrderStatus: (id, TrangThaiOrder) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ TrangThaiOrder }) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Invoices
  getInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/invoices${query ? '?' + query : ''}`);
  },
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (orderIds, MaNV) => request('/invoices', { method: 'POST', body: JSON.stringify({ orderIds, MaNV }) }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),

  // Payments
  createPayment: (payment) => request('/payments', { method: 'POST', body: JSON.stringify(payment) }),

  // Staff
  getStaff: () => request('/staff'),
  getStaffById: (id) => request(`/staff/${id}`),
  addStaff: (staff) => request('/staff', { method: 'POST', body: JSON.stringify(staff) }),
  updateStaff: (id, staff) => request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(staff) }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request('/inventory'),
  getSuppliers: () => request('/inventory/ncc'),
  importInventory: (data) => request('/inventory/nhap', { method: 'POST', body: JSON.stringify(data) }),
  exportInventory: (data) => request('/inventory/xuat', { method: 'POST', body: JSON.stringify(data) }),

  // Recipe
  getRecipe: (maMon) => request(`/recipe/${maMon}`),
  updateRecipe: (data) => request('/recipe', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getRevenueReport: () => request('/reports/doanhthu'),
  getBestSellers: () => request('/reports/bestseller'),
  getInventoryHistory: () => request('/reports/lichsukho'),
};
