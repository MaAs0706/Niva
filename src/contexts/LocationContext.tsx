import React, { createContext, useContext, useState, useEffect } from 'react';
import { shareLocationWithContacts } from '../utils/locationSharing';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationContextType {
  currentLocation: LocationData | null;
  locationHistory: LocationData[];
  error: string | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  shareLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentPosition = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
          };
          resolve(locationData);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setIsTracking(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        };
        
        setCurrentLocation(locationData);
        setLocationHistory(prev => [...prev.slice(-20), locationData]); // Keep last 20 locations
        setError(null);
      },
      (error) => {
        setError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const shareLocation = async (): Promise<void> => {
    try {
      const location = await getCurrentPosition();
      setCurrentLocation(location);
      
      // Share location with trusted contacts
      const userName = 'Niva User'; // In a real app, get from user profile
      await shareLocationWithContacts(location, userName);
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Location Shared ✨', {
          body: `Location shared with your circle at ${new Date().toLocaleTimeString()}`,
          icon: '/Niva Logo 1024x1024.png'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
      throw err;
    }
  };

  useEffect(() => {
    // Request notification permission (this is allowed without user gesture)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <LocationContext.Provider value={{
      currentLocation,
      locationHistory,
      error,
      isTracking,
      startTracking,
      stopTracking,
      shareLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};