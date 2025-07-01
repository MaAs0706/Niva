// Enhanced offline storage utilities for Niva

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount?: number;
}

/**
 * Store data locally with offline support
 */
export const storeOfflineData = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Stored offline data: ${key}`);
  } catch (error) {
    console.error(`❌ Failed to store offline data for ${key}:`, error);
  }
};

/**
 * Retrieve data from local storage
 */
export const getOfflineData = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`❌ Failed to retrieve offline data for ${key}:`, error);
  }
  return defaultValue;
};

/**
 * Queue an action for offline sync
 */
export const queueOfflineAction = (type: string, data: any): void => {
  const action: OfflineAction = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    data,
    timestamp: Date.now(),
    retryCount: 0
  };

  const pendingActions = getOfflineData<OfflineAction[]>('pendingOfflineActions', []);
  pendingActions.push(action);
  storeOfflineData('pendingOfflineActions', pendingActions);

  console.log(`📝 Queued offline action: ${type}`);

  // Trigger background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(type);
    }).catch((error) => {
      console.error('❌ Background sync registration failed:', error);
    });
  }
};

/**
 * Enhanced location sharing with offline support
 */
export const shareLocationOffline = async (
  location: { latitude: number; longitude: number; timestamp: number },
  userName: string,
  contacts: any[],
  sessionData?: any
): Promise<void> => {
  console.log('📍 OFFLINE LOCATION SHARING');
  console.log('============================');
  
  // Store location data locally
  const locationData = {
    location,
    userName,
    contacts,
    sessionData,
    timestamp: Date.now()
  };

  // Save to local storage immediately
  const locationHistory = getOfflineData<any[]>('offlineLocationHistory', []);
  locationHistory.push(locationData);
  
  // Keep only last 50 locations to prevent storage bloat
  if (locationHistory.length > 50) {
    locationHistory.splice(0, locationHistory.length - 50);
  }
  
  storeOfflineData('offlineLocationHistory', locationHistory);

  // Queue for sync when online
  queueOfflineAction('location-share', locationData);

  console.log(`💾 Location stored offline for ${contacts.length} contacts`);
  console.log('📡 Will sync when connection is restored');
  console.log('============================\n');

  // Show offline notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Location Saved Offline 📴', {
      body: `Location saved locally. Will share with ${contacts.length} contacts when online.`,
      icon: '/Niva Logo 1024x1024.png'
    });
  }
};

/**
 * Save contact data with offline support
 */
export const saveContactOffline = (contact: any): void => {
  console.log('👥 OFFLINE CONTACT SAVE');
  console.log('=======================');
  
  // Save to local storage immediately
  const contacts = getOfflineData<any[]>('trustedContacts', []);
  const existingIndex = contacts.findIndex(c => c.id === contact.id);
  
  if (existingIndex >= 0) {
    contacts[existingIndex] = contact;
    console.log(`✏️ Updated contact: ${contact.name}`);
  } else {
    contacts.push(contact);
    console.log(`➕ Added new contact: ${contact.name}`);
  }
  
  storeOfflineData('trustedContacts', contacts);

  // Queue for sync when online
  queueOfflineAction('contact-save', contact);

  console.log('💾 Contact saved offline');
  console.log('📡 Will sync when connection is restored');
  console.log('=======================\n');
};

/**
 * Save route data with offline support
 */
export const saveRouteOffline = (route: any): void => {
  console.log('🗺️ OFFLINE ROUTE SAVE');
  console.log('=====================');
  
  // Save to local storage immediately
  const routes = getOfflineData<any[]>('savedRoutes', []);
  const existingIndex = routes.findIndex(r => r.id === route.id);
  
  if (existingIndex >= 0) {
    routes[existingIndex] = route;
    console.log(`✏️ Updated route: ${route.name}`);
  } else {
    routes.push(route);
    console.log(`➕ Added new route: ${route.name}`);
  }
  
  storeOfflineData('savedRoutes', routes);

  // Queue for sync when online
  queueOfflineAction('route-save', route);

  console.log('💾 Route saved offline');
  console.log('📡 Will sync when connection is restored');
  console.log('=====================\n');
};

/**
 * Save session data with offline support
 */
export const saveSessionOffline = (sessionData: any): void => {
  console.log('🛡️ OFFLINE SESSION SAVE');
  console.log('=======================');
  
  // Save to local storage immediately
  storeOfflineData('activeSession', sessionData);

  // Queue for sync when online
  queueOfflineAction('session-data', sessionData);

  console.log('💾 Session data saved offline');
  console.log('📡 Will sync when connection is restored');
  console.log('=======================\n');
};

/**
 * Check if the app can work offline
 */
export const isOfflineCapable = (): boolean => {
  return 'serviceWorker' in navigator && 'localStorage' in window;
};

/**
 * Get offline status information
 */
export const getOfflineStatus = () => {
  const pendingActions = getOfflineData<OfflineAction[]>('pendingOfflineActions', []);
  const locationHistory = getOfflineData<any[]>('offlineLocationHistory', []);
  
  return {
    isOnline: navigator.onLine,
    isOfflineCapable: isOfflineCapable(),
    pendingActionsCount: pendingActions.length,
    offlineLocationsCount: locationHistory.length,
    lastOfflineAction: pendingActions.length > 0 ? pendingActions[pendingActions.length - 1] : null
  };
};

/**
 * Clear all offline data (for testing or reset)
 */
export const clearOfflineData = (): void => {
  const offlineKeys = [
    'pendingOfflineActions',
    'offlineLocationHistory'
  ];
  
  offlineKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('🗑️ Cleared all offline data');
};