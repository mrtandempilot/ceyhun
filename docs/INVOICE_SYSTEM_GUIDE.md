# Fatura Sistemi Kullanım Kılavuzu

## 📋 Genel Bakış

Profesyonel yamaç paraşütü fatura sistemi artık hazır! Bu sistem:
- ✅ PDF fatura oluşturma (Türkçe & İngilizce)
- ✅ QR kod ile ödeme linki
- ✅ Dijital müşteri imzası
- ✅ Pilot bilgisi, uçuş saati, tur tipi
- ✅ Otomatik KDV hesaplama (%20 Türkiye için)
- ✅ Fatura numarası otomatik oluşturma

## 🚀 Kurulum Adımları

### 1. Veritabanını Güncelle

Supabase SQL Editor'de şu dosyayı çalıştırın:
```sql
-- Dosya: UPDATE_INVOICES_TABLE.sql
```

Bu SQL script'i şunları yapar:
- `invoices` tablosuna paragliding alanları ekler
- Pilot ID, uçuş tarihi/saati, süre, tur tipi
- QR kod data, müşteri imzası
- Dil seçimi (Türkçe/İngilizce)

### 2. NPM Paketleri Kuruldu ✅

Aşağıdaki paketler zaten kuruldu:
- `@react-pdf/renderer` - PDF oluşturma
- `qrcode` - QR kod üretme
- `react-signature-canvas` - Dijital imza
- `@types/qrcode` - TypeScript types
- `@types/react-signature-canvas` - TypeScript types

## 📝 Nasıl Kullanılır?

### Fatura Oluşturma

1. **Dashboard'a Git**: `/dashboard/accounting/invoices`

2. **"+ New Invoice" Butonuna Tıkla**

3. **Müşteri Bilgilerini Gir**:
   - İsim *
   - E-posta *
   - Adres (opsiyonel)

4. **Uçuş Detaylarını Gir**:
   - Pilot seç (dropdown) *
   - Tur tipi: Solo / Tandem / VIP *
   - Uçuş tarihi *
   - Uçuş saati *
   - Süre (dakika) *
   - Ödeme yöntemi: Nakit / Kredi Kartı / Online *

5. **Fiyatlandırma**:
   - Ara toplam (USD) gir *
   - KDV oranı (varsayılan %20)
   - Dil seç: English / Türkçe
   - Otomatik hesaplar: KDV + Toplam

6. **Notlar Ekle** (opsiyonel):
   - Ekstra bilgi, şartlar, vb.

7. **Müşteri İmzası** (opsiyonel):
   - Canvas'ta parmakla veya mouse ile imza
   - "Save Signature" tıkla

8. **"Create Invoice & Download PDF"** Tıkla

### Fatura İndirme

- Fatura listesinde her fatura için "Download PDF" butonu var
- PDF otomatik olarak indirilir: `Invoice-INV-202501-0001.pdf`

## 🎨 Fatura Özellikleri

### PDF İçeriği

**Üst Bölüm**:
- Şirket logosu (opsiyonel)
- Şirket bilgileri
- FATURA / INVOICE başlığı
- Fatura numarası

**Müşteri Bilgileri**:
- Ad Soyad
- E-posta
- Adres
- Düzenleme tarihi
- Vade tarihi

**Uçuş Detayları**:
- Pilot adı
- Uçuş tarihi
- Uçuş saati
- Tur tipi (Solo/Tandem/VIP)
- Uçuş süresi
- Ödeme yöntemi

**Tutar Bilgileri**:
- Ara toplam
- KDV (%20)
- **TOPLAM**

**Alt Bölüm**:
- Müşteri imzası (varsa)
- QR kod (ödeme linki için)
- Şirket footer

### Dil Desteği

**İngilizce (en)**:
- Invoice, Issue Date, Due Date, vb.
- "Thank you for your business!"

**Türkçe (tr)**:
- Fatura, Düzenleme Tarihi, Vade Tarihi, vb.
- "İşbirliğiniz için teşekkür ederiz!"

## 🔧 Teknik Detaylar

### API Endpoints

**GET** `/api/invoices`
- Tüm faturaları getir
- Query params: `?status=paid` veya `?customer_id=xxx`

**POST** `/api/invoices`
- Yeni fatura oluştur
- Otomatik: Fatura numarası, KDV hesaplama, QR kod

**PUT** `/api/invoices`
- Fatura güncelle

**DELETE** `/api/invoices?id=xxx`
- Fatura sil

### Dosya Yapısı

```
app/
├── api/
│   └── invoices/
│       └── route.ts          # Invoice API
├── dashboard/
│   └── accounting/
│       └── invoices/
│           └── page.tsx      # Invoice UI
components/
├── InvoicePDF.tsx           # PDF template
└── SignatureCanvas.tsx      # Dijital imza
lib/
└── invoice-utils.ts         # QR kod, format fonksiyonları
types/
└── accounting.ts            # TypeScript types
```

### Fatura Numarası Formatı

Format: `INV-YYYYMM-XXXX`

Örnek:
- `INV-202501-0001` - Ocak 2025, 1. fatura
- `INV-202501-0002` - Ocak 2025, 2. fatura
- `INV-202502-0001` - Şubat 2025, 1. fatura

### QR Kod İçeriği

QR kod ödeme linki içerir:
```
https://yourdomain.com/payment?invoice=INV-202501-0001&amount=150.00&currency=USD
```

## 🎯 Özelleştirme

### Şirket Bilgilerini Değiştir

`components/InvoicePDF.tsx` dosyasında:
```typescript
companyName = 'Sky Walkers Paragliding'
companyAddress = 'Ölüdeniz, Fethiye, Turkey'
companyPhone = '+90 XXX XXX XX XX'
companyEmail = 'info@skywalkers.com'
```

### Ödeme Gateway URL'i

`lib/invoice-utils.ts` dosyasında:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
```

`.env.local` dosyasına ekle:
```
NEXT_PUBLIC_APP_URL=https://yourwebsite.com
```

### Şirket Logosu Ekle

Logo'yu `public/logo.png` olarak kaydet, sonra:
```typescript
company_logo_url: '/logo.png'
```

veya base64 olarak database'e kaydet.

## 📊 Fatura Durumları

- `draft` - Taslak
- `sent` - Gönderildi
- `paid` - Ödendi ✅
- `overdue` - Gecikmiş ⚠️
- `cancelled` - İptal

## 🔐 Güvenlik

- Sadece admin (mrtandempilot@gmail.com) erişebilir
- RLS (Row Level Security) aktif
- Service role key ile güvenli API

## 💡 İpuçları

1. **Pilot Listesi Boşsa**: Önce `/dashboard/pilots` sayfasından pilot ekle

2. **PDF Download Çalışmıyorsa**: Browser'ın popup blocker'ını kontrol et

3. **İmza Kayboluyorsa**: "Save Signature" butonuna basmayı unutma

4. **Türkçe Karakterler**: PDF Helvetica font kullanır, Türkçe karakterler desteklenir

5. **QR Kod Test**: QR kodu telefonla tara, ödeme sayfasına gider

## 🐛 Sorun Giderme

**Problem**: PDF oluşturulmuyor
**Çözüm**: Browser console'u kontrol et, error varsa bana bildir

**Problem**: Pilot listesi gelmiyor
**Çözüm**: `/api/pilots` endpoint'inin çalıştığından emin ol

**Problem**: İmza görünmüyor
**Çözüm**: Base64 image data doğru kaydedildiğinden emin ol

## 📮 Sonraki Adımlar

İsteğe bağlı eklenebilecek özellikler:
- [ ] E-posta ile fatura gönderme
- [ ] Ödeme entegrasyonu (Stripe, PayPal)
- [ ] Fatura şablonları
- [ ] Toplu fatura oluşturma
- [ ] Excel export
- [ ] Fatura istatistikleri

## 🤖 Otomatik Fatura Oluşturma

### Yöntem 1: Booking Tamamlandığında Otomatik

Bir booking'in durumu **"completed"** olarak değiştirildiğinde:
1. Sistem otomatik olarak fatura oluşturur
2. Booking bilgilerinden fatura detayları çıkarılır:
   - Müşteri adı ve e-posta
   - Uçuş tarihi ve saati
   - Tur tipi (Solo/Tandem/VIP)
   - Tutar bilgileri
3. QR kod otomatik oluşturulur
4. Fatura numarası otomatik atanır

**Nasıl Çalışır:**
- `/dashboard/bookings` sayfasında
- Status dropdown'dan "Completed" seç
- ✅ Fatura otomatik oluşturulur!

### Yöntem 2: Manuel Fatura Oluşturma

**Bookings Sayfasından:**
- `/dashboard/bookings` sayfasında her booking için
- "**+ Invoice**" butonuna tıkla
- Fatura anında oluşturulur
- "✓ INV-202501-0001" fatura numarası gösterilir

**Invoice Sayfasından:**
- `/dashboard/accounting/invoices` sayfasında
- "+ New Invoice" butonundan
- Manuel form doldurarak oluştur

## ✅ Tamamlandı!

Fatura sistemin hazır. Artık:
1. Supabase'de SQL'i çalıştır (`UPDATE_INVOICES_TABLE.sql`)
2. `/dashboard/accounting/invoices` sayfasına git
3. Faturanı oluştur (manuel veya otomatik)!

**Otomatik Fatura:** Booking'i "completed" yap, fatura otomatik oluşur! 🎉

Başarılar! ✨
