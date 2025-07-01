import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  isAppCached: boolean;
  pendingActions: any[];
  addPendingAction: (action: any) => void;
  clearPendingActions: () => void;
  syncPendingActions: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAppCached, setIsAppCached] = useState(false);
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  useEffect(() => {
    // Load pending actions from localStorage
    const saved = localStorage.getItem('pendingOfflineActions');
    if (saved) {
      try {
        setPendingActions(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load pending actions:', error);
      }
    }

    // Check if app is cached (service worker available)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsAppCached(true);
        console.log('🛡️ Niva: App is cached and ready for offline use!');
      });
    }

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('🌐 Niva: Back online!');
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      console.log('📴 Niva: Gone offline - switching to offline mode');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pendingOfflineActions', JSON.stringify(pendingActions));
  }, [pendingActions]);

  const addPendingAction = (action: any) => {
    const actionWithId = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    
    setPendingActions(prev => [...prev, actionWithId]);
    console.log('📝 Added pending offline action:', actionWithId.type);

    // Try to sync immediately if online
    if (isOnline) {
      syncPendingActions();
    }
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    localStorage.removeItem('pendingOfflineActions');
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    console.log(`🔄 Syncing ${pendingActions.length} pending actions...`);

    const successfulActions: string[] = [];

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'location-share':
            // Simulate location sharing
            console.log('📍 Syncing location share:', action.data);
            successfulActions.push(action.id);
            break;

          case 'contact-save':
            // Simulate contact saving
            console.log('👥 Syncing contact save:', action.data);
            successfulActions.push(action.id);
            break;

          case 'route-save':
            // Simulate route saving
            console.log('🗺️ Syncing route save:', action.data);
            successfulActions.push(action.id);
            break;

          case 'session-data':
            // Simulate session data sync
            console.log('🛡️ Syncing session data:', action.data);
            successfulActions.push(action.id);
            break;

          default:
            console.log('❓ Unknown action type:', action.type);
            successfulActions.push(action.id); // Remove unknown actions
        }
      } catch (error) {
        console.error(`❌ Failed to sync action ${action.id}:`, error);
      }
    }

    // Remove successfully synced actions
    if (successfulActions.length > 0) {
      setPendingActions(prev => 
        prev.filter(action => !successfulActions.includes(action.id))
      );
      console.log(`✅ Successfully synced ${successfulActions.length} actions`);
    }
  };

  return (
    <OfflineContext.Provider value={{
      isOnline,
      isAppCached,
      pendingActions,
      addPendingAction,
      clearPendingActions,
      syncPendingActions
    }}>
      {children}
    </OfflineContext.Provider>
  );
};