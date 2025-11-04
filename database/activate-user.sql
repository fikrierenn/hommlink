-- Kullanıcıyı manuel olarak aktifleştirme scripti
-- Email doğrulama linkine gerek kalmadan kullanıcıyı aktif hale getirir

-- 1. Auth.users tablosundaki kullanıcıyı aktifleştir
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'fikrieren@gmail.com';

-- 2. Kullanıcının durumunu kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Aktif'
    ELSE 'Beklemede'
  END as durum
FROM auth.users 
WHERE email = 'fikrieren@gmail.com';

-- 3. Public.users tablosundaki profili kontrol et
SELECT 
  u.id,
  u.auth_uid,
  u.full_name,
  u.role,
  au.email,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN 'Email Doğrulandı'
    ELSE 'Email Doğrulanmadı'
  END as email_durumu
FROM public.users u
JOIN auth.users au ON u.auth_uid = au.id
WHERE au.email = 'fikrieren@gmail.com';

-- Başarı mesajı
SELECT 'Kullanıcı manuel olarak aktifleştirildi! Artık login olabilirsiniz.' as message;