// Service Worker — VasiStore ERP & PDV (PWA)
const CACHE_NAME = 'vasistore-cache-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/logo-vasistore.png',
  '/icon-192.png',
  '/icon-192x192.png',
  '/icon-512.png',
  '/icon-512x512.png',
  '/maskable-icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/favicon.ico',
  '/pdv',
  '/produtos',
  '/dashboard',
  '/caixa',
  '/vendas',
];

// Instalação do Service Worker e pré-cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Alguns assets não puderam ser pré-cacheados:', err);
      });
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Mensagens vindas da aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Interceptação de requisições de rede
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Ignora chamadas externas ou extensões de navegador
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. Navegação de páginas HTML (Network First com Fallback para Cache e Raiz)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const rootFallback = await caches.match('/');
          if (rootFallback) {
            return rootFallback;
          }
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>VasiStore Offline</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center;background:#0f172a;color:#fff;"><h2>VasiStore Offline</h2><p>Você está sem conexão com a internet. Reconecte-se para continuar.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (Imagens, JS, CSS, Fontes): Cache First com revalidação em background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Atualiza o cache em background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

