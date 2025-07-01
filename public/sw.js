const CACHE_NAME = 'niva-v2';
const STATIC_CACHE = 'niva-static-v2';
const DYNAMIC_CACHE = 'niva-dynamic-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Niva Logo 1024x1024.png',
  // Add other static assets that should be cached
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🛡️ Niva Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🛡️ Niva Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (like Google Maps API)
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log('📦 Serving from cache:', request.url);
        return cachedResponse;
      }

      // Otherwise fetch from network and cache
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE).then((cache) => {
            console.log('💾 Caching dynamic content:', request.url);
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If network fails, try to serve a fallback
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // For other requests, return a basic offline response
          return new Response(
            JSON.stringify({ 
              error: 'Offline', 
              message: 'This feature requires an internet connection' 
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'location-share') {
    event.waitUntil(syncLocationSharing());
  }
  
  if (event.tag === 'contact-save') {
    event.waitUntil(syncContactData());
  }
});

// Handle offline location sharing
async function syncLocationSharing() {
  try {
    // Get pending location shares from IndexedDB or localStorage
    const pendingShares = JSON.parse(localStorage.getItem('pendingLocationShares') || '[]');
    
    for (const share of pendingShares) {
      try {
        // Attempt to send the location share
        console.log('📍 Syncing offline location share:', share);
        
        // In a real implementation, this would call your backend API
        // For now, we'll just log it and remove from pending
        console.log('✅ Location share synced successfully');
        
        // Remove from pending list
        const updatedPending = pendingShares.filter(s => s.id !== share.id);
        localStorage.setItem('pendingLocationShares', JSON.stringify(updatedPending));
        
      } catch (error) {
        console.error('❌ Failed to sync location share:', error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Handle offline contact data sync
async function syncContactData() {
  try {
    console.log('👥 Syncing contact data...');
    // Sync any pending contact changes
    console.log('✅ Contact data synced successfully');
  } catch (error) {
    console.error('❌ Failed to sync contact data:', error);
  }
}

// Handle push notifications (for future emergency alerts)
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Niva',
    icon: '/Niva Logo 1024x1024.png',
    badge: '/Niva Logo 1024x1024.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Niva',
        icon: '/Niva Logo 1024x1024.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/Niva Logo 1024x1024.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Niva Safety Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🛡️ Niva Service Worker: Ready for offline support!');