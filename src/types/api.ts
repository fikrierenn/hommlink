import { Lead, LeadEvent, StatusDefinition, WhatsAppTemplate } from './database'

// API Request types
export interface CreateLeadRequest {
  name: string
  phone: string
  region?: string
  city?: string
  source: string
  notes?: string
  status_id?: string
}

export interface UpdateLeadRequest {
  name?: string
  phone?: string
  region?: string
  city?: string
  notes?: string
  status_id?: string
  next_action?: string
  next_action_at?: string
  appointment_date?: string
}

export interface CreateLeadEventRequest {
  lead_id: string
  event_type: 'call' | 'whatsapp' | 'status_change' | 'note' | 'appointment'
  disposition?: string
  note?: string
  metadata?: Record<string, any>
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  hasMore: boolean
}

// Filter and search types
export interface LeadFilters {
  status_ids?: string[]
  regions?: string[]
  cities?: string[]
  date_range?: {
    start: string
    end: string
  }
  search?: string
  owner_uid?: string
}

export interface LeadSortOptions {
  field: 'created_at' | 'updated_at' | 'name' | 'last_contact_at'
  direction: 'asc' | 'desc'
}

// WhatsApp integration types
export interface ParsedContact {
  name?: string
  phone?: string
  region?: string
  city?: string
  raw_text: string
  confidence: number
}

export interface WhatsAppMessage {
  template_code: string
  lead_id: string
  variables: Record<string, string>
  message: string
}

// Call disposition types
export type CallDisposition = 
  | 'answered'
  | 'busy'
  | 'no_answer'
  | 'unreachable'
  | 'wrong_number'
  | 'callback_requested'

export interface CallLogEntry {
  lead_id: string
  disposition: CallDisposition
  notes?: string
  duration?: number
  scheduled_callback?: string
}

// Dashboard analytics types
export interface DashboardStats {
  total_leads: number
  new_leads_today: number
  new_leads_this_week: number
  new_leads_this_month: number
  calls_today: number
  calls_this_week: number
  calls_this_month: number
  appointments_today: number
  appointments_this_week: number
  appointments_this_month: number
  whatsapp_sent_today: number
  whatsapp_sent_this_week: number
  whatsapp_sent_this_month: number
}

export interface StatusDistribution {
  status: StatusDefinition
  count: number
  percentage: number
}

export interface ConversionMetrics {
  total_leads: number
  qualified_leads: number
  appointments_set: number
  appointments_confirmed: number
  conversion_rate: number
  appointment_rate: number
}