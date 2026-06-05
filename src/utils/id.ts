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
