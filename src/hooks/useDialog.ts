'use client'

import { useCallback, useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Makes a dialog usable with a keyboard: focus moves in when it opens,
 * Tab cycles inside it, Escape closes it, and focus returns to whatever
 * opened it.
 *
 * The three dialogs in the boss battle had none of that. The overlay is
 * not inert, so a keyboard user could Tab straight past the dialog into
 * the page behind it, which they cannot see, with no way back out except
 * landing on Cancel by chance.
 *
 * Returns a ref to put on the dialog element.
 *
 *   const dialogRef = useDialog(isOpen, onClose)
 *   <div role="alertdialog" aria-modal="true" ref={dialogRef}> … </div>
 */
export function useDialog<T extends HTMLElement>(
  open: boolean,
  onClose: () => void
) {
  const dialogRef = useRef<T>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  // Kept in a ref so changing the handler does not re-run the effect and
  // steal focus back to the top of the dialog mid-interaction.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const focusables = useCallback((): HTMLElement[] => {
    const root = dialogRef.current
    if (!root) return []
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    )
  }, [])

  useEffect(() => {
    if (!open) return

    restoreFocusTo.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    // The dialog itself first, so a screen reader reads its label before
    // announcing whichever control happens to be first.
    const root = dialogRef.current
    if (root) {
      if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1')
      root.focus()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // Wrap at both ends, and pull focus back in if it has escaped the
      // dialog entirely (which it has, if the active element is the body).
      if (event.shiftKey && (active === first || active === root)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (root && active instanceof Node && !root.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      restoreFocusTo.current?.focus()
    }
  }, [open, focusables])

  return dialogRef
}
