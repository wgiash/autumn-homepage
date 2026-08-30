import logo from '../assets/autumn-logo.svg?raw'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={className ?? 'brand'}
      role="img"
      aria-label="Autumn"
      dangerouslySetInnerHTML={{ __html: logo }}
    />
  )
}
