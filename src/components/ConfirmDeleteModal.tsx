import type { ReactNode } from 'react'

import { Modal } from './Modal'

// Fenêtre de confirmation commune à toutes les suppressions
export function ConfirmDeleteModal({ title, children, onConfirm, onClose }: {
  title: string
  children: ReactNode
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-ink">
        Are you sure you want to delete {children}? This action cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-md border border-card-border px-4 py-2 text-sm text-ink transition hover:bg-content">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-form-error px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}
