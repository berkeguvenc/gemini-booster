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

// utils/language.ts — Shared language initialization logic

import type { i18n as I18nInstance } from "i18next"

import { STORAGE_KEYS } from "../constants"
import type { SyncStorageData } from "../types/storage"

/**
 * Initializes the i18n language from chrome.storage.sync and sets up a
 * listener for future language changes. Returns a cleanup function to
 * remove the listener.
 *
 * Usage:
 *   useEffect(() => {
 *     const cleanup = initLanguageSync(i18n)
 *     return cleanup
 *   }, [i18n])
 */
export function initLanguageSync(i18n: I18nInstance): () => void {
  // Load saved language setting
  chrome.storage.sync.get(STORAGE_KEYS.SYNC.LANGUAGE, (res) => {
    const result = res as SyncStorageData
    if (result.gbr_settings_language) {
      i18n.changeLanguage(result.gbr_settings_language)
    }
  })

  // Listen for language changes from popup or other contexts
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    namespace: string
  ) => {
    if (
      namespace === "sync" &&
      changes[STORAGE_KEYS.SYNC.LANGUAGE]
    ) {
      i18n.changeLanguage(
        changes[STORAGE_KEYS.SYNC.LANGUAGE].newValue as string
      )
    }
  }

  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
