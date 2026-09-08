#!/usr/bin/env node
/**
 * Büro-Brücke
 * ------------
 * Läuft auf deinem Rechner und beantwortet die Modellanfragen der Büro-App.
 *
 *   Abo-Modus:  benutzt das Claude Agent SDK und damit die Anmeldung deines
 *               Claude-Abos (einmal `claude login` in der Claude-Code-CLI).
 *   API-Modus:  falls ANTHROPIC_API_KEY gesetzt ist und das SDK fehlt.
 *
 * Start:  npm install && npm start
 * Port:   4179 (mit PORT=… änderbar)
 *
 * Die Brücke spricht nur mit localhost-Seiten und der von dir erlaubten
 * Herkunft (HERKUNFT=https://…), damit keine fremde Website mitlesen kann.
 */

import http from 'node:http'

const PORT = Number(process.env.PORT ?? 4179)
const ERLAUBTE_HERKUNFT = process.env.HERKUNFT ?? ''
const API_SCHLUESSEL = process.env.ANTHROPIC_API_KEY ?? ''

let sdk = null
let sdkFehler = ''
try {
  sdk = await import('@anthropic-ai/claude-agent-sdk')
} catch (fehler) {
  sdkFehler = fehler?.message ?? String(fehler)
}

function herkunftErlaubt(herkunft) {
  if (!herkunft) return true
  if (ERLAUBTE_HERKUNFT && herkunft === ERLAUBTE_HERKUNFT) return true
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(herkunft)
}

function setzeKopfzeilen(antwort, herkunft) {
  antwort.setHeader('access-control-allow-origin', herkunft || '*')
  antwort.setHeader('access-control-allow-headers', 'content-type')
  antwort.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS')
  antwort.setHeader('vary', 'origin')
}

function sende(antwort, code, daten) {
  antwort.writeHead(code, { 'content-type': 'application/json; charset=utf-8' })
  antwort.end(JSON.stringify(daten))
}

async function leseKoerper(anfrage) {
  const teile = []
  let groesse = 0
  for await (const stueck of anfrage) {
    groesse += stueck.length
    if (groesse > 2_000_000) throw new Error('Anfrage zu groß')
    teile.push(stueck)
  }
  return JSON.parse(Buffer.concat(teile).toString('utf8') || '{}')
}

/** Verlauf in einen einzelnen Prompt gießen – die Werkzeugschleife läuft in der App. */
function baueEingabe(verlauf) {
  return verlauf
    .map((zug) => (zug.rolle === 'agent' ? `Deine letzte Antwort:\n${zug.text}` : zug.text))
    .join('\n\n---\n\n')
}

async function ueberSdk({ modell, system, verlauf }) {
  const antwortteile = []
  const lauf = sdk.query({
    prompt: baueEingabe(verlauf),
    options: {
      model: modell || 'claude-sonnet-5',
      systemPrompt: system,
      // Die Agenten arbeiten mit den Werkzeugen der Büro-App, nicht mit denen der CLI.
      allowedTools: [],
      settingSources: [],
      maxTurns: 1,
      permissionMode: 'default',
    },
  })
  for await (const nachricht of lauf) {
    if (nachricht.type === 'assistant') {
      for (const teil of nachricht.message?.content ?? []) {
        if (teil.type === 'text') antwortteile.push(teil.text)
      }
    }
  }
  return antwortteile.join('\n').trim()
}

async function ueberApi({ modell, system, verlauf }) {
  const antwort = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_SCHLUESSEL,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modell || 'claude-sonnet-5',
      max_tokens: 2000,
      system,
      messages: verlauf.map((zug) => ({ role: zug.rolle === 'agent' ? 'assistant' : 'user', content: zug.text })),
    }),
  })
  if (!antwort.ok) throw new Error(`Anthropic antwortet mit ${antwort.status}: ${(await antwort.text()).slice(0, 300)}`)
  const daten = await antwort.json()
  return (daten.content ?? [])
    .filter((t) => t.type === 'text')
    .map((t) => t.text)
    .join('\n')
}

const server = http.createServer(async (anfrage, antwort) => {
  const herkunft = anfrage.headers.origin ?? ''
  if (!herkunftErlaubt(herkunft)) {
    sende(antwort, 403, { fehler: `Herkunft ${herkunft} ist nicht erlaubt. Starte die Brücke mit HERKUNFT=${herkunft}` })
    return
  }
  setzeKopfzeilen(antwort, herkunft)

  if (anfrage.method === 'OPTIONS') {
    antwort.writeHead(204)
    antwort.end()
    return
  }

  const pfad = (anfrage.url ?? '').split('?')[0]

  if (pfad === '/api/status') {
    const modus = sdk ? 'Abo' : API_SCHLUESSEL ? 'API-Schlüssel' : 'nichts'
    sende(antwort, 200, {
      bereit: Boolean(sdk || API_SCHLUESSEL),
      modus,
      hinweis: sdk
        ? 'Claude Agent SDK gefunden. Läuft über die Anmeldung deines Abos.'
        : API_SCHLUESSEL
          ? 'SDK fehlt, nutze ANTHROPIC_API_KEY.'
          : `Weder SDK noch Schlüssel. npm install im Ordner bruecke ausführen. (${sdkFehler})`,
    })
    return
  }

  if (pfad === '/api/agent' && anfrage.method === 'POST') {
    try {
      const koerper = await leseKoerper(anfrage)
      const text = sdk ? await ueberSdk(koerper) : API_SCHLUESSEL ? await ueberApi(koerper) : null
      if (text === null) {
        sende(antwort, 503, { fehler: 'Die Brücke hat keinen Zugang zu einem Modell. Siehe /api/status.' })
        return
      }
      sende(antwort, 200, { text })
    } catch (fehler) {
      sende(antwort, 500, { fehler: fehler?.message ?? String(fehler) })
    }
    return
  }

  sende(antwort, 404, { fehler: 'Unbekannter Pfad' })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Büro-Brücke läuft auf http://localhost:${PORT}`)
  console.log(sdk ? 'Modus: Claude-Abo über das Agent SDK' : API_SCHLUESSEL ? 'Modus: API-Schlüssel' : 'Achtung: noch kein Modellzugang – npm install fehlt?')
  if (ERLAUBTE_HERKUNFT) console.log(`Zusätzlich erlaubte Herkunft: ${ERLAUBTE_HERKUNFT}`)
})
