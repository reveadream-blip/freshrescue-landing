// public/service-worker.js
const CACHE_NAME = 'freshrescue-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo192.png',
  '/manifest.json'
];

// 1. INSTALLATION : Mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATION : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activé');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. STRATÉGIE DE FETCH : Réseau d'abord, sinon Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 4. RÉCEPTION DES NOTIFICATIONS PUSH
self.addEventListener('push', (event) => {
  let data = { 
    title: 'FreshRescue', 
    body: 'Une nouvelle offre est disponible !',
    url: '/explore'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Si les données ne sont pas du JSON, on utilise le texte brut
      data = { ...data, body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/logo192.png', // Doit exister dans ton dossier public
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    tag: 'freshrescue-notification', // Évite d'empiler 50 notifications
    renotify: true,
    data: {
      url: data.url || '/explore'
    },
    actions: [
      { action: 'open', title: 'Voir l\'offre' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. CLIC SUR LA NOTIFICATION
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // On récupère l'URL transmise ou on va sur /explore par défaut
  const urlToOpen = event.notification.data.url || '/explore';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si l'app est déjà ouverte, on focus dessus
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});