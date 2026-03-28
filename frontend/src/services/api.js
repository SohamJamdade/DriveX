/**
 * API SERVICE
 * Centralized axios instance with auth token injection
 * All API calls go through here
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Base URL from env or default to localhost
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
})

// ─── Request Interceptor ──────────────────────
// Attach JWT token to every request automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drivex_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ─────────────────────
// Handle 401 (expired token) globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired → clear storage and redirect to login
      localStorage.removeItem('drivex_token')
      localStorage.removeItem('drivex_user')
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth APIs ─────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/password', data),
}

// ─── Vehicle APIs ──────────────────────────────
export const vehicleAPI = {
  getAll: (params) => API.get('/vehicles', { params }),
  getOne: (id) => API.get(`/vehicles/${id}`),
  getRecommended: () => API.get('/vehicles/recommended'),
  getCities: () => API.get('/vehicles/cities'),
  create: (data) => API.post('/vehicles', data),
  update: (id, data) => API.put(`/vehicles/${id}`, data),
  delete: (id) => API.delete(`/vehicles/${id}`),
  toggleWishlist: (id) => API.post(`/vehicles/${id}/wishlist`),
}

// ─── Booking APIs ──────────────────────────────
export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: () => API.get('/bookings/my'),
  getOne: (id) => API.get(`/bookings/${id}`),
  cancel: (id, reason) => API.put(`/bookings/${id}/cancel`, { reason }),
  getAll: (params) => API.get('/bookings', { params }),
  checkAvailability: (vehicleId, params) =>
    API.get(`/bookings/vehicle/${vehicleId}/availability`, { params }),
}

// ─── Review APIs ───────────────────────────────
export const reviewAPI = {
  getForVehicle: (vehicleId) => API.get(`/reviews/vehicle/${vehicleId}`),
  create: (vehicleId, data) => API.post(`/reviews/vehicle/${vehicleId}`, data),
  delete: (id) => API.delete(`/reviews/${id}`),
}

// ─── User/Admin APIs ───────────────────────────
export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getStats: () => API.get('/users/stats'),
  toggleStatus: (id) => API.put(`/users/${id}/status`),
}

export default API
