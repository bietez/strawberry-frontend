/* eslint-disable no-restricted-globals */
// service-worker.js

// Usa Workbox no modo "GenerateSW" ou "InjectManifest" (dependendo de sua config).
// Exemplo bem simples (CRA default) - revalidando todo o conteúdo:
import { precacheAndRoute } from 'workbox-precaching';

// Pre-caching dos assets
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    // event.waitUntil(...) se quiser pré-cache manual
  });
  
  self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    // Limpeza de caches antigos se necessário...
  });
  
  self.addEventListener('fetch', (event) => {
    // Pode implementar estratégias de cache (stale-while-revalidate, etc.)
    console.log('[Service Worker] Fetch URL: ', event.request.url);
  });
  