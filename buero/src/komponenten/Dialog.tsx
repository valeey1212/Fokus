import type { ReactNode } from 'react'

type Props = { titel: string; schliessen: () => void; children: ReactNode }

export function Dialog({ titel, schliessen, children }: Props) {
  return (
    <div
      className="dialog-hintergrund"
      onClick={(e) => {
        if (e.target === e.currentTarget) schliessen()
      }}
    >
      <div className="dialog" role="dialog" aria-label={titel}>
        <div className="kopfzeile">
          <h2>{titel}</h2>
          <button type="button" className="klein" onClick={schliessen}>
            Schließen
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
