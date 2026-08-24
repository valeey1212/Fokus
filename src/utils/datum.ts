// Datumshilfsfunktionen. Tage werden als reines Kalenderdatum (YYYY-MM-DD, lokale
// Zeitzone) verglichen, damit "Mitternacht" und "seit X Tagen" korrekt funktionieren.

export function heuteIso(): string {
  return kalenderTag(new Date())
}

export function kalenderTag(datum: Date): string {
  const jahr = datum.getFullYear()
  const monat = String(datum.getMonth() + 1).padStart(2, '0')
  const tag = String(datum.getDate()).padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}

export function istHeute(isoDatum: string): boolean {
  return kalenderTag(new Date(isoDatum)) === heuteIso()
}

export function tageSeit(isoDatum: string): number {
  const dann = new Date(kalenderTag(new Date(isoDatum)))
  const jetzt = new Date(heuteIso())
  const diffMs = jetzt.getTime() - dann.getTime()
  return Math.max(0, Math.round(diffMs / 86_400_000))
}

export function tageBis(isoDatum: string): number {
  const dann = new Date(kalenderTag(new Date(isoDatum)))
  const jetzt = new Date(heuteIso())
  const diffMs = dann.getTime() - jetzt.getTime()
  return Math.round(diffMs / 86_400_000)
}

export function formatDatum(isoDatum: string): string {
  const d = new Date(isoDatum)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function heuteEndeIso(): string {
  const morgen = new Date()
  morgen.setDate(morgen.getDate() + 1)
  morgen.setHours(0, 0, 0, 0)
  return morgen.toISOString()
}
