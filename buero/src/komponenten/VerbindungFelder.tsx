import type { Verbindung, Verbindungsmodus } from '../typen'
import { ABO_MODELLE, API_MODELLE, FREIE_MODELLE } from '../agenten/anbieter'

type Props = { wert: Verbindung; aendern: (v: Verbindung) => void }

const MODUS_TEXT: Record<Verbindungsmodus, string> = {
  abo: 'Abo (über die Brücke auf deinem Rechner)',
  api: 'API-Schlüssel (Anthropic, kostet pro Aufgabe)',
  frei: 'Kostenloses Modell (OpenAI-kompatibel)',
}

export function VerbindungFelder({ wert, aendern }: Props) {
  const modelle = wert.modus === 'abo' ? ABO_MODELLE : wert.modus === 'api' ? API_MODELLE : FREIE_MODELLE

  return (
    <>
      <label>
        <span>Anschluss</span>
        <select
          value={wert.modus}
          onChange={(e) => {
            const modus = e.target.value as Verbindungsmodus
            const standard = modus === 'frei' ? FREIE_MODELLE[0] : modus === 'abo' ? ABO_MODELLE[1] : API_MODELLE[0]
            aendern({ ...wert, modus, modell: standard })
          }}
        >
          {(['abo', 'api', 'frei'] as Verbindungsmodus[]).map((m) => (
            <option key={m} value={m}>
              {MODUS_TEXT[m]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Modell</span>
        <input
          list="modell-vorschlaege"
          value={wert.modell}
          onChange={(e) => aendern({ ...wert, modell: e.target.value })}
        />
        <datalist id="modell-vorschlaege">
          {modelle.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </label>

      {wert.modus !== 'abo' && (
        <label>
          <span>Eigener Schlüssel (leer = der aus dem Setup)</span>
          <input
            type="password"
            value={wert.schluessel ?? ''}
            placeholder="optional"
            onChange={(e) => aendern({ ...wert, schluessel: e.target.value })}
          />
        </label>
      )}

      {wert.modus === 'frei' && (
        <label>
          <span>Eigener Endpunkt (leer = der aus dem Setup)</span>
          <input
            value={wert.basisUrl ?? ''}
            placeholder="https://openrouter.ai/api/v1"
            onChange={(e) => aendern({ ...wert, basisUrl: e.target.value })}
          />
        </label>
      )}

      <p className="leise">
        {wert.modus === 'abo'
          ? 'Läuft über dein Claude-Abo. Dafür muss die Brücke auf deinem Rechner laufen; vom iPhone allein geht das nicht.'
          : wert.modus === 'api'
            ? 'Direkt aus dem Browser an Anthropic. Jede Aufgabe kostet ein paar Cent.'
            : 'Für kleine Aufgaben. Kostenlose Modelle sind langsamer und halten sich seltener an das Format.'}
      </p>
    </>
  )
}
