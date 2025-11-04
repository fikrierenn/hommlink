'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        const dismissedTime = parseInt(dismissed)
        const now = Date.now()
        const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60)
        return hoursPassed >= 24
      }
    }
    return false
  })

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Only show if not recently dismissed
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed) {
          setShowInstallPrompt(true)
        } else {
          const dismissedTime = parseInt(dismissed)
          const now = Date.now()
          const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60)
          if (hoursPassed >= 24) {
            setShowInstallPrompt(true)
          }
        }
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Hide for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Uygulamayı Yükle</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              HommLink CRM&apos;i ana ekranınıza ekleyerek daha hızlı erişim sağlayın
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="btn-primary text-sm px-3 py-1.5"
              >
                Yükle
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
              >
                Şimdi Değil
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}