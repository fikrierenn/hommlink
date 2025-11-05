'use client'

import { useState } from 'react'
import { MessageSquare, Copy, Check, AlertCircle, Sparkles } from 'lucide-react'
import { parseWhatsAppText } from '@/lib/whatsapp-parser'
import { Button } from '@/components/ui'

interface ParsedData {
  name: string
  phone: string
  location: string
  originalText: string
}

interface WhatsAppParserProps {
  onParsed?: (data: ParsedData) => void
  className?: string
}

export default function WhatsAppParser({ onParsed, className = '' }: WhatsAppParserProps) {
  const [inputText, setInputText] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleParse = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    
    try {
      // Simulate parsing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result = parseWhatsAppText(inputText)
      const parsed: ParsedData = {
        name: result.name || '',
        phone: result.phone || '',
        location: result.location || '',
        originalText: inputText
      }
      
      setParsedData(parsed)
      onParsed?.(parsed)
    } catch (error) {
      console.error('Parse error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleClear = () => {
    setInputText('')
    setParsedData(null)
    setCopied(null)
  }

  const sampleText = `Merhaba, ben Ahmet Yılmaz. 
Telefon numaram: 0532 123 45 67
İstanbul Kadıköy'de yaşıyorum.
Temsilcilik hakkında bilgi almak istiyorum.`

  const handleUseSample = () => {
    setInputText(sampleText)
  }

  return (
    <div className={`bg-white rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">WhatsApp Metin Ayrıştırıcı</h2>
          <p className="text-sm text-gray-500">WhatsApp mesajlarından aday bilgilerini otomatik çıkarın</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              WhatsApp Mesajını Yapıştırın
            </label>
            <button
              onClick={handleUseSample}
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Örnek Kullan</span>
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="WhatsApp mesajını buraya yapıştırın..."
            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleParse}
            disabled={!inputText.trim() || isLoading}
            className="flex-1"
            variant="primary"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ayrıştırılıyor...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Metni Ayrıştır
              </>
            )}
          </Button>
          
          {inputText && (
            <Button
              onClick={handleClear}
              variant="outline"
              className="px-4"
            >
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {parsedData && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            Ayrıştırılan Bilgiler
          </h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Ad Soyad</label>
                {parsedData.name && (
                  <button
                    onClick={() => handleCopy(parsedData.name, 'name')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copied === 'name' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={parsedData.name}
                  onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Ad soyad bulunamadı"
                />
                {!parsedData.name && (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Telefon</label>
                {parsedData.phone && (
                  <button
                    onClick={() => handleCopy(parsedData.phone, 'phone')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copied === 'phone' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={parsedData.phone}
                  onChange={(e) => setParsedData({ ...parsedData, phone: e.target.value })}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Telefon numarası bulunamadı"
                />
                {!parsedData.phone && (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Konum</label>
                {parsedData.location && (
                  <button
                    onClick={() => handleCopy(parsedData.location, 'location')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copied === 'location' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={parsedData.location}
                  onChange={(e) => setParsedData({ ...parsedData, location: e.target.value })}
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="Konum bilgisi bulunamadı"
                />
                {!parsedData.location && (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          </div>

          {/* Usage Tip */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">İpucu:</p>
                <p>Ayrıştırılan bilgileri manuel olarak düzenleyebilirsiniz. Kopyala butonları ile bilgileri kolayca kopyalayabilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}