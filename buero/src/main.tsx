import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { ladeZustand } from './daten/speicher'
import { starteTakt } from './agenten/takt'

void ladeZustand().then(() => starteTakt())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Ohne Service Worker läuft die App weiter, nur nicht offline.
    })
  })
}
