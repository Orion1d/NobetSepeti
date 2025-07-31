# Nöbet Sepeti

Türk internleri için nöbet takası platformu. İnternler nöbetlerini güvenle satabilir ve başka internlerin nöbetlerini kolayca satın alabilir.

## 🌟 Özellikler

- **Nöbet Satışı**: Çalışamayacağınız nöbetlerinizi diğer internlere satın
- **Nöbet Satın Alma**: Ekstra gelir için diğer internlerin nöbetlerini satın alın
- **Gerçek Zamanlı Mesajlaşma**: Alıcı ve satıcı arasında güvenli iletişim
- **Durum Takibi**: Nöbet durumlarını (müsait, beklemede, tamamlandı, iptal) takip edin
- **Zaman Sınırı**: Nöbet tarihinden 1 gün sonra mesajlaşma kapanır, ancak geçmiş mesajlar korunur
- **Mobil Uyumlu**: Tüm cihazlarda mükemmel deneyim

## 🚀 Teknolojiler

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Real-time)
- **Deployment**: Vercel (önerilen)

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nobet-sepeti.git
   cd nobet-sepeti
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Supabase projenizi oluşturun:**
   - [Supabase](https://supabase.com) hesabı oluşturun
   - Yeni proje oluşturun
   - API anahtarlarını alın

4. **Environment değişkenlerini ayarlayın:**
   ```bash
   # src/integrations/supabase/client.ts dosyasını güncelleyin
   const SUPABASE_URL = "YOUR_SUPABASE_URL";
   const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_ANON_KEY";
   ```

5. **Database şemasını oluşturun:**
   ```sql
   -- Profiles tablosu
   CREATE TABLE profiles (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     full_name TEXT,
     student_number TEXT,
     university TEXT,
     phone_number TEXT,
     language TEXT,
     role TEXT DEFAULT 'doctor',
     is_phone_verified BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Shifts tablosu
   CREATE TABLE shifts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     seller_id UUID REFERENCES auth.users(id),
     buyer_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     price DECIMAL NOT NULL,
     shift_date DATE NOT NULL,
     shift_time TIME,
     duration TEXT,
     location TEXT,
     status TEXT DEFAULT 'available',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Messages tablosu
   CREATE TABLE messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     sender_id UUID REFERENCES auth.users(id),
     receiver_id UUID REFERENCES auth.users(id),
     shift_id UUID REFERENCES shifts(id),
     content TEXT NOT NULL,
     read_at TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

6. **Uygulamayı başlatın:**
   ```bash
   npm run dev
   ```

7. **Tarayıcıda açın:**
   ```
   http://localhost:8080
   ```

## 🌐 Deployment

### Vercel (Önerilen)

1. **Vercel hesabı oluşturun:** [vercel.com](https://vercel.com)
2. **GitHub repository'nizi bağlayın**
3. **Environment değişkenlerini ayarlayın**
4. **Deploy edin**

### Domain Ayarları

Domain: `nobetsepeti.com`

1. **DNS ayarlarını yapın:**
   - A record: `@` → Vercel IP
   - CNAME record: `www` → `nobetsepeti.vercel.app`

2. **Vercel'de domain'i bağlayın:**
   - Vercel Dashboard → Settings → Domains
   - `nobetsepeti.com` ekleyin

## 📱 Kullanım

### İntern Kaydı
1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. E-mail ve şifre ile hesap oluşturun
3. Profil bilgilerinizi doldurun

### Nöbet Satışı
1. Dashboard → "Nöbetimi Satmak İstiyorum"
2. Nöbet detaylarını girin
3. Fiyat belirleyin ve yayınlayın

### Nöbet Satın Alma
1. Dashboard → "Nöbet Satın Almak İstiyorum"
2. Mevcut nöbetleri görüntüleyin
3. İstediğiniz nöbeti satın alın

### Mesajlaşma
1. Profile → "Mesajlarım"
2. Konuşma seçin
3. Mesaj gönderin (nöbet tarihinden 1 gün sonrasına kadar)

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
2. Geliştirin ve test edin
3. Commit yapın: `git commit -m "feat: yeni özellik eklendi"`
4. Pull request oluşturun

### Test
```bash
# Linting
npm run lint

# Build test
npm run build
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Website**: [nobetsepeti.com](https://nobetsepeti.com)
- **Email**: info@nobetsepeti.com
- **Telegram**: [Telegram Grubu](https://t.me/nobetsepeti)

## 🚀 Roadmap

- [ ] Ödeme sistemi entegrasyonu
- [ ] Push bildirimleri
- [ ] Mobil uygulama
- [ ] Admin paneli
- [ ] Raporlama sistemi
- [ ] API dokümantasyonu

---

**Nöbet Sepeti** - İnternler için güvenli nöbet takası platformu 🏥
