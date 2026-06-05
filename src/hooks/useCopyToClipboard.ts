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

// hooks/useCopyToClipboard.ts — Reusable clipboard copy hook

import { useCallback, useState } from "react"

import { COPY_FEEDBACK_TIMEOUT_MS } from "../constants"

/**
 * Hook that provides a copy-to-clipboard function with visual feedback state.
 *
 * @returns [copiedIds, copyToClipboard]
 *   - copiedIds: Record mapping item IDs to their "just copied" state
 *   - copyToClipboard: Async function to copy text and update feedback state
 *
 * @example
 *   const [copiedIds, copyToClipboard] = useCopyToClipboard()
 *   <button onClick={() => copyToClipboard("item-1", "Hello")}>
 *     {copiedIds["item-1"] ? "Copied!" : "Copy"}
 *   </button>
 */
export function useCopyToClipboard(): [
  Record<string, boolean>,
  (id: string, text: string) => Promise<void>
] {
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({})

  const copyToClipboard = useCallback(
    async (id: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopiedIds((prev) => ({ ...prev, [id]: true }))
        setTimeout(() => {
          setCopiedIds((prev) => ({ ...prev, [id]: false }))
        }, COPY_FEEDBACK_TIMEOUT_MS)
      } catch (err) {
        console.error("Clipboard copy failed:", err)
      }
    },
    []
  )

  return [copiedIds, copyToClipboard]
}
