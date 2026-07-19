import './BrandLogo.css'

function BrandLogo({ symbolOnly = false, size = 'md', className = '' }) {
  const classes = [
    'brand-logo',
    `brand-logo-${size}`,
    symbolOnly ? 'brand-logo-symbol-only' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      <svg
        className="brand-logo-mark"
        viewBox="0 0 48 48"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="brand-mark-frame"
          d="M13.5 5.5h21l8 8v21l-8 8h-21l-8-8v-21l8-8Z"
        />
        <path
          className="brand-mark-trace"
          d="M31.5 14.5H19.2l-4.7 4.7v9.6l4.7 4.7h12.3M15 24h13.5"
        />
        <circle className="brand-mark-node" cx="31.5" cy="14.5" r="2" />
        <circle className="brand-mark-node" cx="31.5" cy="33.5" r="2" />
        <circle className="brand-mark-node" cx="28.5" cy="24" r="2" />
      </svg>

      {symbolOnly ? (
        <span className="visually-hidden">Eden Androids</span>
      ) : (
        <span className="brand-logo-name">
          Eden <span>Androids</span>
        </span>
      )}
    </span>
  )
}

export default BrandLogo
