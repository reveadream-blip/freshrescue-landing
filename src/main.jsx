import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

// --- ENREGISTREMENT DU SERVICE WORKER POUR LE PUSH ET L'INSTALLATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker enregistré avec succès ! Scope:', reg.scope);
      })
      .catch(err => {
        console.error('❌ Erreur d\'enregistrement du Service Worker:', err);
      });
  });
}