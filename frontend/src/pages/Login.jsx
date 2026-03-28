/**
 * LOGIN PAGE
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields.')
    setLoading(true)
    try {
      const user = await login(form)
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@drivex.com',  password: 'admin123' })
    else                  setForm({ email: 'rahul@example.com', password: 'password123' })
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white text-lg font-bold">D</span>
            </div>
            <span className="text-2xl font-display font-bold">Drive<span className="text-primary-500">X</span></span>
          </Link>
          <h2 className="text-2xl font-display font-bold text-white mt-5">Welcome back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to continue your journey</p>
        </div>

        {/* Demo credentials */}
        <div className="card p-3 mb-5">
          <p className="text-xs text-gray-500 text-center mb-2">Quick demo login:</p>
          <div className="flex gap-2">
            <button onClick={() => fillDemo('user')} type="button"
              className="flex-1 text-xs py-2 rounded-lg bg-dark-700 hover:bg-dark-600
                         border border-white/10 text-gray-300 transition-colors">
              👤 User Demo
            </button>
            <button onClick={() => fillDemo('admin')} type="button"
              className="flex-1 text-xs py-2 rounded-lg bg-primary-500/10 hover:bg-primary-500/20
                         border border-primary-500/20 text-primary-400 transition-colors">
              ⚡ Admin Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              className="input" autoComplete="email" required />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} name="password"
                placeholder="••••••••"
                value={form.password} onChange={handleChange}
                className="input pr-10" autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
