import { formatDatum } from '../utils/datum'

export function TerminChip({ frist, wunschtermin }: { frist: string | null; wunschtermin: string | null }) {
  if (frist) return <span className="chip chip-frist">Frist {formatDatum(frist)}</span>
  if (wunschtermin) return <span className="chip chip-wunsch">{formatDatum(wunschtermin)}</span>
  return null
}
