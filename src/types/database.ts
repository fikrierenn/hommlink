// Database table types matching Supabase schema

export interface User {
  id: string
  auth_uid: string
  full_name: string
  role: 'agent' | 'admin'
  phone?: string | null
  email?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StatusDefinition {
  id: string
  code: string
  label: string
  color: string
  order_index: number
  is_active: boolean
}

export interface Lead {
  id: string
  external_id?: string | null
  source: string
  name: string
  phone: string
  region?: string | null
  city?: string | null
  status_id?: string | null
  status?: StatusDefinition
  notes?: string | null
  next_action?: string | null
  next_action_at?: string | null
  call_count: number
  owner_uid: string
  owner?: User
  created_at: string
  updated_at: string
}

export interface LeadEvent {
  id: string
  lead_id: string
  event_type: 'call' | 'whatsapp' | 'status_change' | 'note' | 'appointment'
  disposition?: string | null
  note?: string | null
  created_by: string
  created_at: string
}

export interface WhatsAppTemplate {
  id: string
  code: string
  name: string
  message: string
  variables: string[]
  is_active: boolean
  created_at: string
}

// Database insert types (without auto-generated fields)
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'owner' | 'call_count'>
export type LeadEventInsert = Omit<LeadEvent, 'id' | 'created_at' | 'created_by'>

// Database update types (all fields optional except id)
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
export type LeadUpdate = Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'owner'>> & {
  last_contact_at?: string | null
  appointment_date?: string | null
}
export type StatusDefinitionUpdate = Partial<Omit<StatusDefinition, 'id'>>