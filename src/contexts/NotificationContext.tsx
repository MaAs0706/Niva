import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, MapPin, Heart, Shield, Users } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'location' | 'safety';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  showLocationShared: (contactCount: number) => void;
  showCheckInSent: () => void;
  showEmergencyAlert: () => void;
  showSessionStarted: (duration?: number) => void;
  showSessionEnded: () => void;
  showSafetyCheck: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Convenience methods for common notifications
  const showLocationShared = useCallback((contactCount: number) => {
    addNotification({
      type: 'location',
      title: 'Location Shared ✨',
      message: `Your location has been shared with ${contactCount} trusted contact${contactCount !== 1 ? 's' : ''}`,
      duration: 4000
    });
  }, [addNotification]);

  const showCheckInSent = useCallback(() => {
    addNotification({
      type: 'success',
      title: 'Check-in Sent 💝',
      message: 'Your trusted circle knows you\'re doing well',
      duration: 3000
    });
  }, [addNotification]);

  const showEmergencyAlert = useCallback(() => {
    addNotification({
      type: 'safety',
      title: 'Emergency Alert Sent 🚨',
      message: 'Your trusted contacts have been notified immediately',
      duration: 6000
    });
  }, [addNotification]);

  const showSessionStarted = useCallback((duration?: number) => {
    const message = duration 
      ? `Companion session started for ${Math.floor(duration / 60)}h ${duration % 60}m`
      : 'Companion session started - I\'m watching over you';
    
    addNotification({
      type: 'success',
      title: 'Session Started 🛡️',
      message,
      duration: 4000
    });
  }, [addNotification]);

  const showSessionEnded = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Session Ended',
      message: 'Your companion session has been completed safely',
      duration: 3000
    });
  }, [addNotification]);

  const showSafetyCheck = useCallback(() => {
    addNotification({
      type: 'safety',
      title: 'Safety Check Required',
      message: 'Please respond to confirm you\'re okay',
      duration: 8000
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      showLocationShared,
      showCheckInSent,
      showEmergencyAlert,
      showSessionStarted,
      showSessionEnded,
      showSafetyCheck
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'location': return MapPin;
      case 'safety': return Shield;
      default: return Info;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': 
        return {
          bg: 'from-emerald-500 to-teal-500',
          border: 'border-emerald-200 dark:border-emerald-700',
          text: 'text-white'
        };
      case 'error': 
        return {
          bg: 'from-red-500 to-rose-500',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-white'
        };
      case 'location': 
        return {
          bg: 'from-blue-500 to-indigo-500',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-white'
        };
      case 'safety': 
        return {
          bg: 'from-orange-500 to-red-500',
          border: 'border-orange-200 dark:border-orange-700',
          text: 'text-white'
        };
      default: 
        return {
          bg: 'from-purple-500 to-indigo-500',
          border: 'border-purple-200 dark:border-purple-700',
          text: 'text-white'
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none">
      <div className="max-w-md mx-auto space-y-3">
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const colors = getColors(notification.type);
          
          return (
            <div
              key={notification.id}
              className={`pointer-events-auto bg-gradient-to-r ${colors.bg} ${colors.border} rounded-2xl shadow-2xl border backdrop-blur-sm transform transition-all duration-300 animate-in slide-in-from-top-2`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold ${colors.text} text-lg leading-tight`}>
                      {notification.title}
                    </h4>
                    <p className={`${colors.text} opacity-90 text-sm leading-relaxed mt-1`}>
                      {notification.message}
                    </p>
                    
                    {notification.action && (
                      <button
                        onClick={notification.action.onClick}
                        className="mt-3 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                      >
                        {notification.action.label}
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};