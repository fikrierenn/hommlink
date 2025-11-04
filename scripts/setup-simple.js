const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('🚀 Setting up HommLink CRM database...')
    
    // 1. Create status_definitions table first (no dependencies)
    console.log('🔄 Creating status_definitions table...')
    
    // Insert initial status definitions using direct insert
    const statusDefinitions = [
      { code: 'NEW', label: 'Yeni', color: '#D1FAE5', order_index: 10 },
      { code: 'TO_CALL', label: 'Aranacak', color: '#E0E7FF', order_index: 20 },
      { code: 'WA_SENT', label: 'Cevap Bekleniyor (WA)', color: '#FEF3C7', order_index: 40 },
      { code: 'APPT_SET', label: 'Randevu Verildi', color: '#FDE68A', order_index: 50 },
      { code: 'APPT_CONFIRMED', label: 'Randevu Onaylandı', color: '#FCD34D', order_index: 55 },
      { code: 'FOLLOW_UP', label: 'Takipte', color: '#DBEAFE', order_index: 60 },
      { code: 'QUALIFIED', label: 'Nitelikli', color: '#A7F3D0', order_index: 70 },
      { code: 'CLOSED', label: 'Kapanmış', color: '#E5E7EB', order_index: 90 }
    ]
    
    // Check if status_definitions table exists and has data
    const { data: existingStatuses, error: statusError } = await supabase
      .from('status_definitions')
      .select('code')
    
    if (statusError) {
      console.log('ℹ️ status_definitions table might not exist yet, will be created by Supabase')
    } else if (!existingStatuses || existingStatuses.length === 0) {
      console.log('📝 Inserting status definitions...')
      const { error: insertError } = await supabase
        .from('status_definitions')
        .insert(statusDefinitions)
      
      if (insertError) {
        console.error('❌ Failed to insert status definitions:', insertError.message)
      } else {
        console.log('✅ Status definitions inserted!')
      }
    } else {
      console.log('ℹ️ Status definitions already exist')
    }
    
    // 2. Create WhatsApp templates
    console.log('🔄 Setting up WhatsApp templates...')
    
    const templates = [
      {
        code: 'FIRST_CONTACT',
        name: 'İlk İletişim',
        message: 'Merhaba {name}, Homm Bitkisel temsilciliği hakkında bilgi almak istediğinizi öğrendim. Size detaylı bilgi verebilirim. Uygun olduğunuz bir zaman var mı?',
        variables: ['name']
      },
      {
        code: 'APPOINTMENT_REMINDER',
        name: 'Randevu Hatırlatması',
        message: 'Merhaba {name}, yarın saat {time} randevumuz var. Görüşmemizi dört gözle bekliyorum. Herhangi bir değişiklik olursa lütfen bana bildirin.',
        variables: ['name', 'time']
      },
      {
        code: 'FOLLOW_UP',
        name: 'Takip Mesajı',
        message: 'Merhaba {name}, geçen görüşmemizden sonra düşündünüz mü? Sorularınız varsa çekinmeden sorabilirsiniz.',
        variables: ['name']
      }
    ]
    
    const { data: existingTemplates, error: templatesError } = await supabase
      .from('whatsapp_templates')
      .select('code')
    
    if (templatesError) {
      console.log('ℹ️ whatsapp_templates table might not exist yet')
    } else if (!existingTemplates || existingTemplates.length === 0) {
      console.log('📝 Inserting WhatsApp templates...')
      const { error: insertTemplatesError } = await supabase
        .from('whatsapp_templates')
        .insert(templates)
      
      if (insertTemplatesError) {
        console.error('❌ Failed to insert templates:', insertTemplatesError.message)
      } else {
        console.log('✅ WhatsApp templates inserted!')
      }
    } else {
      console.log('ℹ️ WhatsApp templates already exist')
    }
    
    // 3. Test basic functionality
    console.log('🔍 Testing basic functionality...')
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError && authError.message !== 'Invalid JWT') {
      console.log('❌ Auth test failed:', authError.message)
    } else {
      console.log('✅ Auth system working')
    }
    
    console.log('🎉 Basic setup completed!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Go to Supabase Dashboard: https://pccbipmevbuxctjzsvxf.supabase.co')
    console.log('2. Go to SQL Editor')
    console.log('3. Run the schema.sql file to create all tables')
    console.log('4. Test the application at http://localhost:3000')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()