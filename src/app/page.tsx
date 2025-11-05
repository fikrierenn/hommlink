'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🏠 Home page - loading:', loading, 'user:', !!user)
    
    if (!loading) {
      // Small delay for mobile devices to ensure auth state is properly loaded
      const isMobile = typeof window !== 'undefined' && /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
      const delay = isMobile ? 500 : 100
      
      setTimeout(() => {
        if (user) {
          console.log('✅ User authenticated, redirecting to dashboard')
          router.push('/dashboard')
        } else {
          console.log('❌ No user, redirecting to login')
          router.push('/login')
        }
      }, delay)
    }
  }, [user, loading, router])

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
        <p className="text-white font-medium">HommLink CRM Yükleniyor...</p>
      </div>
    </div>
  )
}