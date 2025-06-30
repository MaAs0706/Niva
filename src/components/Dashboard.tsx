import React, { useState, useEffect } from 'react';
import { Play, Shield, Clock, MapPin, Users, Heart, Sparkles, Route, Settings, Timer } from 'lucide-react';
import QuickStartSessions from './QuickStartSessions';
import SessionCreator from './SessionCreator';
import SessionDurationModal from './SessionDurationModal';

interface SavedRoute {
  id: string;
  name: string;
  description: string;
  startLocation: { lat: number; lng: number; name?: string };
  endLocation: { lat: number; lng: number; name?: string };
  estimatedTime: number;
  icon: string;
  color: string;
  waypoints?: { lat: number; lng: number; name?: string }[];
}

interface CustomSession {
  id: string;
  name: string;
  description: string;
  checkInInterval: number;
  pingInterval: number;
  autoStart: boolean;
  selectedRoute?: {
    id: string;
    name: string;
    estimatedTime: number;
  };
  selectedContacts: string[];
  createdAt: number;
  lastUsed?: number;
  sessionDuration?: number; // in minutes
}

interface DashboardProps {
  onStartSession: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartSession }) => {
  const [trustedContacts, setTrustedContacts] = useState<any[]>([]);
  const [lastSession, setLastSession] = useState<string | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [customSessions, setCustomSessions] = useState<CustomSession[]>([]);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showSessionCreator, setShowSessionCreator] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [pendingSessionType, setPendingSessionType] = useState<'quick' | 'route' | null>(null);
  const [pendingRoute, setPendingRoute] = useState<SavedRoute | null>(null);

  useEffect(() => {
    // Load trusted contacts
    const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
    setTrustedContacts(contacts);

    // Load saved routes
    const routes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    setSavedRoutes(routes);

    // Load custom sessions
    const sessions = JSON.parse(localStorage.getItem('customSessions') || '[]');
    setCustomSessions(sessions);

    // Load last session info
    const lastSessionData = localStorage.getItem('lastSessionEnd');
    if (lastSessionData) {
      setLastSession(new Date(parseInt(lastSessionData)).toLocaleDateString());
    }
  }, []);

  const handleQuickStart = () => {
    if (trustedContacts.length === 0) {
      alert('Let\'s add some wonderful people to your circle first! They\'ll be here to support you. 💝');
      return;
    }
    
    // Show duration modal for quick start
    setPendingSessionType('quick');
    setShowDurationModal(true);
  };

  const handleRouteSession = (route: SavedRoute) => {
    if (trustedContacts.length === 0) {
      alert('Let\'s add some wonderful people to your circle first! They\'ll be here to support you. 💝');
      return;
    }
    
    // Show duration modal for route session
    setPendingSessionType('route');
    setPendingRoute(route);
    setShowDurationModal(true);
  };

  const handleStartSessionWithDuration = (duration?: number) => {
    const now = Date.now();
    let sessionData: any = {
      isActive: true,
      startTime: now,
      lastPing: now,
      lastCheckIn: now,
      checkInInterval: 15,
      pingInterval: 3,
      sessionDuration: duration, // in minutes
      endTime: duration ? now + (duration * 60 * 1000) : null
    };

    if (pendingSessionType === 'route' && pendingRoute) {
      sessionData = {
        ...sessionData,
        checkInInterval: Math.max(5, Math.floor(pendingRoute.estimatedTime / 3)),
        selectedRoute: pendingRoute
      };
    }
    
    localStorage.setItem('activeSession', JSON.stringify(sessionData));
    
    // Reset pending state
    setPendingSessionType(null);
    setPendingRoute(null);
    setShowDurationModal(false);
    
    onStartSession();
  };

  const handleCustomSessionStart = (session: CustomSession) => {
    if (trustedContacts.length === 0) {
      alert('Let\'s add some wonderful people to your circle first! They\'ll be here to support you. 💝');
      return;
    }

    const now = Date.now();
    // Store the custom session data
    const sessionData = {
      isActive: true,
      startTime: now,
      lastPing: now,
      lastCheckIn: now,
      checkInInterval: session.checkInInterval,
      pingInterval: session.pingInterval,
      selectedRoute: session.selectedRoute ? savedRoutes.find(r => r.id === session.selectedRoute?.id) : undefined,
      customSession: session,
      sessionDuration: session.sessionDuration,
      endTime: session.sessionDuration ? now + (session.sessionDuration * 60 * 1000) : null
    };
    
    localStorage.setItem('activeSession', JSON.stringify(sessionData));
    onStartSession();
  };

  const handleCreateCustomSession = (session: CustomSession) => {
    setCustomSessions([...customSessions, session]);
  };

  if (showDurationModal) {
    return (
      <SessionDurationModal
        onConfirm={handleStartSessionWithDuration}
        onCancel={() => {
          setShowDurationModal(false);
          setPendingSessionType(null);
          setPendingRoute(null);
        }}
        sessionType={pendingSessionType === 'route' ? 'route' : 'quick'}
        routeName={pendingRoute?.name}
      />
    );
  }

  if (showSessionCreator) {
    return (
      <SessionCreator
        onCreateSession={handleCreateCustomSession}
        onStartSession={handleCustomSessionStart}
        onClose={() => setShowSessionCreator(false)}
      />
    );
  }

  if (showQuickStart && savedRoutes.length > 0) {
    return (
      <div className="p-6 pb-28">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Quick Start</h2>
            <p className="text-slate-600 leading-relaxed">Choose a saved route for your journey</p>
          </div>
          <button
            onClick={() => setShowQuickStart(false)}
            className="text-slate-500 hover:text-slate-700 font-medium"
          >
            Back
          </button>
        </div>
        <QuickStartSessions onStartSession={handleRouteSession} />
      </div>
    );
  }

  return (
    <div className="p-6 pb-28">
      {/* Welcome Message */}
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30 dark:from-slate-800 dark:via-purple-900/20 dark:to-teal-900/20 rounded-3xl shadow-lg p-8 mb-8 border border-purple-100/50 dark:border-slate-700/50 backdrop-blur-sm transition-colors duration-300">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Welcome home</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg transition-colors duration-300">I'm here to keep you safe, supported, and connected to the people who love you most.</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Sparkles className="w-5 h-5 text-purple-400 dark:text-purple-500 transition-colors duration-300" />
            <span className="text-purple-600 dark:text-purple-400 font-medium transition-colors duration-300">You're never alone</span>
            <Sparkles className="w-5 h-5 text-purple-400 dark:text-purple-500 transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* Quick Start Options - Perfect Balance of Color and Elegance */}
      <div className="space-y-4 mb-8">
        {/* Regular Quick Start - Subtle Purple Gradient */}
        <button
          onClick={handleQuickStart}
          className="w-full bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-purple-900/20 dark:via-slate-800 dark:to-purple-900/10 border border-purple-200/60 dark:border-purple-700/40 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] group hover:from-purple-100 hover:to-purple-50 dark:hover:from-purple-900/30 dark:hover:to-purple-900/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg group-hover:from-purple-500 group-hover:to-purple-700 transition-all duration-300">
                <Play className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 transition-colors duration-300">Start your journey</div>
                <div className="text-purple-600 dark:text-purple-400 text-base font-medium transition-colors duration-300">I'll be right here with you</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <Timer className="w-5 h-5" />
                <span className="text-sm font-medium">Optional duration</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-3 h-3 bg-purple-400 dark:bg-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </button>

        {/* Custom Sessions - Subtle Indigo Gradient */}
        <button
          onClick={() => setShowSessionCreator(true)}
          className="w-full bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 dark:from-indigo-900/20 dark:via-slate-800 dark:to-indigo-900/10 border border-indigo-200/60 dark:border-indigo-700/40 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] group hover:from-indigo-100 hover:to-indigo-50 dark:hover:from-indigo-900/30 dark:hover:to-indigo-900/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="p-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl shadow-lg group-hover:from-indigo-500 group-hover:to-indigo-700 transition-all duration-300">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 transition-colors duration-300">Custom sessions</div>
                <div className="text-indigo-600 dark:text-indigo-400 text-base font-medium transition-colors duration-300">
                  {customSessions.length > 0 
                    ? `${customSessions.length} saved session${customSessions.length !== 1 ? 's' : ''}`
                    : 'Create personalized experiences'
                  }
                </div>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-3 h-3 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </button>

        {/* Route-based Quick Start - Subtle Teal Gradient */}
        {savedRoutes.length > 0 && (
          <button
            onClick={() => setShowQuickStart(true)}
            className="w-full bg-gradient-to-br from-teal-50 via-white to-teal-50/50 dark:from-teal-900/20 dark:via-slate-800 dark:to-teal-900/10 border border-teal-200/60 dark:border-teal-700/40 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] group hover:from-teal-100 hover:to-teal-50 dark:hover:from-teal-900/30 dark:hover:to-teal-900/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-lg group-hover:from-teal-500 group-hover:to-teal-700 transition-all duration-300">
                  <Route className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 transition-colors duration-300">Quick start with route</div>
                  <div className="text-teal-600 dark:text-teal-400 text-base font-medium transition-colors duration-300">{savedRoutes.length} saved route{savedRoutes.length !== 1 ? 's' : ''} ready</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-medium">Optional duration</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-3 h-3 bg-teal-400 dark:bg-teal-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-2xl transition-colors duration-300">
              <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{trustedContacts.length}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold transition-colors duration-300">Loving Circle</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-2xl transition-colors duration-300">
              <Settings className="w-7 h-7 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{customSessions.length}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold transition-colors duration-300">Custom Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Custom Sessions */}
      {customSessions.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6 text-xl flex items-center space-x-3 transition-colors duration-300">
            <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400 transition-colors duration-300" />
            <span>Recent Custom Sessions</span>
          </h3>
          <div className="space-y-4">
            {customSessions
              .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
              .slice(0, 2)
              .map((session) => (
                <div key={session.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">{session.name}</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm transition-colors duration-300">{session.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                        <span>Check-in: {session.checkInInterval}m</span>
                        <span>Updates: {session.pingInterval}m</span>
                        <span>{session.selectedContacts.length} contacts</span>
                        {session.sessionDuration && (
                          <span className="flex items-center space-x-1">
                            <Timer className="w-3 h-3" />
                            <span>{session.sessionDuration}m duration</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCustomSessionStart(session)}
                      className="bg-gradient-to-r from-purple-400 to-teal-500 text-white p-3 rounded-2xl hover:shadow-lg transition-all duration-200"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Gentle Reminders */}
      <div className="bg-gradient-to-r from-purple-50/80 to-teal-50/80 dark:from-purple-900/20 dark:to-teal-900/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/50 dark:border-purple-800/50 mb-8 shadow-lg transition-colors duration-300">
        <div className="flex items-start space-x-5">
          <div className="p-3 bg-gradient-to-br from-purple-200 to-teal-200 dark:from-purple-800 dark:to-teal-800 rounded-2xl transition-colors duration-300">
            <Heart className="w-6 h-6 text-purple-700 dark:text-purple-300 transition-colors duration-300" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-4 text-xl transition-colors duration-300">Gentle reminders</h3>
            <ul className="text-purple-800 dark:text-purple-200 space-y-3 leading-relaxed transition-colors duration-300">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>Add people who care about you to your circle</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>Create custom sessions for different situations</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>Set session durations for automatic safety checks</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full transition-colors duration-300"></div>
                <span>Remember, you're surrounded by love</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Setup Guidance */}
      {trustedContacts.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/50 rounded-3xl p-8 shadow-lg mb-8 transition-colors duration-300">
          <div className="flex items-center space-x-5">
            <div className="p-3 bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 rounded-2xl transition-colors duration-300">
              <Users className="w-6 h-6 text-indigo-700 dark:text-indigo-300 transition-colors duration-300" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2 text-xl transition-colors duration-300">Build your loving circle</h3>
              <p className="text-indigo-700 dark:text-indigo-200 leading-relaxed transition-colors duration-300">
                Add the special people who care about you. They'll be gently notified if you need support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Sessions Guidance */}
      {customSessions.length === 0 && (
        <div className="bg-gradient-to-r from-teal-50/80 to-cyan-50/80 dark:from-teal-900/20 dark:to-cyan-900/20 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 rounded-3xl p-8 shadow-lg transition-colors duration-300">
          <div className="flex items-center space-x-5">
            <div className="p-3 bg-gradient-to-br from-teal-200 to-cyan-200 dark:from-teal-800 dark:to-cyan-800 rounded-2xl transition-colors duration-300">
              <Settings className="w-6 h-6 text-teal-700 dark:text-teal-300 transition-colors duration-300" />
            </div>
            <div>
              <h3 className="font-bold text-teal-900 dark:text-teal-100 mb-2 text-xl transition-colors duration-300">Create your first custom session</h3>
              <p className="text-teal-700 dark:text-teal-200 leading-relaxed transition-colors duration-300">
                Set up personalized companion sessions with custom timing, specific contacts, routes, and automatic duration limits for different situations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;