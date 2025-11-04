'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, MessageCircle, Calendar, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { formatPhone, formatDate } from '@/lib/utils'
import type { Lead } from '@/types'

interface LeadCardProps {
  lead: Lead
  onWhatsAppPress?: (lead: Lead) => void
  onCallPress?: (lead: Lead) => void
  onStatusChange?: (leadId: string, statusId: number) => void
}

export function LeadCard({ 
  lead, 
  onWhatsAppPress, 
  onCallPress, 
  onStatusChange 
}: LeadCardProps) {
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

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onWhatsAppPress?.(lead)
  }

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCallPress?.(lead)
  }

  return (
    <Link href={`/leads/${lead.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{lead.name}</h3>
              <p className="text-sm text-gray-600">{formatPhone(lead.phone)}</p>
            </div>
            
            {lead.status && (
              <Badge 
                className={`text-xs ${getStatusColor(lead.status.code)}`}
                size="sm"
              >
                {lead.status.label}
              </Badge>
            )}
          </div>

          {/* Location & Source */}
          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
            {(lead.city || lead.region) && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{[lead.city, lead.region].filter(Boolean).join(', ')}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="capitalize">{lead.source}</span>
            </div>
          </div>

          {/* Notes Preview */}
          {lead.notes && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {lead.notes}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{lead.call_count} arama</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(lead.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCall}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Ara</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center space-x-2 text-whatsapp border-whatsapp hover:bg-whatsapp hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </Button>
          </div>

          {/* Next Action */}
          {lead.next_action && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">{lead.next_action}</p>
                  {lead.next_action_at && (
                    <p className="text-xs text-yellow-600">
                      {formatDate(lead.next_action_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}