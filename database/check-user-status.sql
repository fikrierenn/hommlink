-- Kullanıcı durumunu kontrol et
-- fikrieren@gmail.com için

-- 1. Auth tablosundaki durumu kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'full_name' as full_name,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Email doğrulanmamış'
    ELSE 'Email doğrulanmış'
  END as email_status
FROM auth.users 
WHERE email = 'fikrieren@gmail.com';

-- 2. Public users tablosundaki durumu kontrol et
SELECT 
  u.id,
  u.auth_uid,
  u.full_name,
  u.role,
  u.created_at,
  au.email
FROM public.users u
LEFT JOIN auth.users au ON u.auth_uid = au.id
WHERE au.email = 'fikrieren@gmail.com' OR u.full_name LIKE '%Fikri%';

-- 3. Eğer email doğrulanmamışsa, manuel olarak doğrula
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'fikrieren@gmail.com' 
  AND email_confirmed_at IS NULL;

-- 4. Sonucu kontrol et
SELECT 
  'Email doğrulaması tamamlandı!' as message,
  email,
  email_confirmed_at
FROM auth.users 
WHERE email = 'fikrieren@gmail.com';