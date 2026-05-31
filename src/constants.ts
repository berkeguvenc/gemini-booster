// constants.ts — Shared constants across the project

/** Maximum characters to store for a favorite or prompt text */
export const TEXT_TRUNCATE_LIMIT = 500

/** Character count threshold for showing the "Read more" button in list items */
export const EXPAND_THRESHOLD = 200

/** Duration (ms) to show the "Copied" feedback after clipboard copy */
export const COPY_FEEDBACK_TIMEOUT_MS = 2000

/** Wait durations (ms) used during the bulk-delete DOM automation flow */
export const DELETE_WAIT_MS = {
  // Original defaults (kept for backward compatibility or simple waits)
  MENU_OPEN: 400,
  CONFIRM_DIALOG: 400,
  POST_DELETE: 800,
  
  // Advanced polling and animation delays
  YIELD_EVENT_LOOP: 150,
  POLL_INTERVAL: 100,
  CLEANUP_MAX: 3000,
  MENU_OPEN_MAX: 2000,
  MENU_ANIMATION: 200,
  MENU_NOT_FOUND: 300,
  DIALOG_APPEAR_MAX: 2000,
  DIALOG_ANIMATION: 300,
  DIALOG_CLOSE_MAX: 1500,
  RETRY_CLICK_WAIT: 500,
  DISAPPEAR_MAX: 4000
} as const

/** DOM Selectors used for scraping and interaction */
export const DOM_SELECTORS = {
  CHAT_ITEM: 'gem-nav-list-item[data-test-id="conversation"]',
  ACTIONS_BTN: 'button[data-test-id="actions-menu-button"]',
  ACTIONS_BTN_FALLBACK: '.mat-mdc-menu-trigger',
  MENU_PANEL: '.mat-mdc-menu-panel',
  MENU_ITEM: '.mat-mdc-menu-panel [role="menuitem"]',
  DIALOG_CONTAINER: 'mat-dialog-container',
  CONFIRM_BTN_WRAPPER: "mat-dialog-container [data-test-id='confirm-button'], .mdc-dialog [data-test-id='confirm-button']",
  MENU_ICON: 'mat-icon, .mat-icon, .google-symbols'
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
