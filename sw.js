const CACHE_NAME = 'antro-tech-group-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Принудительно активируем новый Service Worker
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Принудительно берем контроль над всеми страницами
      return self.clients.claim();
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Проверяем, что запрос не от расширения браузера - В САМОМ НАЧАЛЕ
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('moz-extension://') ||
      event.request.url.startsWith('safari-extension://') ||
      event.request.url.startsWith('edge-extension://') ||
      event.request.url.startsWith('chrome://') ||
      event.request.url.startsWith('moz://') ||
      event.request.url.startsWith('about:')) {
    // Просто пропускаем эти запросы без кэширования
    return;
  }

  // Проверяем, что это HTTP/HTTPS запрос
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // В режиме разработки не кэшируем JS/CSS файлы
  if (event.request.url.includes('localhost') && 
      (event.request.url.includes('.js') || event.request.url.includes('.css'))) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированную версию или делаем запрос
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Проверяем, что получили валидный ответ
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Клонируем ответ
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.log('Cache put failed:', error);
            });

          return response;
        });
      })
      .catch(() => {
        // Если нет сети и нет кэша, показываем офлайн страницу
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Обработка push уведомлений (для будущего использования)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от АнроТехГрупп',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('АнроТехГрупп', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
