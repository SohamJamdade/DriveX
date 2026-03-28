/**
 * AUTH CONTEXT
 * Global state management for authentication
 * Provides user data and auth functions to all components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

// Custom hook to use auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true) // true while checking localStorage

  // ─── On Mount: Restore session from localStorage ───
  useEffect(() => {
    const token = localStorage.getItem('drivex_token')
    const savedUser = localStorage.getItem('drivex_user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        // Verify token is still valid with server
        authAPI.getMe()
          .then(res => setUser(res.data.user))
          .catch(() => {
            // Token invalid → clear and logout
            localStorage.removeItem('drivex_token')
            localStorage.removeItem('drivex_user')
            setUser(null)
          })
      } catch {
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  // ─── Register ──────────────────────────────────────
  const register = useCallback(async (formData) => {
    const res = await authAPI.register(formData)
    const { token, user: userData } = res.data

    localStorage.setItem('drivex_token', token)
    localStorage.setItem('drivex_user', JSON.stringify(userData))
    setUser(userData)

    toast.success(`Welcome to DriveX, ${userData.name.split(' ')[0]}! 🎉`)
    return userData
  }, [])

  // ─── Login ─────────────────────────────────────────
  const login = useCallback(async (formData) => {
    const res = await authAPI.login(formData)
    const { token, user: userData } = res.data

    localStorage.setItem('drivex_token', token)
    localStorage.setItem('drivex_user', JSON.stringify(userData))
    setUser(userData)

    toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`)
    return userData
  }, [])

  // ─── Logout ────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('drivex_token')
    localStorage.removeItem('drivex_user')
    setUser(null)
    toast.success('Logged out successfully.')
  }, [])

  // ─── Update User ───────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('drivex_user', JSON.stringify(updatedUser))
  }, [])

  // ─── Wishlist Toggle ───────────────────────────────
  const toggleWishlistLocally = useCallback((vehicleId) => {
    setUser(prev => {
      if (!prev) return prev
      const wishlist = prev.wishlist || []
      const isIn = wishlist.includes(vehicleId)
      const newWishlist = isIn
        ? wishlist.filter(id => id !== vehicleId)
        : [...wishlist, vehicleId]
      const updated = { ...prev, wishlist: newWishlist }
      localStorage.setItem('drivex_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    register,
    login,
    logout,
    updateUser,
    toggleWishlistLocally,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
