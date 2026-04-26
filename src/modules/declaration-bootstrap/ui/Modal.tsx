import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Modal genérico — agnóstico de dominio. Si onClose se omite, el modal
// es obligatorio (no cerrable por backdrop ni Escape).

interface ModalProps {
  isOpen: boolean
  title: string
  onClose?: () => void
  children: ReactNode
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !onClose) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
        </header>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
