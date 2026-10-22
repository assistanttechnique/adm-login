import { useEffect, type RefObject } from 'react'

// Ferme un menu ou une liste ouverte au clic en dehors de `ref` ou avec la touche Échap
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose()
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [ref, open, onClose])
}
