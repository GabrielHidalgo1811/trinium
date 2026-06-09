/* ========================================
   TRINIUM — sw.js (Service Worker)
   Caching Strategy:
   - Shell assets  → Cache First (HTML, CSS, JS, fonts, images)
   - External CDN  → Stale-While-Revalidate (logos Wikipedia/Unsplash)
   - Navigation    → Network First with offline fallback
   ======================================== */

const CACHE_VERSION   = 'trinium-v1';
const SHELL_CACHE     = `${CACHE_VERSION}-shell`;
const DYNAMIC_CACHE   = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE     = `${CACHE_VERSION}-images`;

/* Assets to pre-cache on install (App Shell) */
const SHELL_ASSETS = [
  '/trinium/',
  '/trinium/index.html',
  '/trinium/styles.css',
  '/trinium/app.js',
  '/trinium/logo.jpg',
  '/trinium/daniel.png',
  '/trinium/jesus.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap',
];

/* Max items in dynamic/image caches */
const MAX_DYNAMIC_ITEMS = 30;
const MAX_IMAGE_ITEMS   = 20;

/* ── INSTALL: pre-cache the App Shell ── */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing — pre-caching shell assets...');
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    }).then(() => {
      console.log('[SW] Shell cached ✓');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

/* ── ACTIVATE: clean up old caches ── */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating — cleaning old caches...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('trinium-') && key !== SHELL_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim()) // Take control of all clients
  );
});

/* ── FETCH: apply routing strategies ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* 1. External image CDNs (Wikipedia logos, Unsplash) → Stale-While-Revalidate */
  if (
    url.hostname.includes('wikimedia.org') ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, MAX_IMAGE_ITEMS));
    return;
  }

  /* 2. Google Fonts → Cache First (they never change once fetched) */
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  /* 3. Shell assets (same-origin HTML/CSS/JS/images) → Cache First */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  /* 4. Everything else → Network First with dynamic cache fallback */
  event.respondWith(networkFirst(request, DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS));
});

/* ════════════════════════════════════════
   STRATEGY HELPERS
════════════════════════════════════════ */

/**
 * Cache First — serve from cache, fall back to network.
 * Ideal for: static shell assets, fonts.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — recurso no disponible', { status: 503 });
  }
}

/**
 * Network First — try network, fall back to cache.
 * Ideal for: navigation requests (fresh HTML always preferred).
 */
async function networkFirst(request, cacheName, maxItems) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await trimCache(cacheName, maxItems);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/trinium/index.html');
  }
}

/**
 * Stale-While-Revalidate — serve cache immediately, update in background.
 * Ideal for: external logos, partner images — fast load + stays fresh.
 */
async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(cacheName, maxItems);
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

/**
 * Trim cache to maxItems (FIFO).
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}
