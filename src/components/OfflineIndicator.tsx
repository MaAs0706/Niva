import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Download, Sync } from 'lucide-react';
import { useOffline } from '../contexts/OfflineContext';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isAppCached, pendingActions, syncPendingActions } = useOffline();

  // Don't show anything if online and no pending actions
  if (isOnline && pendingActions.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-40 pointer-events-none">
      <div className="max-w-md mx-auto">
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="pointer-events-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl border backdrop-blur-sm mb-3">
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <WifiOff className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-lg leading-tight">
                    You're Offline
                  </h4>
                  <p className="text-white opacity-90 text-sm leading-relaxed mt-1">
                    {isAppCached 
                      ? "Don't worry! Niva works offline. Your data is safe and will sync when you're back online."
                      : "Some features may be limited without an internet connection."
                    }
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  {isAppCached ? (
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CloudOff className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Actions Indicator */}
        {pendingActions.length > 0 && (
          <div className="pointer-events-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow-2xl border backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sync className="w-5 h-5 text-white animate-spin" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-lg leading-tight">
                    {pendingActions.length} Action{pendingActions.length !== 1 ? 's' : ''} Pending
                  </h4>
                  <p className="text-white opacity-90 text-sm leading-relaxed mt-1">
                    {isOnline 
                      ? "Syncing your data now..."
                      : "Will sync when you're back online"
                    }
                  </p>
                </div>
                
                {isOnline && (
                  <button
                    onClick={syncPendingActions}
                    className="flex-shrink-0 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
                  >
                    <Cloud className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;