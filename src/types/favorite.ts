/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

// types/favorite.ts

export interface FavoriteAnswer {
  id: string // Yanıt ID'si: "r_8e97a95b17f151b4"
  text: string // Gemini yanıtının düz metin içeriği (max 500 karakter)
  conversationId: string // Sohbet ID'si: "c_3e53422eeb0b88d5"
  savedAt: number // Unix timestamp (Date.now())
  url: string // Kaydedildiği anki sayfa URL'i
}
