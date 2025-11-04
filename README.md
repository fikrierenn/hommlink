# 🌿 HommLink CRM

Modern, mobil-öncelikli CRM sistemi. Homm Bitkisel için özel olarak geliştirilmiş lead yönetimi ve WhatsApp entegrasyonu.

## ✨ Özellikler

### 📱 Lead Yönetimi
- **Aday Oluşturma & Düzenleme** - Hızlı form ile yeni adaylar ekleyin
- **Detaylı Aday Görünümü** - Tüm bilgiler ve aktivite geçmişi
- **Akıllı Filtreleme** - Bölge, şehir, durum bazlı filtreleme
- **Arama Sistemi** - İsim, telefon, notlarda arama

### 💬 WhatsApp Entegrasyonu
- **Tek Tık WhatsApp** - Direkt WhatsApp'ta mesaj gönderme
- **Mesaj Şablonları** - Hazır mesaj şablonları
- **Emoji Desteği** - Emojili mesajlar
- **Telefon Normalizasyonu** - Otomatik +90 formatı

### 🔐 Güvenlik & Kimlik Doğrulama
- **Supabase Auth** - Güvenli kimlik doğrulama
- **Row Level Security** - Veri güvenliği
- **Kullanıcı Profilleri** - Kişiselleştirilmiş deneyim

### 📊 Durum Takibi
- **Dinamik Durumlar** - Yeni, Aranacak, WhatsApp Gönderildi, vb.
- **Aktivite Geçmişi** - Tüm etkileşimler kayıt altında
- **Randevu Yönetimi** - Randevu planlama ve takip

## 🚀 Teknolojiler

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, Responsive Design
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Mobile:** PWA Ready, Touch Optimized
- **Deployment:** Netlify Ready

## 📱 Mobil Deneyim

- **Responsive Design** - Tüm cihazlarda mükemmel görünüm
- **Touch Optimized** - Dokunmatik ekranlar için optimize
- **PWA Support** - Ana ekrana ekleme desteği
- **Offline Ready** - Temel işlevler çevrimdışı çalışır

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/fikrierenn/hommlink.git
cd hommlink

# Bağımlılıkları yükleyin
npm install

# Environment dosyasını oluşturun
cp .env.example .env.local

# Geliştirme sunucusunu başlatın
npm run dev
```

### Environment Değişkenleri

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_NAME=HommLink CRM
NEXT_PUBLIC_COMPANY_NAME=Homm Bitkisel
```

## 📋 Veritabanı Kurulumu

```bash
# Veritabanı şemasını oluşturun
npm run setup:db

# Test verilerini yükleyin (opsiyonel)
npm run seed:db
```

## 🎯 Kullanım

### Yeni Aday Ekleme
1. "Yeni Aday" butonuna tıklayın
2. Gerekli bilgileri doldurun
3. Telefon numarası otomatik normalize edilir
4. Kaydet butonuna tıklayın

### WhatsApp Mesajı Gönderme
1. Aday kartından WhatsApp butonuna tıklayın
2. Mesaj şablonu seçin veya özel mesaj yazın
3. "WhatsApp'ta Aç" butonuna tıklayın
4. Mesaj otomatik olarak WhatsApp'ta açılır

### Filtreleme ve Arama
- Üst kısımdaki arama çubuğunu kullanın
- Filtre butonundan gelişmiş filtreleme yapın
- Sonuçlar gerçek zamanlı güncellenir

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── app/                 # Next.js App Router
├── components/          # React bileşenleri
│   ├── leads/          # Lead yönetimi bileşenleri
│   ├── layout/         # Layout bileşenleri
│   └── ui/             # Temel UI bileşenleri
├── hooks/              # Custom React hooks
├── lib/                # Utility fonksiyonları
├── services/           # API servisleri
└── types/              # TypeScript tip tanımları
```

### Önemli Dosyalar
- `src/lib/database.ts` - Supabase veritabanı işlemleri
- `src/services/leadService.ts` - Lead yönetimi servisleri
- `src/components/leads/WhatsAppModal.tsx` - WhatsApp entegrasyonu
- `src/lib/utils.ts` - Telefon normalizasyonu ve yardımcı fonksiyonlar

### Komutlar
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run start        # Production sunucu
npm run lint         # ESLint kontrolü
npm run type-check   # TypeScript kontrolü
```

## 🚀 Deployment

### Netlify
1. GitHub repository'sini Netlify'a bağlayın
2. Build komutunu `npm run build` olarak ayarlayın
3. Publish directory'sini `.next` olarak ayarlayın
4. Environment değişkenlerini ekleyin
5. Deploy edin!

### Vercel (Alternatif)
```bash
npm install -g vercel
vercel --prod
```

## 📞 WhatsApp Entegrasyonu Detayları

### Telefon Numarası Formatları
- `0555 123 45 67` → `+905551234567`
- `555 123 45 67` → `+905551234567`
- `5551234567` → `+905551234567`
- `+90 555 123 45 67` → `+905551234567`

### Mesaj Şablonları
- İlk İletişim
- Randevu Hatırlatması
- Takip Mesajı
- Özel mesaj yazma

## 🎨 UI/UX Özellikleri

- **Modern Tasarım** - Clean ve profesyonel görünüm
- **Türkçe Arayüz** - Tam Türkçe dil desteği
- **Koyu/Açık Tema** - Kullanıcı tercihi
- **Animasyonlar** - Smooth geçişler ve etkileşimler
- **Accessibility** - Erişilebilirlik standartları

## 🔒 Güvenlik

- **RLS (Row Level Security)** - Veritabanı seviyesinde güvenlik
- **JWT Authentication** - Güvenli token tabanlı kimlik doğrulama
- **HTTPS Only** - Tüm iletişim şifreli
- **Input Validation** - Tüm girişler doğrulanır

## 📈 Performans

- **Server-Side Rendering** - Hızlı ilk yükleme
- **Code Splitting** - Optimized bundle boyutu
- **Image Optimization** - Otomatik görsel optimizasyonu
- **Caching** - Akıllı önbellekleme stratejisi

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Fikri Eren**
- GitHub: [@fikrierenn](https://github.com/fikrierenn)
- Email: fikrieren@gmail.com

## 🙏 Teşekkürler

- [Supabase](https://supabase.com) - Backend altyapısı
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide Icons](https://lucide.dev) - İkonlar

---

**HommLink CRM** ile lead yönetiminizi bir üst seviyeye taşıyın! 🚀