import './SectionCard.css'

/**
 * SectionCard — Reusable card container for grouping related content.
 *
 * Props:
 *   title       — card heading text
 *   description — subtitle/description text
 *   children    — card body content (JSX)
 *   className   — additional CSS class names
 *   variant     — 'default' | 'success' | 'warning' | 'info'
 */
function SectionCard({
  title = '',
  description = '',
  children,
  className = '',
  variant = 'default',
}) {
  const cardClass = `section-card section-card--${variant}${className ? ` ${className}` : ''}`

  return (
    <div className={cardClass}>
      {title && <h2 className="section-card-title">{title}</h2>}
      {description && <p className="section-card-description">{description}</p>}
      <div className="section-card-body">
        {children}
      </div>
    </div>
  )
}

export default SectionCard