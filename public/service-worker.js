// public/service-worker.js

const CACHE_NAME = 'freshrescue-v1';

// Lors de l'installation, on peut mettre en cache des pages (optionnel)
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installé');
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activé');
});

// Intercepter les requêtes pour que l'app soit "Installable"
self.addEventListener('fetch', (event) => {
  // On laisse passer les requêtes normalement
  event.respondWith(fetch(event.request));
});

// ÉCOUTER LES NOTIFICATIONS PUSH (C'est ici que la magie opérera)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'FreshRescue', body: 'Nouvelle offre disponible !' };
  
  const options = {
    body: data.body,
    icon: '/logo192.png', // Assure-toi d'avoir cette image dans public
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Quand l'utilisateur clique sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});