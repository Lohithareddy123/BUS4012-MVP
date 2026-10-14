import './PrimaryButton.css'

/**
 * PrimaryButton — Reusable action button for ResolvePath AI.
 *
 * Props:
 *   children  — button label text or JSX
 *   onClick   — click handler function
 *   variant   — 'primary' (default) or 'outline'
 *   disabled  — boolean, disables the button
 *   type      — 'button' (default) or 'submit'
 */
function PrimaryButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
}) {
  const className = `primary-button primary-button--${variant}${disabled ? ' primary-button--disabled' : ''}`

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default PrimaryButton