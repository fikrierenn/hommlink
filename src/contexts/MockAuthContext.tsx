'use client'

import { createContext, useContext, ReactNode } from 'react'

interface MockAuthContextType {
  user: any
  userProfile: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const mockUser = {
    id: 'mock-user-id',
    email: 'test@example.com'
  }

  const mockUserProfile = {
    id: 'mock-profile-id',
    auth_uid: 'mock-user-id',
    full_name: 'Test Kullanıcı',
    role: 'agent' as const,
    phone: '0555 123 45 67',
    email: 'test@example.com',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const value = {
    user: mockUser,
    userProfile: mockUserProfile,
    loading: false,
    signIn: async () => ({ success: true }),
    signUp: async () => ({ success: true }),
    signOut: async () => {},
    resetPassword: async () => ({ success: true }),
    updateProfile: async () => ({ success: true })
  }

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}