# DakikaPro yayın kontrolü

Bu proje şu an çalışan bir MVP'dir. `render.yaml`, Render üzerinde kalıcı disk ile bir ön-yayın/demo sürümü çalıştırmak içindir.

## Güncelleme yayınlama

1. Projeyi GitHub'da özel bir repoya yükleyin.
2. Render'da **New > Blueprint** seçip GitHub reposunu bağlayın.
3. Render, `render.yaml` dosyasını algılar ve `dakikapro-staging` hizmetini oluşturur.
4. Her güncellemeden sonra değişiklikleri GitHub'a gönderin; Render otomatik olarak yeniden yayınlar.
5. Render'ın verdiği adresi test edin; hazır olduğunda kendi alan adınızı Render ayarlarından bağlayın.

## Canlıya geçmeden önce zorunlu işler

- JSON dosyasını Supabase/PostgreSQL veritabanına taşıyın.
- Her API uç noktasında sunucu tarafı oturum ve rol kontrolü ekleyin.
- Parolaları SHA-256 yerine bcrypt veya Argon2 ile saklayın.
- Gerçek iyzico/Stripe ödeme akışını ekleyin; kart verisini bu uygulama saklamasın.
- E-posta/SMS sağlayıcısını ve şifre sıfırlama akışını bağlayın.
- HTTPS, yedekleme, hata izleme ve KVKK/gizlilik metinlerini tamamlayın.
