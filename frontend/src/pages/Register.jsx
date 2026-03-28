/**
 * REGISTER PAGE
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password.length >= 10 ? 'strong' : form.password.length >= 6 ? 'medium' : 'weak'
  const strengthColor = { strong: 'bg-green-400', medium: 'bg-yellow-400', weak: 'bg-red-400' }
  const strengthWidth = { strong: 'w-full', medium: 'w-2/3', weak: 'w-1/3' }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-4 relative overflow-hidden">
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
          <h2 className="text-2xl font-display font-bold text-white mt-5">Create your account</h2>
          <p className="text-gray-400 text-sm mt-1">Join 10,000+ renters on DriveX</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input type="text" name="name" placeholder="Rahul Sharma"
              value={form.name} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input type="tel" name="phone" placeholder="+91 98765 43210"
              value={form.phone} onChange={handleChange} className="input" />
          </div>

          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} name="password"
                placeholder="Min 6 characters"
                value={form.password} onChange={handleChange}
                className="input pr-10" required minLength={6} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Password strength bar */}
            {form.password && (
              <div className="mt-1.5 space-y-1">
                <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strengthColor[strength]} ${strengthWidth[strength]}`} />
                </div>
                <p className={`text-xs capitalize ${strength === 'strong' ? 'text-green-400' : strength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {strength} password
                </p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input type="checkbox" id="terms" required className="mt-0.5 accent-orange-500" />
            <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed">
              I agree to the{' '}
              <span className="text-primary-400 cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary-400 cursor-pointer">Privacy Policy</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
