import { z } from 'zod'

// Turkish phone number validation
const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{9}$/

// Lead validation schemas
export const leadFormSchema = z.object({
  name: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(100, 'İsim en fazla 100 karakter olabilir')
    .trim(),
  
  phone: z.string()
    .regex(turkishPhoneRegex, 'Geçerli bir telefon numarası giriniz (örn: 0555 123 45 67)')
    .transform(phone => {
      // Normalize phone number
      const cleaned = phone.replace(/\D/g, '')
      if (cleaned.length === 10) {
        return `0${cleaned}`
      }
      if (cleaned.length === 13 && cleaned.startsWith('90')) {
        return `0${cleaned.slice(2)}`
      }
      return cleaned
    }),
  
  region: z.string().optional(),
  
  city: z.string().optional(),
  
  source: z.enum(['whatsapp', 'phone', 'referral', 'social_media', 'website', 'other'])
    .default('whatsapp'),
  
  notes: z.string()
    .max(1000, 'Notlar en fazla 1000 karakter olabilir')
    .optional(),
  
  status_id: z.number().optional()
})

export const leadUpdateSchema = leadFormSchema.partial()

// Call log validation schema
export const callLogSchema = z.object({
  disposition: z.enum(['answered', 'busy', 'no_answer', 'unreachable', 'wrong_number', 'callback_requested']),
  
  notes: z.string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional(),
  
  duration: z.number()
    .min(0, 'Süre negatif olamaz')
    .max(3600, 'Süre 1 saatten fazla olamaz')
    .optional(),
  
  scheduled_callback: z.string()
    .datetime('Geçerli bir tarih formatı giriniz')
    .optional()
})

// WhatsApp message validation schema
export const whatsAppMessageSchema = z.object({
  template_code: z.string()
    .min(1, 'Şablon seçimi zorunludur'),
  
  variables: z.record(z.string(), z.string())
    .default({})
})

// Search and filter validation schema
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  
  status_ids: z.array(z.number()).optional(),
  
  regions: z.array(z.string()).optional(),
  
  cities: z.array(z.string()).optional(),
  
  date_from: z.string()
    .datetime('Geçerli bir başlangıç tarihi giriniz')
    .optional(),
  
  date_to: z.string()
    .datetime('Geçerli bir bitiş tarihi giriniz')
    .optional()
}).refine(data => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_from) <= new Date(data.date_to)
  }
  return true
}, {
  message: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır',
  path: ['date_to']
})

// WhatsApp text parsing validation
export const whatsAppParseSchema = z.object({
  text: z.string()
    .min(10, 'Metin en az 10 karakter olmalıdır')
    .max(2000, 'Metin en fazla 2000 karakter olabilir')
})

// User profile validation schema
export const userProfileSchema = z.object({
  full_name: z.string()
    .min(2, 'Ad soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad soyad en fazla 100 karakter olabilir')
    .trim(),
  
  phone: z.string()
    .regex(turkishPhoneRegex, 'Geçerli bir telefon numarası giriniz')
    .optional(),
  
  email: z.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .optional()
})

// Type inference from schemas
export type LeadFormData = z.infer<typeof leadFormSchema>
export type LeadUpdateData = z.infer<typeof leadUpdateSchema>
export type CallLogData = z.infer<typeof callLogSchema>
export type WhatsAppMessageData = z.infer<typeof whatsAppMessageSchema>
export type SearchFiltersData = z.infer<typeof searchFiltersSchema>
export type WhatsAppParseData = z.infer<typeof whatsAppParseSchema>
export type UserProfileData = z.infer<typeof userProfileSchema>