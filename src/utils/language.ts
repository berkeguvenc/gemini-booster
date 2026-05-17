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
