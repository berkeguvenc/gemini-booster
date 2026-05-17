// utils/id.ts — Unique ID generator

/**
 * Generates a unique ID with the given prefix.
 * Format: `{prefix}_{timestamp}{random5chars}`
 *
 * @example generateId("note")  → "note_17478291234abcde"
 * @example generateId("folder") → "folder_17478291234xyz12"
 */
export function generateId(prefix: string): string {
  return (
    prefix +
    "_" +
    Date.now().toString() +
    Math.random().toString(36).substr(2, 5)
  )
}
