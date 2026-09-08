export function jetzt(): string {
  return new Date().toISOString()
}

export function uhrzeit(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function datumZeit(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

/** "vor 3 Min" – bewusst knapp, passt in die Pixelschrift. */
export function seitdem(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'gerade eben'
  if (min < 60) return `vor ${min} Min`
  const std = Math.floor(min / 60)
  if (std < 24) return `vor ${std} Std`
  return `vor ${Math.floor(std / 24)} Tagen`
}
