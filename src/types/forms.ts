// Form validation schemas and types

export interface LeadFormErrors {
  name?: string
  phone?: string
  region?: string
  city?: string
  source?: string
  notes?: string
  status_id?: string
}

export interface CallLogFormData {
  disposition: string
  notes?: string
  duration?: number
  scheduled_callback?: string
}

export interface CallLogFormErrors {
  disposition?: string
  notes?: string
  duration?: string
  scheduled_callback?: string
}

export interface WhatsAppFormData {
  template_code: string
  variables: Record<string, string>
}

export interface WhatsAppFormErrors {
  template_code?: string
  variables?: Record<string, string>
}

export interface SearchFormData {
  query?: string
  status_ids?: number[]
  regions?: string[]
  cities?: string[]
  date_from?: string
  date_to?: string
}

// Validation rules
export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  phone: {
    required: true,
    pattern: /^(\+90|0)?[5][0-9]{9}$/, // Turkish mobile phone format
    message: 'Geçerli bir telefon numarası giriniz (örn: 0555 123 45 67)'
  },
  notes: {
    maxLength: 1000
  }
} as const

// Form field options
export const LEAD_SOURCES = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Telefon' },
  { value: 'referral', label: 'Referans' },
  { value: 'social_media', label: 'Sosyal Medya' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Diğer' }
] as const

export const TURKISH_REGIONS = [
  'Marmara',
  'Ege',
  'Akdeniz',
  'İç Anadolu',
  'Karadeniz',
  'Doğu Anadolu',
  'Güneydoğu Anadolu'
] as const

export const CALL_DISPOSITIONS = [
  { value: 'answered', label: 'Görüştü', color: 'success' },
  { value: 'busy', label: 'Meşgul', color: 'warning' },
  { value: 'no_answer', label: 'Cevap Vermedi', color: 'warning' },
  { value: 'unreachable', label: 'Ulaşılamadı', color: 'error' },
  { value: 'wrong_number', label: 'Yanlış Numara', color: 'error' },
  { value: 'callback_requested', label: 'Geri Arama İstedi', color: 'info' }
] as const