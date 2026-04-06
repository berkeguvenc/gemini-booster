// types/favorite.ts

export interface FavoriteAnswer {
  id: string // Yanıt ID'si: "r_8e97a95b17f151b4"
  text: string // Gemini yanıtının düz metin içeriği (max 500 karakter)
  conversationId: string // Sohbet ID'si: "c_3e53422eeb0b88d5"
  savedAt: number // Unix timestamp (Date.now())
  url: string // Kaydedildiği anki sayfa URL'i
}
