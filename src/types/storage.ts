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
