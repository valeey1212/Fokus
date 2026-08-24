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

Die App ist danach unter `https://<benutzername>.github.io/fokus/` erreichbar und kann dort über „Zum Home-Bildschirm" installiert werden.
