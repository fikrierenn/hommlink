-- Şifre hash'ini düzelt
-- Manuel oluşturulan kullanıcının şifresini Supabase formatına çevir

-- 1. Mevcut şifreyi kontrol et
SELECT 
  email,
  encrypted_password,
  length(encrypted_password) as password_length,
  email_confirmed_at
FROM auth.users 
WHERE email = 'fikrieren@gmail.com';

-- 2. Şifreyi Supabase formatında güncelle
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$' || encode(digest('fe9610578+*' || auth.uid()::text, 'sha256'), 'hex'),
  updated_at = now()
WHERE email = 'fikrieren@gmail.com';

-- 3. Alternatif şifre hash (bcrypt)
UPDATE auth.users 
SET 
  encrypted_password = crypt('fe9610578+*', gen_salt('bf', 10)),
  updated_at = now()
WHERE email = 'fikrieren@gmail.com';

-- 4. Kullanıcıyı yeniden aktifleştir
UPDATE auth.users 
SET 
  email_confirmed_at = now(),
  confirmation_token = '',
  recovery_token = '',
  updated_at = now()
WHERE email = 'fikrieren@gmail.com';

-- 5. Kontrol et
SELECT 
  'Şifre güncellendi!' as message,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'fikrieren@gmail.com';