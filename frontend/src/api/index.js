import api from './axiosConfig';

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// ─── Stations API ─────────────────────────────────────────────────────────────
export const stationsAPI = {
  getAll: (params) => api.get('/stations', { params }),
  getById: (id) => api.get(`/stations/${id}`),
  getNearby: (lat, lng, radius) => api.get('/stations/nearby', { params: { lat, lng, radius } }),
  create: (data) => api.post('/stations', data),
  update: (id, data) => api.put(`/stations/${id}`, data),
  delete: (id) => api.delete(`/stations/${id}`),
  updateSlot: (stationId, slotId, data) => api.put(`/stations/${stationId}/slots/${slotId}`, data),
};

// ─── Bookings API ─────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  complete: (id, data) => api.put(`/bookings/${id}/complete`, data),
  getAll: (params) => api.get('/bookings', { params }),
};

// ─── Billing API ─────────────────────────────────────────────────────────────
export const billingAPI = {
  getMyBilling: (params) => api.get('/billing/my', { params }),
  getBillById: (id) => api.get(`/billing/${id}`),
  getAnalytics: (period) => api.get('/billing/analytics', { params: { period } }),
  getAll: (params) => api.get('/billing', { params }),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  updatePricing: (data) => api.put('/admin/pricing', data),
};

// ─── Contact API ─────────────────────────────────────────────────────────────
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  update: (id, data) => api.put(`/contact/${id}`, data),
};
