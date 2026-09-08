import type { Einstellungen, Verbindung } from '../typen'

export type Sprechzug = { rolle: 'nutzer' | 'agent'; text: string }

export type Modellanfrage = {
  system: string
  verlauf: Sprechzug[]
  maxTokens?: number
}

export class ModellFehler extends Error {
  constructor(message: string, readonly hinweis?: string) {
    super(message)
    this.name = 'ModellFehler'
  }
}

/** Vorschläge für die Auswahl in der Oberfläche. */
export const ABO_MODELLE = ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5-20251001']
export const API_MODELLE = ['claude-sonnet-5', 'claude-opus-5', 'claude-haiku-4-5-20251001']
export const FREIE_MODELLE = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-3.2-24b-instruct:free',
]

/**
 * Ein einzelner Modellaufruf. Drei Wege:
 *  - abo:  über die lokale Brücke, die das Claude-Abo benutzt
 *  - api:  direkt an die Anthropic-API mit eigenem Schlüssel
 *  - frei: an einen OpenAI-kompatiblen Endpunkt (kostenlose Modelle)
 */
export async function frageModell(
  verbindung: Verbindung,
  einstellungen: Einstellungen,
  anfrage: Modellanfrage,
  abbruch?: AbortSignal,
): Promise<string> {
  switch (verbindung.modus) {
    case 'abo':
      return ueberBruecke(verbindung, einstellungen, anfrage, abbruch)
    case 'api':
      return ueberAnthropic(verbindung, einstellungen, anfrage, abbruch)
    case 'frei':
      return ueberOpenAiKompatibel(verbindung, einstellungen, anfrage, abbruch)
  }
}

async function ueberBruecke(
  verbindung: Verbindung,
  einstellungen: Einstellungen,
  anfrage: Modellanfrage,
  abbruch?: AbortSignal,
): Promise<string> {
  const url = `${einstellungen.brueckeUrl.replace(/\/$/, '')}/api/agent`
  let antwort: Response
  try {
    antwort = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: abbruch,
      body: JSON.stringify({
        modell: verbindung.modell,
        system: anfrage.system,
        verlauf: anfrage.verlauf,
      }),
    })
  } catch {
    throw new ModellFehler(
      'Die Brücke ist nicht erreichbar.',
      `Starte sie auf deinem Rechner mit "npm start" im Ordner buero/bruecke und prüfe die Adresse ${einstellungen.brueckeUrl} in den Einstellungen.`,
    )
  }
  if (!antwort.ok) {
    const text = await antwort.text().catch(() => '')
    throw new ModellFehler(`Brücke meldet Fehler ${antwort.status}`, text.slice(0, 400))
  }
  const daten = (await antwort.json()) as { text?: string; fehler?: string }
  if (daten.fehler) throw new ModellFehler(daten.fehler)
  return daten.text ?? ''
}

async function ueberAnthropic(
  verbindung: Verbindung,
  einstellungen: Einstellungen,
  anfrage: Modellanfrage,
  abbruch?: AbortSignal,
): Promise<string> {
  const schluessel = verbindung.schluessel || einstellungen.anthropicSchluessel
  if (!schluessel) {
    throw new ModellFehler(
      'Kein API-Schlüssel hinterlegt.',
      'Trage in den Einstellungen einen Anthropic-Schlüssel ein oder stelle den Mitarbeiter auf „Abo“ oder „kostenlos“ um.',
    )
  }
  const antwort = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: abbruch,
    headers: {
      'content-type': 'application/json',
      'x-api-key': schluessel,
      'anthropic-version': '2023-06-01',
      // Erlaubt den Aufruf direkt aus dem Browser (sonst blockiert CORS).
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: verbindung.modell,
      max_tokens: anfrage.maxTokens ?? 2000,
      system: anfrage.system,
      messages: anfrage.verlauf.map((z) => ({
        role: z.rolle === 'nutzer' ? 'user' : 'assistant',
        content: z.text,
      })),
    }),
  })
  if (!antwort.ok) {
    const text = await antwort.text().catch(() => '')
    throw new ModellFehler(`Anthropic antwortet mit ${antwort.status}`, text.slice(0, 400))
  }
  const daten = (await antwort.json()) as { content?: { type: string; text?: string }[] }
  return (daten.content ?? [])
    .filter((teil) => teil.type === 'text')
    .map((teil) => teil.text ?? '')
    .join('\n')
}

async function ueberOpenAiKompatibel(
  verbindung: Verbindung,
  einstellungen: Einstellungen,
  anfrage: Modellanfrage,
  abbruch?: AbortSignal,
): Promise<string> {
  const basis = (verbindung.basisUrl || einstellungen.freieBasisUrl).replace(/\/$/, '')
  const schluessel = verbindung.schluessel || einstellungen.freierSchluessel
  if (!schluessel) {
    throw new ModellFehler(
      'Kein Schlüssel für kostenlose Modelle hinterlegt.',
      'Ein OpenRouter-Schlüssel reicht; die :free-Modelle kosten nichts. Eintragen unter Einstellungen.',
    )
  }
  const antwort = await fetch(`${basis}/chat/completions`, {
    method: 'POST',
    signal: abbruch,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${schluessel}`,
    },
    body: JSON.stringify({
      model: verbindung.modell || einstellungen.freiesStandardmodell,
      max_tokens: anfrage.maxTokens ?? 1600,
      messages: [
        { role: 'system', content: anfrage.system },
        ...anfrage.verlauf.map((z) => ({
          role: z.rolle === 'nutzer' ? 'user' : 'assistant',
          content: z.text,
        })),
      ],
    }),
  })
  if (!antwort.ok) {
    const text = await antwort.text().catch(() => '')
    throw new ModellFehler(`Modellanbieter antwortet mit ${antwort.status}`, text.slice(0, 400))
  }
  const daten = (await antwort.json()) as { choices?: { message?: { content?: string } }[] }
  return daten.choices?.[0]?.message?.content ?? ''
}
