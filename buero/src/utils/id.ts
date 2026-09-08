/** Kurze, eindeutige ID ohne externe Abhängigkeit. */
export function neueId(praefix = ''): string {
  const zufall = Math.random().toString(36).slice(2, 9)
  return `${praefix}${Date.now().toString(36)}${zufall}`
}
