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
