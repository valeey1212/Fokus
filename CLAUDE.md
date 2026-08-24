# Auftrag an Claude Code
*Diese Datei ist der komplette Prompt. Als `CLAUDE.md` ins Repo legen, dann in Claude Code sagen: „Lies CLAUDE.md und fang mit Meilenstein 1 an."*
---
## Auftrag
Baue eine persönliche Produktivitäts-App als **installierbare PWA**. Der Nutzer hat ein iPhone, keinen Mac und keine Entwicklungsumgebung. Alles läuft über GitHub im Browser. Endergebnis: eine Adresse, die er in Safari öffnet und über „Zum Home-Bildschirm" wie eine echte App benutzt – offline lauffähig, mit eigenem Icon.
**Sprache der gesamten Oberfläche: Deutsch.** Alle sichtbaren Texte, Datumsformate und Buttonbeschriftungen auf Deutsch. Code, Variablen und Kommentare ebenfalls auf Deutsch, weil die Fachbegriffe deutsch sind und Mischsprache hier verwirrt.
## Technik
- **Vite + React + TypeScript**, einfaches CSS mit Custom Properties. Kein UI-Framework, kein Tailwind, keine Komponentenbibliothek.
- **Kein Backend, keine Konten, kein Sync.** Alles lokal.
- **Persistenz über IndexedDB** (`idb-keyval` ist in Ordnung). Nicht localStorage – iOS räumt das bei Web-Apps unter Umständen ab.
- **Vollständiger JSON-Export und -Import** als manuelles Backup. Das ist die einzige Absicherung gegen Datenverlust und deshalb Pflicht in Meilenstein 1.
- **PWA**: `manifest.webmanifest` mit `display: standalone`, Icons in 192 und 512 px, Theme-Color `#F2F3EF`, Service Worker, der die App-Shell cacht, damit sie offline startet.
- **Deployment über GitHub Actions auf GitHub Pages.** Richte das mit ein und setze `base` in `vite.config.ts` passend zum Repo-Namen.
- Zielgerät ist ein iPhone. Berücksichtige `viewport-fit=cover` und `env(safe-area-inset-*)`. Alle Tap-Flächen mindestens 44 px hoch.
Falls im Repo `referenz/prototyp.html` liegt: Das ist ein funktionierender Vorläufer als einzelne HTML-Datei. Nimm ihn als Referenz für Verhalten und Aussehen, aber baue neu und sauber strukturiert.
---
## Warum die App existiert
Der Nutzer hat ADS. Vier konkrete Probleme sollen gelöst werden. Jede Designentscheidung im Zweifel an diesen Zielen messen:
1. **Dinge nicht zu Ende bringen.** Hundert Sachen angefangen, nichts beendet.
2. **Vergesslichkeit.** Aufgaben und Einkäufe gehen verloren.
3. **Gedanken festhalten.** Wichtiges schnell notieren und später darauf zurückkommen.
4. **Fehlender Fokus.** Konzentration soll schrittweise aufgebaut werden.
**Leitsatz:** Die App erzeugt keine Motivation, sie senkt die Einstiegshürde. Sie macht das *Anfangen* schwerer und das *Weitermachen* leichter.
## Harte Produktprinzipien
Diese Regeln gehen jeder anderen Überlegung vor. Wenn eine Abkürzung eines dieser Prinzipien verletzt, nimm die Abkürzung nicht.
1. **Kein Druck.** Keine Streaks, keine Punkte, keine gesammelten Belohnungen, keine Bäume, kein Wald.
2. **Kein Zähler zeigt Unerledigtes.** Kein App-Badge, keine „X überfällig"-Anzeige, keine Zahl offener Aufgaben auf dem Startscreen.
3. **Kein Rot in der gesamten Oberfläche.** Auch nicht für Fristen. Auch nicht für Fehler. Fristen sind ocker.
4. **Nichts verfällt.** Nichts wird automatisch gelöscht oder archiviert. Kein Vorhaben kann scheitern.
5. **Was auf heute begrenzt ist, darf bleiben. Was sich ansammelt und reißen kann, nicht.** Ein Zähler, der morgens bei null steht, ist erlaubt. Eine fortlaufende Serie nicht.
6. **Ein Vorschlag, kein Katalog.** Der Startscreen zeigt genau eine Sache.
7. **Kein Vorwurf im Text.** „Noch relevant?" statt „Seit 14 Tagen nicht bearbeitet". Bei Abbruch: „Ok. Weiter, wenn du magst." Nie „Session abgebrochen".
8. **Erfassen kostet null Entscheidungen.** Ein Feld, keine Kategorie, keine Pflichtangabe.
---
## Datenmodell
```ts
type Spalte = 'ablage' | 'naechstes' | 'aktiv' | 'fertig';
type Keeper = {
  id: string; inhalt: string; typ: 'text' | 'audio' | 'link' | 'foto';
  erstelltAm: string; status: 'offen' | 'sortiert';
  ziel?: 'board' | 'todo' | 'einkauf' | 'ablage'; zielId?: string;
};
type Schritt = { id: string; text: string; erledigtAm: string | null };
type Karte = {
  id: string; titel: string; fertigWenn: string;
  spalte: Spalte; schritte: Schritt[];
  heuteBis?: string;          // ISO-Datum, an dem der Heute-Platz endet
  aktivSeit?: string;
  wunschtermin: string | null; // reine Planungshilfe
  frist: string | null;        // beeinflusst Vorschläge
  letzteSessionAm: string | null;
  uebergangen: number;         // intern, NIEMALS anzeigen
  erstelltAm: string; abgeschlossenAm: string | null;
};
type Eintrag = {
  id: string; listenTyp: 'todo' | 'einkauf'; text: string;
  erledigt: boolean; bereich?: string;
  faelligAm?: string; wiederholung?: 'taeglich' | 'woechentlich' | 'monatlich';
};
type Stammartikel = { id: string; text: string; bereich: string; haeufigkeit: number };
type Session = {
  id: string; karteId: string; start: string; dauerMin: number;
  abgeschlossen: boolean; strikt: boolean;
};
type Einstellungen = {
  plaetze: 1 | 2 | 3; dauerMin: number; strikt: boolean; bereiche: string[];
};
```
**Abgeleitet, nie gespeichert:** Fortschritt = erledigte Schritte / Schritte gesamt. Immer als „3 von 5" mit Punkten darstellen, **niemals als Prozentzahl** – eine Prozentzahl geht rückwärts, sobald ein Schritt ergänzt wird, und das darf sich nicht wie ein Rückschlag anfühlen.
---
## Navigation
Feste Leiste unten mit vier Bereichen: **Jetzt · Board · Listen · Ablage**.
Dazu ein schwebender runder Button unten rechts, der auf jedem Screen den Keeper öffnet.
---
## Funktionen
### Keeper (Ziel 3)
Ein einziges Textfeld, Fokus liegt sofort darin, Speichern schließt und kehrt zurück, wo man war. Keine Kategorie, kein Titel, kein Datum, kein Vorschlag beim Tippen.
Zusätzlich erreichbar **aus dem laufenden Fokus-Timer heraus** – dort ein eigenes Eingabefeld im Vollbild, der Timer läuft sichtbar weiter und wird nicht unterbrochen. Kein `prompt()` oder `alert()` verwenden, die sind in eingebetteten Ansichten blockiert. Diese Funktion ist technisch trivial und psychologisch die wichtigste der App – sie fängt genau die Gedanken ab, die sonst zum Abbruch der Arbeit führen.
### Sortier-Ritual (Ziel 3)
Auf „Jetzt" ein stiller Hinweis, sobald etwas offen ist: *„7 Notizen sortieren, ca. 2 Minuten."* Normale Schriftfarbe, kein Rot, kein Badge, keine Benachrichtigung.
Antippen öffnet einen Stapel, **immer nur eine Notiz sichtbar**. Ein Ziel ist vorausgewählt und wird als großer Hauptbutton gezeigt, die übrigen darunter kleiner. Ziele: Board, To-do, Einkauf, Ablage, Löschen.
Regelbasierte Vorbelegung: bekannter Stammartikel oder Einkaufswörter → Einkauf; Zeit- oder Terminwörter → To-do; **bei Unsicherheit immer Ablage, niemals Board.** Ziel „Board" öffnet direkt den Karten-Assistenten mit vorbelegtem Titel.
Jederzeit abbrechbar. Nicht sortierte Notizen bleiben folgenlos liegen.
### Karte anlegen (Ziel 1)
Kein Formular, sondern fünf Fragen nacheinander mit „Zurück" und „Überspringen":
1. **Wie heißt es?** – Pflicht.
2. **Woran merkst du, dass es fertig ist?** – optional, aber prominent. Ohne definiertes Ende wird nichts abgeschlossen.
3. **Erster Schritt, konkret, unter 15 Minuten** – Pflicht. Hilfstext: „Nicht ‚Konzept entwickeln', sondern etwas, das du sofort tun könntest."
4. **Weitere Schritte** – optional, maximal 7 insgesamt. Bei Erreichen der Grenze: „Sieben Schritte. Mehr wären vermutlich zwei Karten."
5. **Termin** – Auswahl zwischen *keiner*, *Wunschtermin* und *feste Frist*. Zwei verschiedene Felder im Datenmodell.
**Anlegen ist immer erlaubt**, unabhängig von der Zahl vorhandener Karten. Knapp ist ausschließlich der Zustand „aktiv".
### Board (Ziel 1)
Oben drei Plätze untereinander. Belegte Plätze zeigen Titel, aktuellen Schritt, Fortschrittspunkte mit Zähler und gegebenenfalls einen Termin-Chip. **Ein freier Platz ist ein eigenes Element**: gestrichelter Umriss mit „Ein Platz frei" – dadurch liest sich die Drei als Behälter, nicht als Verbot.
Darunter „Als Nächstes", darunter Zugang zur Ablage. Abgeschlossene Karten in einem eigenen, unaufdringlichen Abschnitt.
**Aktivieren.** Drag and Drop auf einen freien Platz, zusätzlich Antippen als Alternative (Drag ist auf dem iPhone unzuverlässig – beide Wege anbieten).
**Wenn alle Plätze belegt sind** und eine weitere Karte aktiviert werden soll, erscheint eine Auswahl:
- *Platz tauschen* → die drei aktiven Karten werden hervorgehoben und selbst zum Ziel. Nach der Auswahl **genau eine** Rückfrage: „Wohin mit ‚X'?" mit den Optionen *Als Nächstes* und *In die Ablage*. **Im Dialog muss sichtbar stehen, dass der Fortschritt erhalten bleibt** („2 von 6 Schritten"), sonst fühlt sich Zurückschieben wie Verlust an.
- *Nur für heute* → vierter, sichtbar temporärer Platz mit gestricheltem Rand und Chip „nur heute". Maximal einer gleichzeitig.
**Heute-Platz läuft um Mitternacht ab.** Beim nächsten Start wandert die Karte nach „Als Nächstes" und die App fragt **einmal**: *richtig aktivieren* oder *nochmal nur für heute*? Wird die Frage ignoriert, passiert nichts weiter.
**7-Tage-Erneuerung.** Liegt eine aktive Karte 7 Tage ohne Session, erscheint **auf der Karte selbst** eine leise Zeile: *„Seit 9 Tagen keine Session"* mit unterstrichenem „Ansehen". Kein Popup beim Öffnen, kein Badge. Antippen bietet: *Aktiv lassen* (Frage kommt in 7 Tagen wieder) · *Schritt kleiner machen* (öffnet Bearbeitung, ist meistens die richtige Antwort) · *Parken* (Platz frei, Karte mit Fortschritt in die Ablage).
Das ist der Mechanismus, der Dranbleiben erzeugt. Das Limit schützt gegen Breite, die Erneuerung gegen Tiefe – drei Karten, die seit sechs Wochen ruhen, wären sonst formal korrekt und faktisch dasselbe Problem wie hundert offene.
**Abschließen.** Kurze Animation, Karte wandert nach „Fertig", Platz wird frei. **Danach passiert nichts weiter** – kein Punktestand, keine Serie, keine Auswertung.
**Kartendetail** als Vollbild: Fertig-Kriterium, Pfad mit abhakbaren Schritten, Schritt hinzufügen, Session starten, Parken/Aktivieren, Abschließen, Löschen.
### Jetzt-Screen und Vorschlagsengine (Ziel 4)
Von oben nach unten:
1. **Ein Vorschlag** – Kartentitel, konkreter nächster Schritt, Dauer, großer Start-Button. Daneben klein „Anderes".
2. **Tagesanzeige** – heutige Sessions, z. B. „2 Sessions". Am nächsten Morgen bei null, kommentarlos, ohne Bewertung.
3. **Die aktiven Karten**, kompakt.
4. **Keeper-Hinweis**, falls etwas offen ist.
„Anderes" liefert **genau zwei Alternativen**, nie eine Liste, plus die Option „Heute nichts davon" – die den Vorschlagsbereich für den Rest des Tages ausblendet.
**Engine, rein regelbasiert.** Höchster Wert gewinnt:
| Signal | Wirkung |
|---|---|
| Feste Frist in ≤ 3 Tagen | +100 |
| Karte auf Heute-Platz | +90 |
| **Karte beim letzten oder vorletzten Schritt** | **+60** |
| Frist in ≤ 7 Tagen | +30 |
| Tage seit letzter Session | +2 je Tag, max. +20 |
| Noch nie bearbeitet | +6 |
| Heute schon bearbeitet | −15 |
| Übergangen-Zähler | −3 je Übergehen |
Der Endspurt-Zuschlag ist wichtig: Genau am Schluss, wenn nur noch das Langweilige übrig ist, bricht es sonst ab. Formuliere deshalb im Karten-Assistenten den letzten Schritt als Abschlusshandlung („abschicken", „hochladen", „übergeben"), nicht als Inhalt.
**Sondermodus bei Vermeidung.** Steht `uebergangen` bei 4 oder mehr, hilft ein fünfter Vorschlag nicht. Stattdessen zeigt die App:
> ***Steuererklärung* liegt länger.**
> [ Nur 10 Minuten dran ] [ Ersten Schritt kleiner machen ] [ Erstmal beiseitelegen ]
**Der Zähler wird niemals angezeigt.** Er ist Diagnose, kein Vorwurf. Zurücksetzen auf 0, sobald eine Session läuft oder der Schritt geändert wird. Übergangen heißt fast immer: Der Schritt ist noch zu groß.
### Fokus (Ziel 4)
Vollbild-Timer: Kartentitel, aktueller Schritt, Restzeit groß in Monospace, Keeper-Button, Beenden.
- **Jede Session hängt an genau einer Karte.** Es gibt keinen freistehenden Timer.
- Optionaler **Strikt-Modus** (Standard aus): App verlassen beendet die Session. Wirkung ausschließlich auf diese eine Session, keinerlei Nachwirkung auf morgen.
- Abbrechen ist jederzeit möglich und wird nicht kommentiert.
- `wakeLock` anfordern, damit das Display anbleibt. Fehler still abfangen.
**Am Ende genau eine Frage:** „Schritt erledigt?" · „Nächsten Schritt ändern" · „Karte ist fertig". Sind danach alle Schritte erledigt, fragt die App unter Nennung des Fertig-Kriteriums, ob abgeschlossen werden soll.
### Listen (Ziel 2)
Zwei Reiter: **To-do** und **Einkauf**. Eingabefeld oben, Enter fügt hinzu und behält den Fokus. Erledigtes rutscht in einen eigenen Abschnitt mit „aufräumen".
**Erinnerungen dürfen zuverlässig sein.** Das ist die einzige Stelle, an der die App drängen darf, weil der Nutzer sie selbst darum gebeten hat. Es gibt zwei streng getrennte Klassen: *Angebote* (höchstens eine pro Tag, abschaltbar) und *Zusagen* (selbst gesetzte Zeit- und Ortserinnerungen, unbegrenzt zuverlässig). Ohne diese Trennung hätte man eine drucklose App, die den Zahnarzttermin trotzdem vergessen lässt.
Technischer Hinweis: Auf iOS funktionieren Web-Benachrichtigungen nur, wenn die App über „Zum Home-Bildschirm" installiert wurde, und auch dann nur eingeschränkt. **Baue in Meilenstein 2 zunächst nur die Datenhaltung für Erinnerungen** und weise beim Setzen ehrlich darauf hin, wenn die Berechtigung fehlt. Nicht so tun, als wäre es zuverlässig, wenn es das nicht ist.
### Einkaufsmodus (Ziel 2)
Eigener Vollbildmodus für den Laden:
- Große Tap-Flächen, einhändig erreichbar, mindestens 60 px hohe Artikelzeilen.
- Display bleibt an (`wakeLock`).
- **Sortiert nach Ladenbereichen**, nicht alphabetisch. Reihenfolge in den Einstellungen verschiebbar.
- Antippen → Artikel gleitet nach unten unter **„Im Wagen"**. Nicht gelöscht, jederzeit zurückholbar.
- Kopfzeile „9 von 12" – reiner Session-Zähler, kein Ziel.
- **Fertig** entfernt die abgehakten Artikel. Nicht gefundene bleiben stehen, kommentarlos.
**Kein Teilen, kein Sync, keine Konten.** Stattdessen ein Button, der die offene Liste als reinen Text ins Share-Sheet legt (`navigator.share`, mit Fallback auf ein markierbares Textfeld). Das deckt den Bedarf ab, ohne Serverbetrieb.
**Stammartikel** werden mit Bereich gelernt und beim Tippen vorgeschlagen. Reine Autovervollständigung, kein Automatismus.
### Ablage (Ziel 3)
Chronologische, durchsuchbare Liste. Jeder Eintrag mit Originaltext und Pfad, per Geste aufs Board beförderbar.
**Wochenrunde**, freiwillig, maximal 5 Einträge, etwa 2 Minuten: *„Noch relevant?"* → *Nächster Schritt* · *Liegen lassen* · *Löschen*. Folgenlos überspringbar, ohne Nachfrage beim nächsten Mal.
### Einstellungen
Einstellbar: Plätze (1, 2 oder 3 – **nach oben bewusst nicht offen**), Session-Dauer, Strikt-Modus, Ladenbereiche und deren Reihenfolge, Angebot-Benachrichtigungen, Wochenrunde, Darstellung.
Nicht einstellbar: mehr als 3 Plätze, das Pflichtfeld „nächster Schritt", der Vermeidungszähler, Badges. Das 3er-Limit ist das Alleinstellungsmerkmal – sobald es sich aufheben lässt, ist die App ein weiteres Aufgabenprogramm.
---
## Alle Grenzen
| Was | Grenze |
|---|---|
| Aktive Karten | 3, im Datenlayer erzwungen |
| Heute-Platz | 1, endet um 0 Uhr |
| Schritte pro Pfad | 7 |
| Erster Schritt | unter 15 Minuten |
| Wochenrunde | 5 Karten |
| Alternativvorschläge | 2 |
| Angebot-Benachrichtigungen | 1 pro Tag |
| Vorschläge auf „Jetzt" | 1 |
**Unbegrenzt:** Karten anlegen · Pfade schreiben und ändern · Ablage · Keeper · Tausche · wie lange eine Karte aktiv bleibt.
---
## Design
Ruhig, papierartig, kein Rot. Übernimm diese Tokens exakt:
```css
--paper:#F2F3EF; --card:#FCFDFB; --ink:#1C211E; --ink2:#5D655C; --ink3:#8D948A;
--line:#DDE1D9; --pine:#35604F; --pine-soft:#E3ECE5;
--ochre:#8A6A3D; --ochre-soft:#F1E9DB;
```
- Schrift: **Inter Tight** für Oberfläche, **JetBrains Mono** für Zahlen, Zeiten und Zähler, **Instrument Serif kursiv** ausschließlich für die Einladungszeile im leeren Platz. Systemschriften als Fallback, damit die App offline nicht bricht.
- Fortschritt als **Punktreihe** plus „3/5" in Monospace. Keine Prozentbalken.
- Termin-Chips: Frist in Ocker, Wunschtermin in neutralem Grau.
- Karten mit 14 px Radius, 1 px Rahmen, kein Schlagschatten außer beim schwebenden Button.
- `prefers-reduced-motion` respektieren, sichtbarer Fokusring, ausreichende Kontraste.
---
## Meilensteine
Jeder Meilenstein wird als eigener Commit abgeschlossen und muss für sich lauffähig sein.
**1 – Kern und Deployment.** Projektaufbau, PWA-Grundgerüst, IndexedDB, JSON-Export und -Import, GitHub Actions auf Pages. Keeper · Sortier-Ritual · Karten-Assistent · Board mit drei Plätzen, Tausch, Heute-Platz und 7-Tage-Erneuerung · Fokus-Timer.
*Abnahme: Auf dem iPhone installierbar, überlebt einen Neustart mit Daten, der Kreislauf Gedanke → Karte → Platz → Session → fertig ist vollständig durchspielbar.*
**2 – Listen.** To-do mit Erinnerungsdaten · Einkaufsliste · Einkaufsmodus · Textexport · Stammartikel · Ladenbereiche in den Einstellungen.
*Abnahme: Ein kompletter Einkauf ist einhändig und offline durchführbar.*
**3 – Rhythmus.** Jetzt-Screen mit voller Engine inklusive Endspurt und Vermeidungsmodus · Wochenrunde · Ablage-Suche · Einstellungen komplett.
*Abnahme: Der Vorschlag ist bei drei aktiven Karten nachvollziehbar und wiederholt sich nicht stur.*
**4 – Fokus-Programme.** Bibliothek (Einstieg 2 Wochen / 15 Min · Aufbau 4 Wochen / 25-5 · Deep Work 6 Wochen / 45–90 Min · Handyfreie Fenster 3 Wochen), Pfaddarstellung mit Wochenknoten. **Verpasste Tage verschieben den Pfad nach hinten – ein Programm kann nicht scheitern, nur pausieren.**
---
## Ausdrücklich nicht bauen
Nutzerkonten · Server · Sync zwischen Personen · geteilte Listen · Streaks · Punkte · Abzeichen · Wald oder Bäume · Prozentzahlen · Prioritätsstufen · Tags · verschachtelte Unteraufgaben · Statistiken über verpasste Tage · Onboarding-Fragebogen. Der erste Screen beim allerersten Start ist ein leeres Eingabefeld, keine Registrierung und keine Tour.
## Arbeitsweise
- Deutsch antworten.
- Vor jedem Meilenstein kurz den Plan nennen, dann bauen, dann testen lassen.
- `npm run dev` muss laufen, TypeScript ohne Fehler durchlaufen.
- Kleine, lesbare Dateien. Zustandslogik von Darstellung trennen.
- Bei Unklarheiten im Zweifel für die einfachere Variante entscheiden und die Entscheidung nennen – nicht nachfragen, wenn die Prinzipien oben die Antwort schon enthalten.

## Projekt-Notiz
Repo-Name für GitHub Pages: **fokus** (bestimmt `base: '/fokus/'` in vite.config.ts).
