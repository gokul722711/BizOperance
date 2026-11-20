import api from './client';

export const dashboardApi = {
  getOverview: (range = '30d') => api.get(`/dashboard/?range=${range}`),
};

export const ordersApi = {
  list: (params) => api.get('/orders/', { params }),
  get: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  update: (id, data) => api.put(`/orders/${id}/`, data),
  updateStatus: (id, status) => api.post(`/orders/${id}/update_status/`, { status }),
  updatePaymentStatus: (id, payment_status) =>
    api.post(`/orders/${id}/update_payment_status/`, { payment_status }),
  cancel: (id) => api.post(`/orders/${id}/cancel/`),
};

export const productsApi = {
  list: (params) => api.get('/products/', { params }),
  get: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
  adjustStock: (id, data) => api.post(`/products/${id}/adjust_stock/`, data),
  categories: () => api.get('/products/categories/'),
  summary: () => api.get('/products/summary/'),
};

export const customersApi = {
  list: (params) => api.get('/customers/', { params }),
  get: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}/`, data),
  delete: (id) => api.delete(`/customers/${id}/`),
};

export const tasksApi = {
  list: (params) => api.get('/tasks/', { params }),
  get: (id) => api.get(`/tasks/${id}/`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
  changeStatus: (id, status) => api.post(`/tasks/${id}/change_status/`, { status }),
  summary: () => api.get('/tasks/summary/'),
};

export const settingsApi = {
  get: () => api.get('/settings/'),
  update: (data) => api.put('/settings/', data),
};

export const analyticsApi = {
  getOverview: (range = '30d') => api.get(`/analytics/overview/?range=${range}`),
  exportUrl: (type = 'orders') => `/api/analytics/export/?type=${type}`,
};

export const coreApi = {
  search: (q) => api.get(`/search/?q=${encodeURIComponent(q)}`),
  notifications: () => api.get('/notifications/'),
  markNotificationRead: (id) => api.post(`/notifications/${id}/mark_as_read/`),
  markAllNotificationsRead: () => api.post('/notifications/mark_all_read/'),
  activity: () => api.get('/activity/'),
  resetDemo: () => api.post('/demo/reset/'),
};
