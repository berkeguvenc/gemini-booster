/*
 * Copyright (C) 2026 Yağız Berke Güvenç
 *
 * This file is part of gemini-booster.
 *
 * gemini-booster is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * gemini-booster is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with gemini-booster. If not, see <https://www.gnu.org/licenses/>.
 */

import type { FavoriteAnswer } from "./favorite"
import type { Note } from "./note"
import type { SavedPrompt } from "./prompt"
import type { ChatFolder } from "./folder"

export interface LocalStorageData {
  gemini_favorites?: FavoriteAnswer[]
  gemini_prompts?: SavedPrompt[]
  gemini_notes?: Note[]
  gemini_folders?: ChatFolder[]
}

export interface SyncStorageData {
  gbr_settings_language?: string
  gbr_settings_bulk_delete?: boolean
}
