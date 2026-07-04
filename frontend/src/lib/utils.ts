export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function padCatalogNumber(n: number): string {
  return String(n).padStart(3, '0')
}

/** Merge class names (replaces clsx/cn for admin pages) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Format timestamp to HH:MM */
export function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/** Get initials from a full name */
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
