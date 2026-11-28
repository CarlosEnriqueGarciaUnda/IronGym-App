import { useId } from 'react';

/**
 * Campo reutilizable con error debajo del input.
 * Se utiliza en login y después en formularios CRUD.
 */
export default function FormInput({
  id,
  label,
  error,
  hint,
  rightAction,
  className = '',
  required = false,
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={`ig-field ${className}`.trim()}>
      <label className="ig-field__label" htmlFor={inputId}>
        {label}
        {required ? <span aria-label="obligatorio"> *</span> : null}
      </label>

      <div className="ig-field__control">
        <input
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {rightAction ? <div className="ig-field__action">{rightAction}</div> : null}
      </div>

      {hint && <p className="ig-field__hint" id={hintId}>{hint}</p>}
      {error && <p className="ig-field__error" id={errorId}>{error}</p>}
    </div>
  );
}
