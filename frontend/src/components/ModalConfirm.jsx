import { useEffect, useId, useRef } from 'react';
import Button from './Button';

/**
 * Confirmación accesible sin window.confirm().
 * La acción peligrosa se ejecuta solamente al pulsar "Confirmar".
 */
export default function ModalConfirm({
  open,
  title = 'Confirmar acción',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  processing = false,
  onConfirm,
  onClose,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !processing) {
        onClose?.();
      }

      // Mantener el enfoque dentro del modal para navegación con teclado.
      if (event.key === 'Tab') {
        const dialog = cancelRef.current?.closest('[role="dialog"]');
        const buttons = [...(dialog?.querySelectorAll('button:not(:disabled)') || [])];
        if (!buttons.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open, onClose, processing]);

  if (!open) return null;

  return (
    <div className="ig-modal-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !processing) onClose?.();
    }}>
      <section
        className="ig-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <h2 id={titleId}>{title}</h2>
        {description && <p id={descriptionId}>{description}</p>}
        <div className="ig-modal__actions">
          <Button ref={cancelRef} variant="secondary" disabled={processing} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={variant} loading={processing} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
