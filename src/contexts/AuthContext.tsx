'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthContextType {
  user: SupabaseUser | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔍 Initial session check:', session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 User found, loading profile:', session.user.id)
        await loadUserProfile(session.user.id)
      } else {
        console.log('❌ No user session found')
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUid: string) => {
    try {
      console.log('🔄 Loading user profile for:', authUid)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uid', authUid)
        .single()

      console.log('📊 Profile query result:', { data, error })

      if (error) {
        // Kullanıcı profili bulunamadıysa normal (yeni kullanıcı olabilir)
        console.log('❌ Profile error:', error.code, error.message)
        if (error.code !== 'PGRST116') {
          console.error('Error loading user profile:', error)
        }
        return
      }

      if (data) {
        console.log('✅ Profile loaded successfully:', data.full_name)
        setUserProfile({
          id: data.id,
          auth_uid: data.auth_uid,
          full_name: data.full_name,
          role: data.role,
          phone: data.phone,
          email: data.email,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
      } else {
        console.log('⚠️ No profile data returned')
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      console.log('🔐 Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      console.log('🔐 Sign in result:', { data: !!data.user, error: error?.message })

      if (error) {
        console.error('❌ Sign in error:', error)
        return { success: false, error: getAuthErrorMessage(error.message) }
      }

      if (data.user) {
        console.log('✅ Sign in successful for user:', data.user.id)
        // Force session refresh
        await supabase.auth.getSession()
        return { success: true }
      }

      return { success: false, error: 'Giriş yapılamadı' }
    } catch (error) {
      console.error('❌ Sign in exception:', error)
      return { success: false, error: 'Giriş yapılırken bir hata oluştu' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      })

      if (error) {
        return { success: false, error: getAuthErrorMessage(error.message) }
      }

      // Create user profile if signup successful
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_uid: data.user.id,
            full_name: fullName,
            phone: phone,
            email: email,
            role: 'agent',
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Kayıt olurken bir hata oluştu' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: getAuthErrorMessage(error.message) }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu' }
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!userProfile) {
        return { success: false, error: 'Kullanıcı profili bulunamadı' }
      }

      setLoading(true)

      const { error } = await supabase
        .from('users')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          email: updates.email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id)

      if (error) {
        return { success: false, error: 'Profil güncellenirken bir hata oluştu' }
      }

      // Reload profile
      await loadUserProfile(userProfile.auth_uid)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Profil güncellenirken bir hata oluştu' }
    } finally {
      setLoading(false)
    }
  }

  const getAuthErrorMessage = (message: string): string => {
    switch (message) {
      case 'Invalid login credentials':
        return 'Geçersiz e-posta veya şifre'
      case 'Email not confirmed':
        return 'E-posta adresinizi doğrulamanız gerekiyor'
      case 'User already registered':
        return 'Bu e-posta adresi zaten kayıtlı'
      case 'Password should be at least 6 characters':
        return 'Şifre en az 6 karakter olmalıdır'
      case 'Unable to validate email address: invalid format':
        return 'Geçersiz e-posta formatı'
      case 'Signup requires a valid password':
        return 'Geçerli bir şifre gereklidir'
      default:
        return message
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}