-- Örnek veriler ekleme scripti
-- Bu script sadece test verileri ekler, kullanıcı kaydı için register sayfasını kullanın

-- Örnek leads ekleme (owner_uid'yi gerçek kullanıcı ID'si ile değiştirin)
-- Bu veriler register olduktan sonra kullanıcı ID'si ile güncellenecek

-- Geçici test verileri (herhangi bir kullanıcı için)
INSERT INTO public.leads (
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
    'Ahmet Yılmaz',
    '05321234567',
    'Marmara',
    'İstanbul',
    (SELECT id FROM public.status_definitions WHERE code = 'NEW' LIMIT 1),
    'WhatsApp''tan geldi, temsilcilik hakkında bilgi almak istiyor',
    'whatsapp',
    NULL, -- Bu register olduktan sonra güncellenecek
    now() - interval '2 hours'
  ),
  (
    'Fatma Demir',
    '05339876543',
    'Ege',
    'İzmir',
    (SELECT id FROM public.status_definitions WHERE code = 'TO_CALL' LIMIT 1),
    'Ürünler hakkında detaylı bilgi istedi',
    'whatsapp',
    NULL,
    now() - interval '1 day'
  ),
  (
    'Mehmet Kaya',
    '05445556677',
    'İç Anadolu',
    'Ankara',
    (SELECT id FROM public.status_definitions WHERE code = 'WA_SENT' LIMIT 1),
    'İlk mesaj gönderildi, cevap bekleniyor',
    'whatsapp',
    NULL,
    now() - interval '3 hours'
  ),
  (
    'Ayşe Özkan',
    '05556667788',
    'Akdeniz',
    'Antalya',
    (SELECT id FROM public.status_definitions WHERE code = 'APPT_SET' LIMIT 1),
    'Yarın saat 14:00 için randevu verildi',
    'whatsapp',
    NULL,
    now() - interval '6 hours'
  ),
  (
    'Can Arslan',
    '05667778899',
    'Karadeniz',
    'Trabzon',
    (SELECT id FROM public.status_definitions WHERE code = 'QUALIFIED' LIMIT 1),
    'Çok ilgili, başlamaya hazır',
    'whatsapp',
    NULL,
    now() - interval '2 days'
  );

-- Başarı mesajı
SELECT 'Örnek lead verileri eklendi! Register olduktan sonra bu veriler size atanacak.' as message;