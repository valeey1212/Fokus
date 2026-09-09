# Fokus

Persönliche Produktivitäts-App als installierbare PWA. Kein Backend, keine Konten – alle Daten liegen lokal in IndexedDB auf dem Gerät.

Details zu Auftrag, Prinzipien und Datenmodell stehen in [CLAUDE.md](./CLAUDE.md).

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Push nach `main` löst den GitHub-Actions-Workflow aus, der die App baut und auf GitHub Pages veröffentlicht (siehe `.github/workflows/deploy.yml`). Unter **Settings → Pages** muss die Quelle einmalig auf „GitHub Actions" gestellt werden.

Die App ist danach unter `https://<benutzername>.github.io/Fokus/` erreichbar und kann dort über „Zum Home-Bildschirm" installiert werden.

Der Pfad ist case-sensitiv: Er muss exakt der Schreibweise des Repo-Namens entsprechen und mit `base` in `vite.config.ts` sowie `start_url`/`scope`/`id` in `public/manifest.webmanifest` übereinstimmen.

## KI-Agenten-Büro

Im Ordner `buero/` liegt eine zweite, eigenständige App: ein Büro voller KI-Mitarbeiter im
isometrischen Pixel-Büro. Du stellst Leute ein, gibst ihnen Aufgabenprofile und Zugriff auf Ordner oder
Postfächer, verteilst Aufträge und siehst zu, wie sie erledigt werden. Details in
[`buero/README.md`](buero/README.md). Auf GitHub Pages liegt sie unter `/Fokus/buero/`.
