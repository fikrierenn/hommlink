/**
 * WhatsApp Text Parser Utility
 * Parses WhatsApp messages to extract contact information
 */

export interface ParsedContact {
  name?: string
  phone?: string
  city?: string
  region?: string
  raw: string
  confidence: number
}

export interface ParseResult {
  success: boolean
  data?: ParsedContact
  error?: string
}

// Turkish city names for better matching
const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa', 'Malatya', 'Erzurum',
  'Van', 'Batman', 'Elazığ', 'Sivas', 'Manisa', 'Tarsus', 'Kahramanmaraş',
  'Erzincan', 'Ordu', 'Trabzon', 'Rize', 'Giresun', 'Samsun', 'Çorum',
  'Amasya', 'Tokat', 'Yozgat', 'Kırıkkale', 'Nevşehir', 'Niğde', 'Aksaray',
  'Kırşehir', 'Çankırı', 'Kastamonu', 'Sinop', 'Bartın', 'Karabük', 'Zonguldak',
  'Bolu', 'Düzce', 'Sakarya', 'Kocaeli', 'Yalova', 'Tekirdağ', 'Edirne',
  'Kırklareli', 'Çanakkale', 'Balıkesir', 'Bursa', 'Bilecik', 'Kütahya',
  'Afyon', 'Uşak', 'Denizli', 'Muğla', 'Aydın', 'İzmir', 'Manisa', 'Isparta',
  'Burdur', 'Antalya', 'Mersin', 'Karaman', 'Konya', 'Aksaray', 'Nevşehir',
  'Kırşehir', 'Yozgat', 'Sivas', 'Kayseri', 'Adana', 'Osmaniye', 'Hatay',
  'Gaziantep', 'Kilis', 'Urfa', 'Diyarbakır', 'Mardin', 'Batman', 'Siirt',
  'Şırnak', 'Hakkari', 'Van', 'Bitlis', 'Muş', 'Ağrı', 'Iğdır', 'Kars',
  'Ardahan', 'Artvin', 'Rize', 'Trabzon', 'Giresun', 'Gümüşhane', 'Bayburt',
  'Erzurum', 'Erzincan', 'Tunceli', 'Elazığ', 'Bingöl', 'Malatya', 'Adıyaman'
]

// Common Turkish name patterns
const NAME_PATTERNS = [
  // Full name patterns
  /([A-ZÇĞIÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞIÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞIÖŞÜ][a-zçğıöşü]+)?)/g,
  // Single name with title
  /(?:Bay|Bayan|Sayın|Sr|Sn)\s+([A-ZÇĞIÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞIÖŞÜ][a-zçğıöşü]+)?)/gi,
  // Name after "isim:" or "ad:"
  /(?:isim|ad|name):\s*([A-ZÇĞIÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞIÖŞÜ][a-zçğıöşü]+)?)/gi
]

// Phone number patterns (Turkish formats)
const PHONE_PATTERNS = [
  // +90 format
  /\+90\s?([0-9]{3})\s?([0-9]{3})\s?([0-9]{2})\s?([0-9]{2})/g,
  // 0 format
  /0([0-9]{3})\s?([0-9]{3})\s?([0-9]{2})\s?([0-9]{2})/g,
  // Simple 11 digit
  /([0-9]{11})/g,
  // With spaces/dashes
  /([0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{2})/g
]

// Location patterns
const LOCATION_PATTERNS = [
  // "Şehir: İstanbul" format
  /(?:şehir|city|konum|location|yer):\s*([A-ZÇĞIÖŞÜ][a-zçğıöşü]+)/gi,
  // "İstanbul'dan" format
  /([A-ZÇĞIÖŞÜ][a-zçğıöşü]+)(?:'dan|'den|'dan|'den)/g,
  // Direct city mentions
  new RegExp(`\\b(${TURKISH_CITIES.join('|')})\\b`, 'gi')
]

/**
 * Clean and normalize phone number
 */
function normalizePhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Handle different formats
  if (digits.startsWith('90') && digits.length === 12) {
    return '+' + digits
  } else if (digits.startsWith('0') && digits.length === 11) {
    return '+90' + digits.substring(1)
  } else if (digits.length === 10) {
    return '+90' + digits
  }
  
  return digits
}

/**
 * Clean and normalize name
 */
function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(Bay|Bayan|Sayın|Sr|Sn)\s+/gi, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Clean and normalize city name
 */
function normalizeCity(city: string): string {
  const normalized = city.trim()
    .replace(/['']dan|['']den/gi, '')
    .trim()
  
  // Find matching Turkish city
  const matchedCity = TURKISH_CITIES.find(
    turkishCity => turkishCity.toLowerCase() === normalized.toLowerCase()
  )
  
  return matchedCity || normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
}

/**
 * Extract phone numbers from text
 */
function extractPhones(text: string): string[] {
  const phones: string[] = []
  
  PHONE_PATTERNS.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const phone = normalizePhone(match[0])
      if (phone && !phones.includes(phone)) {
        phones.push(phone)
      }
    }
  })
  
  return phones
}

/**
 * Extract names from text
 */
function extractNames(text: string): string[] {
  const names: string[] = []
  
  NAME_PATTERNS.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const name = normalizeName(match[1] || match[0])
      if (name && name.length > 2 && !names.includes(name)) {
        names.push(name)
      }
    }
  })
  
  return names
}

/**
 * Extract locations from text
 */
function extractLocations(text: string): string[] {
  const locations: string[] = []
  
  LOCATION_PATTERNS.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const location = normalizeCity(match[1] || match[0])
      if (location && !locations.includes(location)) {
        locations.push(location)
      }
    }
  })
  
  return locations
}

/**
 * Calculate confidence score based on extracted data
 */
function calculateConfidence(data: ParsedContact): number {
  let score = 0
  
  if (data.phone) score += 40
  if (data.name) score += 30
  if (data.city) score += 20
  if (data.region) score += 10
  
  return Math.min(score, 100)
}

/**
 * Main parsing function
 */
export function parseWhatsAppText(text: string): ParseResult {
  try {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Metin boş veya geçersiz'
      }
    }
    
    const cleanText = text.trim()
    
    // Extract information
    const phones = extractPhones(cleanText)
    const names = extractNames(cleanText)
    const locations = extractLocations(cleanText)
    
    // Build result
    const parsedData: ParsedContact = {
      raw: cleanText,
      phone: phones[0] || undefined,
      name: names[0] || undefined,
      city: locations[0] || undefined,
      region: locations[1] || undefined,
      confidence: 0
    }
    
    // Calculate confidence
    parsedData.confidence = calculateConfidence(parsedData)
    
    return {
      success: true,
      data: parsedData
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ayrıştırma hatası'
    }
  }
}

/**
 * Validate parsed contact data
 */
export function validateParsedContact(data: ParsedContact): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Phone validation
  if (data.phone) {
    const phoneRegex = /^\+90[0-9]{10}$/
    if (!phoneRegex.test(data.phone)) {
      errors.push('Telefon numarası geçersiz format')
    }
  }
  
  // Name validation
  if (data.name) {
    if (data.name.length < 2) {
      errors.push('İsim çok kısa')
    }
    if (!/^[a-zA-ZçğıöşüÇĞIÖŞÜ\s]+$/.test(data.name)) {
      errors.push('İsim geçersiz karakterler içeriyor')
    }
  }
  
  // City validation
  if (data.city) {
    if (data.city.length < 2) {
      errors.push('Şehir adı çok kısa')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format parsed contact for display
 */
export function formatParsedContact(data: ParsedContact): string {
  const parts: string[] = []
  
  if (data.name) parts.push(`İsim: ${data.name}`)
  if (data.phone) parts.push(`Telefon: ${data.phone}`)
  if (data.city) parts.push(`Şehir: ${data.city}`)
  if (data.region) parts.push(`Bölge: ${data.region}`)
  
  parts.push(`Güven: %${data.confidence}`)
  
  return parts.join('\n')
}