# Gemini Booster

**Gemini Booster**, [Plasmo](https://docs.plasmo.com/) framework'ü ile React ve TypeScript kullanılarak geliştirilmiş, Google Gemini (gemini.google.com) web arayüzünü güçlendiren ve kullanıcı deneyimini zenginleştiren eklentisidir (Chrome Extension).

## 🚀 Özellikler

Eklenti, standart Gemini deneyimine sorunsuz bir şekilde bütünleşerek hayat kurtaran üretkenlik araçları ekler:

- **⭐ Favori Cevaplar (Favorite Answers):** Gemini'nin sağladığı faydalı veya tekrar ulaşmak isteyeceğiniz yanıtları tek tıkla kaydedin. (Her yanıtın altında özel bir yıldız butonu belirir).
- **🔖 İstem Kütüphanesi (Prompt Library):** Başarılı bulduğunuz ve tekrar kullanmak isteyeceğiniz komut ve sorguları (prompt) kaydedin. (İstemlerinizin yanına kaydetme butonu eklenir).
- **🎛️ Gelişmiş Yönetim Modali:** Kayıtlı tüm verilerinizi merkezi bir menüden yönetin.
  - **Hızlı Arama:** Tüm favori ve istemleriniz içinde anlık metin araması yapın.
  - **Hızlı Kopyalama:** Panoya (clipboard) anında kopyalayın.
  - **Sohbete Git:** Kaydedilmiş verinin üretildiği orijinal Gemini sohbetine doğrudan giden tıklanabilir bağlantılar.
  - **Genişlet / Daralt:** Uzun cevapları okumayı kolaylaştıran UI hiyerarşisi.
- **🎨 Kusursuz Arayüz Entegrasyonu (Native Feel):** Eklenti, Gemini'nin "Dark" ve "Light" temalarını otomatik algılar ve yerleşik sol menüye (sidebar) doğal ikonlar olarak yerleşir.

## 🛠️ Teknik Altyapı

- **Framework:** [Plasmo](https://docs.plasmo.com/)
- **UI & Bileşenler:** React.js (v18)
- **Dil:** TypeScript
- **Veri Saklama:** `chrome.storage.sync` (Kullanılan cihazlar arası senkronizasyon yeteneği)
- **Stil:** Özel CSS ve TailwindCSS destekli

## 💻 Geliştirme Ortamını Kurma

Kendi yerel ortamınızda projeyi çalıştırmak için bağımlılıkları yükleyin ve geliştirme (dev) modunu başlatın:

```bash
pnpm install
pnpm dev
# veya
npm install
npm run dev
```

1. Tarayıcınızda (örn: Chrome) **[chrome://extensions/](chrome://extensions/)** sayfasına gidin.
2. Sağ üstten **Geliştirici modunu (Developer Mode)** aktif edin.
3. **Paketlenmemiş öğe yükle (Load unpacked)** butonuna tıklayın.
4. Bu projenin içindeki `build/chrome-mv3-dev` klasörünü seçin.
5. Gemini (gemini.google.com) sayfasını açın ve eklentinin özelliklerini test edin!

> *Not: Siz kodu değiştirdiğinizde, eklenti tarayıcıda otomatik olarak güncellenir.*

## 📦 Yayına Hazırlama (Production Build)

Kodu geliştirmeyi bitirdiğinizde ve Chrome Web Store vb. mağazalara yüklemeye hazır olduğunda üretim derlemesini (production bundle) oluşturmalısınız:

```bash
pnpm build
# veya
npm run build
```

Derleme tamamlandıktan sonra oluşturulan paket, mağazalara `zip` olarak yüklenmeye hazır hale gelir.
