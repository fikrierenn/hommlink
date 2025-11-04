'use client'

import React, { useState } from 'react'
import { X, MessageCircle, Copy, ExternalLink } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { useWhatsAppTemplates } from '@/hooks'
import { normalizePhoneForWhatsApp } from '@/lib/utils'
import type { Lead } from '@/types'

interface WhatsAppModalProps {
  lead: Lead
  onClose: () => void
  onSent: () => void
}

export function WhatsAppModal({ lead, onClose, onSent }: WhatsAppModalProps) {
  const { templates } = useWhatsAppTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customMessage, setCustomMessage] = useState('')
  const [variables, setVariables] = useState<Record<string, string>>({})

  const template = templates.find(t => t.code === selectedTemplate)

  const personalizeMessage = (templateMessage: string) => {
    let message = templateMessage
    
    // Default variables
    const defaultVars = {
      ad: lead.name,
      ajan: 'Temsilci', // This should come from user profile
      telefon: lead.phone
    }

    // Merge with custom variables
    const allVars = { ...defaultVars, ...variables }

    // Replace variables
    Object.entries(allVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      message = message.replace(regex, value)
    })

    return message
  }

  const finalMessage = template ? personalizeMessage(template.message) : customMessage

  const handleSendWhatsApp = () => {
    const phoneNumber = normalizePhoneForWhatsApp(lead.phone)
    
    // WhatsApp için farklı encoding yöntemleri deneyelim
    const method1 = encodeURIComponent(finalMessage)
    const method2 = finalMessage.replace(/ /g, '%20').replace(/\n/g, '%0A')
    const method3 = finalMessage // Hiç encoding yapmadan
    
    // Method 1 kullanıyoruz - tam encoding, WhatsApp bu formatı desteklemeli
    const encodedMessage = method1
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    
    console.log('📱 WhatsApp URL:', whatsappUrl)
    console.log('📞 Phone normalization:', lead.phone, '→', phoneNumber)
    console.log('💬 Original message:', finalMessage)
    console.log('🔗 Method 1 (encodeURIComponent):', method1)
    console.log('🔗 Method 2 (manual):', method2)
    console.log('🔗 Method 3 (no encoding):', method3)
    console.log('🚀 Using method 1 (full encodeURIComponent)')
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank')
    
    // Log the event (this would be handled by the parent component)
    onSent()
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(finalMessage)
      
      // Simple toast notification
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = '✅ Mesaj kopyalandı! WhatsApp\'a yapıştırabilirsiniz.'
      document.body.appendChild(toast)
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)
      
      console.log('📋 Message copied to clipboard:', finalMessage)
    } catch (error) {
      console.error('Failed to copy message:', error)
      
      // Fallback toast
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      toast.textContent = '❌ Kopyalama başarısız. Mesajı manuel seçin.'
      document.body.appendChild(toast)
      
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 3000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-whatsapp" />
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Mesajı</h3>
                <p className="text-sm text-gray-600">{lead.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesaj Şablonu
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Özel mesaj yaz</option>
                {templates.map((template) => (
                  <option key={template.code} value={template.code}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Variables */}
            {template && template.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Değişkenler
                </label>
                <div className="space-y-2">
                  {template.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-xs text-gray-600 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder={`${variable} değerini girin`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Message */}
            {!selectedTemplate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özel Mesaj
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Mesajınızı yazın..."
                />
              </div>
            )}

            {/* Message Preview */}
            {finalMessage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj Önizleme
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {finalMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSendWhatsApp}
                disabled={!finalMessage.trim()}
                className="flex-1 bg-whatsapp hover:bg-whatsapp/90 text-white flex items-center justify-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>WhatsApp&apos;ta Aç</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCopyMessage}
                disabled={!finalMessage.trim()}
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Kopyala</span>
              </Button>
            </div>
            
            {/* Emoji Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                💡 <strong>İpucu:</strong> Emojiler doğru görünmüyorsa &quot;Kopyala&quot; butonunu kullanın ve WhatsApp&apos;a manuel yapıştırın.
              </p>
            </div>
            
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              İptal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}