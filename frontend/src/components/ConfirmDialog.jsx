import { useEffect } from 'react'

function ConfirmDialog({ title, description, confirmLabel, cancelLabel, isBusy = false, onConfirm, onCancel }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isBusy) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBusy, onCancel])

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{description}</p>
        <div>
          <button className="button button--secondary" type="button" onClick={onCancel} disabled={isBusy}>{cancelLabel}</button>
          <button className="button button--danger" type="button" onClick={onConfirm} disabled={isBusy}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmDialog
