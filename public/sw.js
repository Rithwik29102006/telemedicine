// Service Worker for handling background notifications and offline functionality

const CACHE_NAME = 'healthcare-portal-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for emergency requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'emergency-sync') {
    event.waitUntil(syncEmergencyRequests());
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle different notification types
  if (event.notification.tag.startsWith('reminder-')) {
    // Open app and focus on reminders
    event.waitUntil(
      clients.openWindow('/?reminder=' + event.notification.tag)
    );
  } else if (event.notification.tag === 'emergency') {
    // Open app and focus on emergency
    event.waitUntil(
      clients.openWindow('/?emergency=true')
    );
  }
});

// Push event for server-sent notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: data.tag,
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Sync emergency requests when back online
async function syncEmergencyRequests() {
  try {
    // Get pending emergency requests from IndexedDB
    const db = await openDB();
    const tx = db.transaction(['emergencyRequests'], 'readonly');
    const store = tx.objectStore('emergencyRequests');
    const requests = await store.getAll();
    
    // Send each request to the server
    for (const request of requests) {
      try {
        const response = await fetch('/api/emergency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.data)
        });
        
        if (response.ok) {
          // Remove from local storage after successful sync
          const deleteTx = db.transaction(['emergencyRequests'], 'readwrite');
          const deleteStore = deleteTx.objectStore('emergencyRequests');
          await deleteStore.delete(request.id);
        }
      } catch (error) {
        console.error('Failed to sync emergency request:', error);
      }
    }
  } catch (error) {
    console.error('Failed to sync emergency requests:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HealthcarePortalDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('emergencyRequests')) {
        db.createObjectStore('emergencyRequests', { keyPath: 'id' });
      }
    };
  });
}