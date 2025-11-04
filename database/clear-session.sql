-- Session'ları temizle

-- 1. Tüm kullanıcıları sil (temiz başlangıç)
DELETE FROM public.users;
DELETE FROM auth.users;

-- 2. Session'ları temizle
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;

-- 3. Kontrol et
SELECT 
  'All sessions and users cleared!' as message,
  (SELECT count(*) FROM auth.users) as auth_users,
  (SELECT count(*) FROM public.users) as public_users,
  (SELECT count(*) FROM auth.sessions) as sessions;

SELECT 'Now refresh browser with F5 and go to register page!' as next_step;