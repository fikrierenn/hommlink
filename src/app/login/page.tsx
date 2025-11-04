'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Leaf, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await signIn(email, password)
    
    if (!result.success) {
      setError(result.error || 'Giriş başarısız')
    } else {
      router.push(redirectTo)
    }
    
    setIsLoading(false)
  }

  const handleTestLogin = () => {
    setEmail('test@example.com')
    setPassword('123456')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
            <Leaf className="h-8 w-8 text-green-500 animate-pulse" />
          </div>
          <p className="text-white font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Leaf className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">HommLink CRM</h1>
            <p className="text-green-100">Temsilci Aday Yönetimi</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="E-posta adresiniz"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Şifreniz"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Giriş yapılıyor...</span>
                  </>
                ) : (
                  <span>Giriş Yap</span>
                )}
              </button>

              {/* Register Link */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Hesabınız yok mu?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/register')}
                    className="text-green-500 hover:text-green-600 font-medium"
                  >
                    Kayıt Olun
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}