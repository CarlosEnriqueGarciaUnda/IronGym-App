/**
 * Botón que se reutiliza en formularios y acciones de IRON GYM.
 * variant: primary | secondary | danger | ghost
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'normal',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const classes = ['ig-button', `ig-button--${variant}`, `ig-button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <span className="ig-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
