'use client'

import React from 'react'
import { Bell, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function Header({ title, showBackButton, onBack }: HeaderProps) {
  const { user, userProfile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  const displayName = userProfile?.full_name?.split(' ')[0] || 
                     user?.email?.split('@')[0] || 
                     'Kullanıcı'

  return (
    <header 
      className="bg-white shadow-sm px-4 py-4 fixed top-0 left-0 right-0 z-50"
      style={{ height: '80px' }}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              ←
            </Button>
          )}
          <div>
            {title ? (
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900">
                  Merhaba, {displayName} 👋
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-0"
            >
              <User className="h-4 w-4 text-white" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarlar
                </button>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}