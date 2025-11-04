const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Simple test - try to get auth user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error && error.message !== 'Invalid JWT') {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('User:', user ? 'Authenticated' : 'Not authenticated (normal)')
    
    return true
    
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

testConnection()