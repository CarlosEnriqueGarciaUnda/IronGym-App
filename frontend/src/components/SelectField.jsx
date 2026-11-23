import { useId } from 'react';

export default function SelectField({ label, value, onChange, options, error, disabled = false, required = true }) {
  const id = useId();
  return (
    <div className="ig-field">
      <label className="ig-field__label" htmlFor={id}>{label}{required ? ' *' : ''}</label>
      <select id={id} className="ig-select-input" value={value} onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)} disabled={disabled}>
        <option value="">Seleccionar...</option>
        {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      {error && <p className="ig-field__error" role="alert">{error}</p>}
    </div>
  );
}
