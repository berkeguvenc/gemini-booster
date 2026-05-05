# Gemini Booster

Gemini Booster, [Google Gemini](https://gemini.google.com) deneyiminizi geliştiren güçlü bir Chrome Eklentisidir. Gemini yan menüsüne sorunsuz bir şekilde entegre olarak favori cevaplarınızı, özel istemlerinizi (prompts) ve kişisel notlarınızı kaydedip yönetebileceğiniz özel bir alan sunar.

Diğer dillerde oku: [English](README.md)

## Özellikler

- **Favori Cevaplar:** Beğendiğiniz Gemini yanıtlarını kaydedin ve daha sonra anında erişin.
- **İstem Kütüphanesi:** Sık kullandığınız istemlerden (prompts) oluşan kendi kütüphanenizi oluşturun ve yönetin.
- **Notlarım:** Doğrudan Gemini arayüzü içinde kişisel notlarınızı tutun.
- **Arama İşlevi:** Eklenti açılır penceresinden (popup) tüm kayıtlı istemleriniz, favorileriniz ve notlarınız arasında kolayca arama yapın.
- **Veri İçe/Dışa Aktarma:** Verilerinizi bir JSON dosyasına dışa aktararak yedekleyin ve istediğiniz cihazda geri yükleyin.
- **Çift Dil Desteği:** İngilizce ve Türkçe dillerini tam olarak destekler.

## Kurulum

### Geliştirici Modu (Yerel Kurulum)

1. Bu depoyu (repository) bilgisayarınıza klonlayın veya indirin.
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Eklentiyi derleyin:
   ```bash
   npm run build
   ```
4. Google Chrome'u açın ve `chrome://extensions/` adresine gidin.
5. Sağ üst köşedeki **"Geliştirici modu"** (Developer mode) seçeneğini aktifleştirin.
6. **"Paketlenmemiş öğe yükle"** (Load unpacked) butonuna tıklayın ve `build/chrome-mv3-prod` klasörünü (veya oluşturulan derleme dizinini) seçin.
7. Eklenti kuruldu! Kolay erişim için araç çubuğunuza sabitleyebilirsiniz.

## Geliştirme

Bu proje [Plasmo](https://docs.plasmo.com/) ve React kullanılarak geliştirilmiştir.

- **Geliştirme sunucusunu başlatmak için:**
  ```bash
  npm run dev
  ```
- **Üretim (production) için derlemek için:**
  ```bash
  npm run build
  ```
- **Eklentiyi paketlemek için:**
  ```bash
  npm run package
  ```

## Kullanılan Teknolojiler
- React
- TypeScript
- Plasmo Framework
- i18next (yerelleştirme için)

## Lisans
MIT Lisansı
