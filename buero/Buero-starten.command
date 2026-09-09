#!/bin/bash
# Startet das KI-Agenten-Büro lokal und öffnet es im Browser.
# Doppelklick genügt – dieses Fenster darf danach offen bleiben, es ist der Server.
set -e
cd "$(dirname "$0")"

if [ ! -d node_modules ]; then
  echo "Erste Einrichtung, das dauert einen Moment …"
  npm install
fi

if [ ! -d dist ]; then
  echo "Baue das Büro …"
  npm run build
fi

echo "Starte den Server auf http://localhost:4180/Fokus/buero/"
( sleep 2 && open "http://localhost:4180/Fokus/buero/" ) &
npx vite preview --port 4180
