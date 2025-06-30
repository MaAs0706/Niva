import React, { createContext, useContext, useState, useEffect } from 'react';

interface SessionState {
  isActive: boolean;
  startTime: number | null;
  lastPing: number | null;
  checkInInterval: number; // minutes
  pingInterval: number; // minutes
  lastCheckIn: number | null;
}

interface SessionContextType {
  session: SessionState;
  startSession: (checkInInterval?: number) => void;
  endSession: () => void;
  updatePing: () => void;
  updateCheckIn: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionState>({
    isActive: false,
    startTime: null,
    lastPing: null,
    checkInInterval: 15, // 15 minutes default
    pingInterval: 3, // 3 minutes
    lastCheckIn: null,
  });

  useEffect(() => {
    // Load session from localStorage on mount
    const savedSession = localStorage.getItem('activeSession');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setSession(parsedSession);
    }
  }, []);

  useEffect(() => {
    // Save session to localStorage whenever it changes
    if (session.isActive) {
      localStorage.setItem('activeSession', JSON.stringify(session));
    }
  }, [session]);

  const startSession = (checkInInterval = 15) => {
    const now = Date.now();
    setSession({
      ...session,
      isActive: true,
      startTime: now,
      lastPing: now,
      lastCheckIn: now,
      checkInInterval,
    });
  };

  const endSession = () => {
    setSession({
      ...session,
      isActive: false,
      startTime: null,
      lastPing: null,
      lastCheckIn: null,
    });
    localStorage.removeItem('activeSession');
  };

  const updatePing = () => {
    setSession(prev => ({
      ...prev,
      lastPing: Date.now(),
    }));
  };

  const updateCheckIn = () => {
    setSession(prev => ({
      ...prev,
      lastCheckIn: Date.now(),
    }));
  };

  return (
    <SessionContext.Provider value={{ session, startSession, endSession, updatePing, updateCheckIn }}>
      {children}
    </SessionContext.Provider>
  );
};