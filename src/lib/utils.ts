import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatPhone(phone: string) {
  // Turkish phone number formatting
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`
  }
  if (cleaned.length === 10) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }
  return phone
}

export function normalizePhoneForWhatsApp(phone: string): string {
  // Normalize Turkish phone number to international format for WhatsApp (+90 format)
  let phoneNumber = phone.replace(/\D/g, '') // Remove all non-digits
  
  // Convert Turkish phone formats to international with +90 prefix
  if (phoneNumber.startsWith('0') && phoneNumber.length === 11) {
    // 0555 123 45 67 -> +905551234567
    phoneNumber = '+90' + phoneNumber.slice(1)
  } else if (phoneNumber.startsWith('90') && phoneNumber.length === 12) {
    // 905551234567 -> +905551234567
    phoneNumber = '+' + phoneNumber
  } else if (phoneNumber.length === 10) {
    // 5551234567 -> +905551234567
    phoneNumber = '+90' + phoneNumber
  } else if (phoneNumber.startsWith('+90')) {
    // Already has +90 prefix
    phoneNumber = phoneNumber
  }
  
  return phoneNumber
}

export function normalizePhoneForStorage(phone: string): string {
  // Normalize Turkish phone number for consistent storage
  let phoneNumber = phone.replace(/\D/g, '') // Remove all non-digits
  
  // Convert to standard Turkish format (0555 123 45 67)
  if (phoneNumber.startsWith('90') && phoneNumber.length === 12) {
    // 905551234567 -> 05551234567
    phoneNumber = '0' + phoneNumber.slice(2)
  } else if (phoneNumber.length === 10) {
    // 5551234567 -> 05551234567
    phoneNumber = '0' + phoneNumber
  } else if (phoneNumber.startsWith('0') && phoneNumber.length === 11) {
    // Already in correct format: 05551234567
    phoneNumber = phoneNumber
  }
  
  return phoneNumber
}

export function validateTurkishPhone(phone: string): boolean {
  // Validate Turkish phone number
  const cleaned = phone.replace(/\D/g, '')
  
  // Check various formats
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    // International format: 905551234567
    return /^90[5][0-9]{9}$/.test(cleaned)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // National format: 05551234567
    return /^0[5][0-9]{9}$/.test(cleaned)
  } else if (cleaned.length === 10) {
    // Mobile format: 5551234567
    return /^[5][0-9]{9}$/.test(cleaned)
  }
  
  return false
}