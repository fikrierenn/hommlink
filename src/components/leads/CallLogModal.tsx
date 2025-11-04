'use client'

import React, { useState } from 'react'
import { X, Phone, Clock } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { CALL_DISPOSITIONS } from '@/types'
import type { Lead, CallDisposition } from '@/types'

interface CallLogModalProps {
  lead: Lead
  onClose: () => void
  onLogged: () => void
}

export function CallLogModal({ lead, onClose, onLogged }: CallLogModalProps) {
  const [disposition, setDisposition] = useState<CallDisposition | ''>('')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [scheduledCallback, setScheduledCallback] = useState('')

  const selectedDisposition = CALL_DISPOSITIONS.find(d => d.value === disposition)

  const handleSubmit = () => {
    if (!disposition) return

    // Here you would call the API to log the call
    // For now, we'll just close the modal
    console.log('Logging call:', {
      leadId: lead.id,
      disposition,
      notes,
      duration: duration ? parseInt(duration) : undefined,
      scheduledCallback: scheduledCallback || undefined
    })

    onLogged()
  }

  const getDispositionColor = (color: string) => {
    switch (color) {
      case 'success': return 'border-green-300 bg-green-50 text-green-800'
      case 'warning': return 'border-yellow-300 bg-yellow-50 text-yellow-800'
      case 'error': return 'border-red-300 bg-red-50 text-red-800'
      case 'info': return 'border-blue-300 bg-blue-50 text-blue-800'
      default: return 'border-gray-300 bg-gray-50 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Arama Kaydı</h3>
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
          <div className="p-4 space-y-4">
            {/* Call Disposition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Arama Sonucu *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CALL_DISPOSITIONS.map((disp) => (
                  <button
                    key={disp.value}
                    onClick={() => setDisposition(disp.value)}
                    className={`p-3 text-sm border rounded-lg transition-colors ${
                      disposition === disp.value
                        ? getDispositionColor(disp.color)
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {disp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arama Süresi (saniye)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Örn: 120"
                  min="0"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Arama ile ilgili notlarınızı yazın..."
              />
            </div>

            {/* Scheduled Callback */}
            {disposition === 'callback_requested' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geri Arama Tarihi
                </label>
                <input
                  type="datetime-local"
                  value={scheduledCallback}
                  onChange={(e) => setScheduledCallback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            )}

            {/* Call History Preview */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Arama Geçmişi</p>
              <p className="text-sm text-gray-800">
                Toplam {lead.call_count} arama yapıldı
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={!disposition}
              className="w-full"
            >
              Aramayı Kaydet
            </Button>
            
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