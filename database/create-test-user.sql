-- Test kullanıcısı oluşturma scripti
-- fikrieren@gmail.com için

-- NOT: Bu script Supabase Authentication ile kullanıcı oluşturmaz
-- Sadece public.users tablosuna test profili ekler
-- Gerçek kullanıcı kaydı için register sayfasını kullanın

-- Test kullanıcı ID'si
DO $$
DECLARE
    test_user_id uuid := 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
BEGIN
    -- Public users tablosuna test profili ekle
    INSERT INTO public.users (
        id,
        auth_uid,
        full_name,
        role,
        created_at
    ) VALUES (
        test_user_id,
        test_user_id,
        'Fikri Eren',
        'agent',
        now()
    );
    
    RAISE NOTICE 'Test kullanıcı profili oluşturuldu: %', test_user_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Test kullanıcı zaten mevcut';
END $$;

-- 3. Test için birkaç örnek lead ekle
INSERT INTO public.leads (
  id,
  name,
  phone,
  region,
  city,
  status_id,
  notes,
  source,
  owner_uid,
  created_at
) VALUES 
  (
    gen_random_uuid(),
    'Ahmet Yılmaz',
    '05321234567',
    'Marmara',
    'İstanbul',
    (SELECT id FROM public.status_definitions WHERE code = 'NEW' LIMIT 1),
    'WhatsApp''tan geldi, temsilcilik hakkında bilgi almak istiyor',
    'whatsapp',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '2 hours'
  ),
  (
    gen_random_uuid(),
    'Fatma Demir',
    '05339876543',
    'Ege',
    'İzmir',
    (SELECT id FROM public.status_definitions WHERE code = 'TO_CALL' LIMIT 1),
    'Ürünler hakkında detaylı bilgi istedi',
    'whatsapp',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    'Mehmet Kaya',
    '05445556677',
    'İç Anadolu',
    'Ankara',
    (SELECT id FROM public.status_definitions WHERE code = 'WA_SENT' LIMIT 1),
    'İlk mesaj gönderildi, cevap bekleniyor',
    'whatsapp',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '3 hours'
  ),
  (
    gen_random_uuid(),
    'Ayşe Özkan',
    '05556667788',
    'Akdeniz',
    'Antalya',
    (SELECT id FROM public.status_definitions WHERE code = 'APPT_SET' LIMIT 1),
    'Yarın saat 14:00 için randevu verildi',
    'whatsapp',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '6 hours'
  ),
  (
    gen_random_uuid(),
    'Can Arslan',
    '05667778899',
    'Karadeniz',
    'Trabzon',
    (SELECT id FROM public.status_definitions WHERE code = 'QUALIFIED' LIMIT 1),
    'Çok ilgili, başlamaya hazır',
    'whatsapp',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '2 days'
  );

-- 4. Test lead events ekle
INSERT INTO public.lead_events (
  lead_id,
  event_type,
  disposition,
  note,
  created_by,
  created_at
) VALUES 
  (
    (SELECT id FROM public.leads WHERE name = 'Ahmet Yılmaz' LIMIT 1),
    'whatsapp',
    'sent',
    'İlk tanışma mesajı gönderildi',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '2 hours'
  ),
  (
    (SELECT id FROM public.leads WHERE name = 'Fatma Demir' LIMIT 1),
    'call',
    'no_answer',
    'Aradım ama cevap vermedi',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '1 day'
  ),
  (
    (SELECT id FROM public.leads WHERE name = 'Mehmet Kaya' LIMIT 1),
    'whatsapp',
    'sent',
    'Takip mesajı gönderildi',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '3 hours'
  ),
  (
    (SELECT id FROM public.leads WHERE name = 'Ayşe Özkan' LIMIT 1),
    'call',
    'answered',
    'Görüştük, randevu verdik',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    now() - interval '6 hours'
  );

-- Başarı mesajı
SELECT 'Test kullanıcısı ve örnek veriler başarıyla oluşturuldu!' as message;