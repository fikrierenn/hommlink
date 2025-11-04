-- Temiz başlangıç scripti
-- Mevcut kullanıcıyı sil ve yeniden oluştur

-- 1. Public.users tablosundan sil
DELETE FROM public.users 
WHERE auth_uid IN (
  SELECT id FROM auth.users WHERE email = 'fikrieren@gmail.com'
);

-- 2. Auth.users tablosundan sil
DELETE FROM auth.users WHERE email = 'fikrieren@gmail.com';

-- 3. Kontrol et - temizlenmiş mi?
SELECT 'Kullanıcı temizlendi!' as message,
       (SELECT COUNT(*) FROM auth.users WHERE email = 'fikrieren@gmail.com') as auth_count,
       (SELECT COUNT(*) FROM public.users WHERE full_name LIKE '%Fikri%') as public_count;

-- 4. Email doğrulama ayarını kontrol et
-- Bu sorgu Supabase ayarlarını gösterir
SELECT 
  'Email doğrulama ayarları kontrol edilsin' as message,
  'Supabase Dashboard > Authentication > Settings > Enable email confirmations = OFF' as tavsiye;