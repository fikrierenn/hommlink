import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function Error({ 
  title = 'Bir hata oluştu',
  message = 'Lütfen daha sonra tekrar deneyin.',
  onRetry,
  className 
}: ErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-6', className)}>
      <div className="flex flex-col items-center space-y-2">
        <AlertCircle className="h-12 w-12 text-error" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 text-center">{message}</p>
      </div>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tekrar Dene
        </Button>
      )}
    </div>
  )
}

interface ErrorPageProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorPage({ 
  title = 'Sayfa yüklenemedi',
  message = 'Bir hata oluştu. Lütfen sayfayı yenileyin.',
  onRetry
}: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Error 
        title={title}
        message={message}
        onRetry={onRetry || (() => window.location.reload())}
      />
    </div>
  )
}