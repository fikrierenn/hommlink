const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: 'HommLink/hommlink-crm-web/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Debug Lead Creation')
console.log('URL:', supabaseUrl)
console.log('Service Key exists:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugLeadCreation() {
  try {
    // 1. Check if tables exist
    console.log('\n📋 Checking tables...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError)
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name))
    }
    
    // 2. Check leads table structure
    console.log('\n🏗️ Checking leads table structure...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'leads')
    
    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError)
    } else {
      console.log('✅ Leads table columns:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
    // 3. Check status definitions
    console.log('\n📊 Checking status definitions...')
    
    const { data: statuses, error: statusError } = await supabase
      .from('status_definitions')
      .select('*')
    
    if (statusError) {
      console.error('❌ Error checking statuses:', statusError)
    } else {
      console.log('✅ Status definitions:', statuses.length, 'found')
      statuses.forEach(s => console.log(`  - ${s.code}: ${s.label} (${s.id})`))
    }
    
    // 4. Try to create a test lead
    console.log('\n🧪 Testing lead creation...')
    
    const testLead = {
      name: 'Test User',
      phone: '05551234567',
      source: 'test',
      region: 'Test Region',
      city: 'Test City',
      owner_uid: '0691285a-7d26-44b7-9016-517ce3d8f8cf', // Your user ID from logs
      call_count: 0
    }
    
    console.log('Test lead data:', testLead)
    
    const { data: newLead, error: createError } = await supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Lead creation error:', createError)
      console.error('Error details:', JSON.stringify(createError, null, 2))
    } else {
      console.log('✅ Lead created successfully:', newLead)
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugLeadCreation()