// constants.ts — Shared constants across the project

/** Maximum characters to store for a favorite or prompt text */
export const TEXT_TRUNCATE_LIMIT = 500

/** Character count threshold for showing the "Read more" button in list items */
export const EXPAND_THRESHOLD = 200

/** Duration (ms) to show the "Copied" feedback after clipboard copy */
export const COPY_FEEDBACK_TIMEOUT_MS = 2000

/** Wait durations (ms) used during the bulk-delete DOM automation flow */
export const DELETE_WAIT_MS = {
  MENU_OPEN: 400,
  CONFIRM_DIALOG: 400,
  POST_DELETE: 800
} as const

/** Pulse animation duration (ms) for star/bookmark button feedback */
export const PULSE_ANIMATION_MS = 300

/** Chrome storage keys — single source of truth */
export const STORAGE_KEYS = {
  LOCAL: {
    FAVORITES: "gemini_favorites",
    PROMPTS: "gemini_prompts",
    NOTES: "gemini_notes",
    FOLDERS: "gemini_folders"
  },
  SYNC: {
    LANGUAGE: "gbr_settings_language",
    BULK_DELETE: "gbr_settings_bulk_delete"
  }
} as const
