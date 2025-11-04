-- Son temizlik ve test

-- 1. Mevcut test kullanıcısını tamamen sil
DELETE FROM public.users WHERE full_name = 'Fikri Eren' OR auth_uid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
DELETE FROM auth.users WHERE email = 'fikrieren@gmail.com' OR id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 2. Temizlik kontrolü
SELECT 
  'Temizlik tamamlandı!' as message,
  (SELECT count(*) FROM auth.users WHERE email = 'fikrieren@gmail.com') as auth_count,
  (SELECT count(*) FROM public.users WHERE full_name = 'Fikri Eren') as public_count;

-- 3. Trigger test sonucunu göster (önceki çalıştırmadan)
SELECT 'Artık register sayfasından normal kayıt olabilirsiniz!' as next_step;