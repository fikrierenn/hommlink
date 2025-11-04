'use client'

import React, { useState } from 'react'
import { Save, X } from 'lucide-react'
import { Card, CardContent, Button, Input } from '@/components/ui'
import { useStatuses } from '@/hooks'
import { useAuth } from '@/contexts/AuthContext'
import { normalizePhoneForStorage, validateTurkishPhone } from '@/lib/utils'
import { LEAD_SOURCES, TURKISH_REGIONS } from '@/types'
import type { LeadInsert } from '@/types'

interface LeadCreateFormProps {
  onSave: (leadData: LeadInsert) => Promise<void>
  onCancel: () => void
  initialData?: Partial<LeadInsert>
}

export function LeadCreateForm({ onSave, onCancel, initialData }: LeadCreateFormProps) {
  const { user } = useAuth()
  const { statuses } = useStatuses()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    region: initialData?.region || '',
    city: initialData?.city || '',
    source: initialData?.source || 'whatsapp',
    notes: initialData?.notes || '',
    status_id: initialData?.status_id || undefined
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'İsim gereklidir'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir'
    } else {
      if (!validateTurkishPhone(formData.phone)) {
        newErrors.phone = 'Geçerli bir Türk telefon numarası giriniz (örn: 0555 123 45 67)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const leadData: LeadInsert = {
        name: formData.name.trim(),
        phone: normalizePhoneForStorage(formData.phone.trim()),
        region: formData.region || undefined,
        city: formData.city || undefined,
        source: formData.source,
        notes: formData.notes || undefined,
        status_id: formData.status_id || undefined,
        owner_uid: user?.id || ''
      }

      await onSave(leadData)
    } catch (error) {
      console.error('Error creating lead:', error)
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aday Bilgileri</h2>
          
          {/* Name */}
          <Input
            label="Ad Soyad *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="Örn: Ahmet Yılmaz"
          />

          {/* Phone */}
          <Input
            label="Telefon *"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="Örn: 0555 123 45 67"
          />

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bölge
            </label>
            <select
              value={formData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Bölge seçin</option>
              {TURKISH_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <Input
            label="Şehir"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Örn: İstanbul"
          />

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kaynak
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {LEAD_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Durumu
            </label>
            <select
              value={formData.status_id || ''}
              onChange={(e) => handleInputChange('status_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Otomatik (Yeni)</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Aday hakkında notlarınızı yazın..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3 pb-6">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 flex items-center justify-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>İptal</span>
        </Button>
      </div>
    </form>
  )
}