'use client'

import React, { useState } from 'react'
import { 
  Phone, MessageCircle, Edit, Calendar, MapPin, Clock, 
  User, FileText, Activity, Plus 
} from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { WhatsAppModal } from './WhatsAppModal'
import { CallLogModal } from './CallLogModal'
import { formatPhone, formatDate, formatDateTime } from '@/lib/utils'
import type { Lead, LeadEvent } from '@/types'

interface LeadDetailViewProps {
  lead: Lead
  events: LeadEvent[]
  onEdit: () => void
}

export function LeadDetailView({ lead, events, onEdit }: LeadDetailViewProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)

  const getStatusColor = (statusCode?: string) => {
    switch (statusCode) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'TO_CALL': return 'bg-yellow-100 text-yellow-800'
      case 'WA_SENT': return 'bg-orange-100 text-orange-800'
      case 'APPT_SET': return 'bg-purple-100 text-purple-800'
      case 'APPT_CONFIRMED': return 'bg-green-100 text-green-800'
      case 'FOLLOW_UP': return 'bg-indigo-100 text-indigo-800'
      case 'QUALIFIED': return 'bg-emerald-100 text-emerald-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'call': return <Phone className="h-4 w-4" />
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />
      case 'status_change': return <Activity className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'appointment': return <Calendar className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'call': return 'bg-blue-100 text-blue-600'
      case 'whatsapp': return 'bg-green-100 text-green-600'
      case 'status_change': return 'bg-purple-100 text-purple-600'
      case 'note': return 'bg-gray-100 text-gray-600'
      case 'appointment': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Lead Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{lead.name}</h1>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(lead.phone)}</span>
                </div>
                
                {(lead.city || lead.region) && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{[lead.city, lead.region].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="capitalize">{lead.source}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Eklendi: {formatDate(lead.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              {lead.status && (
                <Badge className={`${getStatusColor(lead.status.code)} text-sm`}>
                  {lead.status.label}
                </Badge>
              )}
              
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{lead.call_count}</p>
              <p className="text-sm text-gray-600">Arama</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              <p className="text-sm text-gray-600">Aktivite</p>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Notlar</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Next Action */}
          {lead.next_action && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">{lead.next_action}</p>
                  {lead.next_action_at && (
                    <p className="text-xs text-yellow-600">
                      {formatDateTime(lead.next_action_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCallModal(true)}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Ara</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowWhatsAppModal(true)}
              className="flex-1 flex items-center justify-center space-x-2 text-whatsapp border-whatsapp hover:bg-whatsapp hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aktivite Geçmişi</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Not Ekle
            </Button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz aktivite yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.event_type)}`}>
                    {getEventIcon(event.event_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {event.event_type === 'call' && 'Arama'}
                        {event.event_type === 'whatsapp' && 'WhatsApp'}
                        {event.event_type === 'status_change' && 'Durum Değişikliği'}
                        {event.event_type === 'note' && 'Not'}
                        {event.event_type === 'appointment' && 'Randevu'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(event.created_at)}
                      </p>
                    </div>
                    
                    {event.disposition && (
                      <p className="text-xs text-gray-600 mt-1">
                        Sonuç: {event.disposition}
                      </p>
                    )}
                    
                    {event.note && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showWhatsAppModal && (
        <WhatsAppModal
          lead={lead}
          onClose={() => setShowWhatsAppModal(false)}
          onSent={() => {
            setShowWhatsAppModal(false)
            // Refresh events or show success message
          }}
        />
      )}

      {showCallModal && (
        <CallLogModal
          lead={lead}
          onClose={() => setShowCallModal(false)}
          onLogged={() => {
            setShowCallModal(false)
            // Refresh events or show success message
          }}
        />
      )}
    </div>
  )
}