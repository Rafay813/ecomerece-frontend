const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const config = { headers, ...options };
  if (config.body && typeof config.body !== "string") config.body = JSON.stringify(config.body);
  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

// ✅ uploadAPI — needed by AdminProductForm
export const uploadAPI = {
  uploadImage: async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
  },
};

export const authAPI = {
  register: (d) => request("/auth/register", { method: "POST", body: d }),
  login: (d) => request("/auth/login", { method: "POST", body: d }),
  getMe: () => request("/auth/me"),
  updateProfile: (d) => request("/auth/me", { method: "PUT", body: d }),
  updatePassword: (d) => request("/auth/password", { method: "PUT", body: d }),
  getAllUsers: () => request("/auth/users"),
  getPendingRequests: () => request("/auth/users/pending"),
  approveUser: (id) => request(`/auth/users/${id}/approve`, { method: "PUT" }),
  rejectUser: (id) => request(`/auth/users/${id}/reject`, { method: "PUT" }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: "DELETE" }),
};

export const productAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
    ).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getFeatured: () => request("/products/featured"),
  getCategories: () => request("/products/meta/categories"),
  getById: (id) => request(`/products/${id}`),
  create: (d) => request("/products", { method: "POST", body: d }),
  update: (id, d) => request(`/products/${id}`, { method: "PUT", body: d }),
  delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
  // ✅ NEW: only fetch products created by the logged-in admin
  getMine: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
    ).toString();
    return request(`/products/admin/mine${qs ? `?${qs}` : ""}`);
  },
};

export const cartAPI = {
  get: (sid) => request(`/cart/${sid}`),
  addItem: (sid, productId, quantity = 1) =>
    request(`/cart/${sid}/items`, { method: "POST", body: { productId, quantity } }),
  updateItem: (sid, productId, quantity) =>
    request(`/cart/${sid}/items/${productId}`, { method: "PUT", body: { quantity } }),
  removeItem: (sid, productId) =>
    request(`/cart/${sid}/items/${productId}`, { method: "DELETE" }),
  clear: (sid) => request(`/cart/${sid}`, { method: "DELETE" }),
};

export const orderAPI = {
  place: (data) => request("/orders", { method: "POST", body: data }),
  getMy: (sessionId) => request(`/orders/my?sessionId=${sessionId}`),
  getById: (id) => request(`/orders/${id}`),
  cancel: (id) => request(`/orders/${id}/cancel`, { method: "PUT" }),
  // ✅ NEW: only orders containing this admin's products
  getMyAdminOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders/admin/mine${qs ? `?${qs}` : ""}`);
  },
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders/admin/all${qs ? `?${qs}` : ""}`);
  },
  updateStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: "PUT", body: { status } }),
};