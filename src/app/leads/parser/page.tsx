'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { WhatsAppParser } from '@/components/leads'
import { Button } from '@/components/ui'

interface ParsedData {
  name: string
  phone: string
  location: string
  originalText: string
}

export default function WhatsAppParserPage() {
  const router = useRouter()
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)

  const handleParsed = (data: ParsedData) => {
    setParsedData(data)
  }

  const handleCreateLead = () => {
    if (parsedData) {
      // Lead oluşturma sayfasına parsed data ile git
      const params = new URLSearchParams({
        name: parsedData.name || '',
        phone: parsedData.phone || '',
        location: parsedData.location || '',
        source: 'whatsapp_parser'
      })
      router.push(`/leads/new?${params.toString()}`)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Ayrıştırıcı</h1>
            <p className="text-gray-500">WhatsApp mesajlarından aday bilgilerini çıkarın</p>
          </div>
        </div>

        {/* Parser Component */}
        <WhatsAppParser onParsed={handleParsed} />

        {/* Create Lead Button */}
        {parsedData && (parsedData.name || parsedData.phone) && (
          <div className="bg-white rounded-2xl p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aday Oluşturmaya Hazır!
              </h3>
              <p className="text-gray-500 mb-4">
                Ayrıştırılan bilgilerle yeni bir aday oluşturabilirsiniz.
              </p>
              <Button
                onClick={handleCreateLead}
                className="inline-flex items-center space-x-2"
                variant="primary"
              >
                <UserPlus className="h-4 w-4" />
                <span>Aday Oluştur</span>
              </Button>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nasıl Kullanılır?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">1</span>
              </div>
              <p>WhatsApp'tan gelen mesajı kopyalayın</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">2</span>
              </div>
              <p>Yukarıdaki metin kutusuna yapıştırın</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">3</span>
              </div>
              <p>"Metni Ayrıştır" butonuna tıklayın</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">4</span>
              </div>
              <p>Ayrıştırılan bilgileri kontrol edin ve gerekirse düzenleyin</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-green-600">5</span>
              </div>
              <p>"Aday Oluştur" butonuna tıklayarak yeni aday ekleyin</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}