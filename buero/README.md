# KI-Agenten-Büro

Ein Büro voller KI-Mitarbeiter, dargestellt als 8-Bit-Spiel. Du stellst Leute ein, gibst
ihnen ein Aufgabenprofil und Zugriff auf Ordner oder Programme, verteilst Aufträge – und
siehst am Bildschirm, wer gerade arbeitet, wer wartet und wer durchs Büro läuft.

Läuft komplett im Browser, installierbar als PWA. Alle Daten liegen lokal in IndexedDB,
es gibt keinen Server und kein Konto.

## Schnellstart

```bash
cd buero
npm install
npm run dev
```

Dann unter **Setup** einen Modellzugang eintragen (siehe unten), unter **Büro** jemanden
einstellen und unter **Aufgaben** den ersten Auftrag geben.

## Die drei Anschlussarten

Jeder Mitarbeiter wird einzeln angeschlossen – teure Köpfe für schwierige Arbeit,
kostenlose für Kleinkram.

| Modus | Wofür | Was du brauchst |
|---|---|---|
| **Abo** | Alltag, wenn dein Rechner an ist | die Brücke aus `bruecke/` und ein angemeldetes Claude-Abo |
| **API** | unterwegs, auch vom iPhone | einen Anthropic-Schlüssel, kostet pro Aufgabe ein paar Cent |
| **Kostenlos** | kurze, einfache Aufgaben | einen OpenRouter-Schlüssel, die `:free`-Modelle kosten nichts |

### Abo-Brücke starten

```bash
cd buero/bruecke
npm install
npm start          # läuft auf http://localhost:4179
```

Die Brücke benutzt das Claude Agent SDK und damit die Anmeldung deines Abos
(einmalig `claude login` in der Claude-Code-CLI). Ohne SDK fällt sie auf
`ANTHROPIC_API_KEY` zurück.

Ehrlich gesagt: Der Abo-Modus funktioniert nur, wenn die App auf demselben Rechner läuft
wie die Brücke. Vom iPhone aus geht er nicht – Safari blockiert den Aufruf einer
`http://localhost`-Adresse aus einer `https`-Seite. Auf dem iPhone nimmst du **API** oder
**kostenlos**.

## Wie ein Agent arbeitet

1. Du legst eine Aufgabe an und weist sie jemandem zu.
2. Der Bürotakt startet sie, sobald ein Platz frei ist (Anzahl in den Einstellungen).
3. Der Agent bekommt sein Profil, seine Ressourcen und eine Werkzeugliste und antwortet
   in Schritten mit je einem Werkzeugaufruf.
4. Werkzeuge: Ordner lesen, Dateien schreiben, Mailentwürfe ablegen, Kolleginnen und
   Kollegen anschreiben, Teilaufgaben verteilen (wenn erlaubt), Rückfrage stellen, fertig
   melden.
5. Jeder Schritt landet im Protokoll der Aufgabe. Nichts geht nach außen: E-Mails werden
   als Entwurf abgelegt, verschickt wird nur von dir.

Bei einer Rückfrage bleibt die Aufgabe stehen, bis du antwortest. Bei einem Fehler geht
der Mitarbeiter in Pause, statt in einer Schleife Geld zu verbrennen.

## Spielelemente

Erledigte Aufgaben bringen XP und Münzen. XP heben den Rang des Mitarbeiters
(Praktikum → Junior → Profi → Senior → Leitung) und die Bürostufe. Münzen gibst du im
Büroladen für Möbel aus, die danach wirklich im Raum stehen.

## Sicherung

Setup → Exportieren schreibt den kompletten Zustand als JSON. Ohne Export ist alles weg,
wenn du die Websitedaten löschst.

## Was bewusst fehlt

Kein Konto, kein Server, kein Sync, kein automatischer Mailversand. Der Zugriff auf echte
Ordner deines Rechners ist der nächste sinnvolle Schritt und würde über die Brücke laufen –
bis dahin sind „Ordner“ Ablagen innerhalb der App.
