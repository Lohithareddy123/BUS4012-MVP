import './FormInput.css'

/**
 * FormInput — Reusable labelled input field for ResolvePath AI.
 *
 * Props:
 *   label       — field label text
 *   value       — controlled input value
 *   onChange     — change handler function
 *   placeholder — placeholder text
 *   type        — 'text' | 'email' | 'password' | 'textarea'
 *   error       — validation error message (shown in red below input)
 *   helperText  — helper description text (shown in grey below input)
 *   required    — shows a required indicator on the label
 */
function FormInput({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  error = '',
  helperText = '',
  required = false,
}) {
  const inputId = `form-input-${label ? label.toLowerCase().replace(/\s+/g, '-') : 'field'}`

  return (
    <div className={`form-input-group${error ? ' form-input-group--error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="form-input-label">
          {label}
          {required && <span className="form-input-required">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={inputId}
          className={`form-input form-input--textarea${error ? ' form-input--has-error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          id={inputId}
          className={`form-input${error ? ' form-input--has-error' : ''}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {error && <span className="form-input-error">{error}</span>}
      {!error && helperText && <span className="form-input-helper">{helperText}</span>}
    </div>
  )
}

export default FormInput