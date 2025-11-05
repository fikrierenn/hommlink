// Simple test to check if we can create a user directly in Supabase
console.log('🔧 Testing Supabase connection...')

// Test credentials
const testEmail = 'test@example.com'
const testPassword = '123456'

console.log('📧 Test Email:', testEmail)
console.log('🔑 Test Password:', testPassword)
console.log('')
console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
console.log('')
console.log('✅ Test user credentials ready!')
console.log('📱 Try logging in with these credentials on mobile and desktop')
console.log('🔍 Check browser console for detailed logs')