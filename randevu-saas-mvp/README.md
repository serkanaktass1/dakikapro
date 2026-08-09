# RandevuPro — Çok Kiracılı SaaS Randevu MVP'si

Çalışan, sıfır bağımlılıklı demo/MVP. Her işletmenin kendine özgü URL'si, 30 günlük deneme dönemi, paket yönetimi, Super Admin görünümü, işletme paneli ve herkese açık rezervasyon sayfası vardır.

## Çalıştırma

Windows'ta `start.cmd` dosyasına çift tıklayın. Ardından `http://localhost:4180` adresini tarayıcıda açın. Bu ayrı adres, daha önce açık kalmış olabilecek eski geliştirme sürümünün yeni girişleri engellemesini önler.

Alternatif olarak Node.js 20+ ile proje klasöründe `node server.js` çalıştırın.

## Girişler ve deneme akışı

- **Ana sayfa:** işletme sahibi paketleri çalışan sayısına ve ihtiyacına göre karşılaştırır; “Ücretsiz dene” ile kendi hesabını açar.
- **İşletme paneli:** `#login` üzerinden e-posta/şifre ile girilir. Kendi çalışanlarını, hizmetlerini, müşterilerini, randevularını ve seçtiği paketi görür.
- **Yönetim paneli:** ana sayfa altındaki küçük **Yönetim** bağlantısından parola ile girilir. İşletmeler, paketler ve platform ayarları yalnızca burada görünür.
- **Müşteri:** `/#book/makas-berber` gibi benzersiz işletme URL'sinden randevu oluşturur.
- **Müşteri randevuları:** aynı işletmede `/#mine/makas-berber` bağlantısından telefon numarasıyla görüntülenir; iptal veya tarih/saat değişikliği yapılabilir.
- Yeni işletme otomatik olarak **30 gün deneme** ile açılır. Süre, Super Admin ayarlarından güncellenebilir.

Demo hesapları:

- İşletme: `owner@makasberber.com` / `demo123`
- Yönetim: `admin@randevupro.local` / `admin123`

> Bu şifreler yalnızca yerel MVP demosu içindir. Canlıya geçmeden önce sunucu tarafı oturum doğrulaması, güvenli parola saklama, HTTPS, rol denetimleri ve iyzico/Stripe gibi gerçek bir ödeme sağlayıcısı eklenmelidir.

## Kalıcı veri

İlk çalıştırmada `data/database.json` oluşur. Tüm değişiklikler burada tutulur. Üretim sürümünde bu API katmanı PostgreSQL/Supabase ile değiştirilebilir; istemci tarafı aynı REST sözleşmesini kullanır.

## MVP kapsamı

- Multi-tenant veri ayrımı (`tenantId`)
- Benzersiz işletme slug/URL'si
- Aylık ve yıllık paket seçimi; yıllık ödeme için iki aylık avantajlı fiyat
- Paket içeriklerinin ve paket seçiminin işletme sahibine gösterilmesi
- Deneme/aktif/pasif işletme durumları
- Ayrı işletme ve parola korumalı yönetim panelleri
- Çalışan, hizmet, müşteri ve randevu CRUD işlemleri
- Çakışan zaman kontrolü ve responsive arayüz
