'use client'

import React from 'react'
import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  showBottomNav?: boolean
}

export function AppLayout({ 
  children, 
  title, 
  showBackButton, 
  onBack,
  showBottomNav = true 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={title}
        showBackButton={showBackButton}
        onBack={onBack}
      />
      
      <main 
        className="px-4 space-y-6"
        style={{
          paddingTop: '80px',
          paddingBottom: showBottomNav ? '80px' : '20px'
        }}
      >
        {children}
      </main>

      {showBottomNav && <BottomNavigation />}
    </div>
  )
}