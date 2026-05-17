// utils/storage.ts — Centralized chrome.storage helpers

import { STORAGE_KEYS } from "../constants"
import type { FavoriteAnswer } from "../types/favorite"
import type { ChatFolder } from "../types/folder"
import type { Note } from "../types/note"
import type { SavedPrompt } from "../types/prompt"
import type { LocalStorageData, SyncStorageData } from "../types/storage"

// =============================================
// Local Storage Helpers
// =============================================

export async function getFavorites(): Promise<FavoriteAnswer[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.LOCAL.FAVORITES, (res) => {
      const result = res as LocalStorageData
      resolve(result.gemini_favorites || [])
    })
  })
}

export async function saveFavorites(favorites: FavoriteAnswer[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FAVORITES]: favorites }, resolve)
  })
}

export async function getPrompts(): Promise<SavedPrompt[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.LOCAL.PROMPTS, (res) => {
      const result = res as LocalStorageData
      resolve(result.gemini_prompts || [])
    })
  })
}

export async function savePrompts(prompts: SavedPrompt[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.PROMPTS]: prompts }, resolve)
  })
}

export async function getNotes(): Promise<Note[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.LOCAL.NOTES, (res) => {
      const result = res as LocalStorageData
      resolve(result.gemini_notes || [])
    })
  })
}

export async function saveNotes(notes: Note[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.NOTES]: notes }, resolve)
  })
}

export async function getFolders(): Promise<ChatFolder[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.LOCAL.FOLDERS, (res) => {
      const result = res as LocalStorageData
      resolve(result.gemini_folders || [])
    })
  })
}

export async function saveFolders(folders: ChatFolder[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOCAL.FOLDERS]: folders }, resolve)
  })
}

/**
 * Load all local storage data at once (favorites, prompts, notes, folders).
 */
export async function getAllLocalData(): Promise<LocalStorageData> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [
        STORAGE_KEYS.LOCAL.FAVORITES,
        STORAGE_KEYS.LOCAL.PROMPTS,
        STORAGE_KEYS.LOCAL.NOTES,
        STORAGE_KEYS.LOCAL.FOLDERS
      ],
      (res) => resolve(res as LocalStorageData)
    )
  })
}

// =============================================
// Sync Storage Helpers
// =============================================

export async function getSyncSettings(): Promise<SyncStorageData> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      [STORAGE_KEYS.SYNC.BULK_DELETE, STORAGE_KEYS.SYNC.LANGUAGE],
      (res) => resolve(res as SyncStorageData)
    )
  })
}

export async function setSyncSetting<K extends keyof SyncStorageData>(
  key: K,
  value: SyncStorageData[K]
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, resolve)
  })
}
