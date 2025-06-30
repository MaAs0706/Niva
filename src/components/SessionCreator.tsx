import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  MapPin, 
  Play, 
  Save, 
  X, 
  Heart,
  Route,
  Settings,
  Timer,
  Bell,
  Shield,
  Edit,
  Camera,
  Video,
  Infinity
} from 'lucide-react';
import CameraRecorder from './CameraRecorder';

interface CustomSession {
  id: string;
  name: string;
  description: string;
  checkInInterval: number; // minutes
  pingInterval: number; // minutes
  autoStart: boolean;
  selectedRoute?: {
    id: string;
    name: string;
    estimatedTime: number;
  };
  selectedContacts: string[]; // contact IDs
  createdAt: number;
  lastUsed?: number;
  sessionDuration?: number; // in minutes
}

interface SessionCreatorProps {
  onCreateSession: (session: CustomSession) => void;
  onStartSession: (session: CustomSession) => void;
  onClose: () => void;
}

const SessionCreator: React.FC<SessionCreatorProps> = ({ onCreateSession, onStartSession, onClose }) => {
  const [sessions, setSessions] = useState<CustomSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  
  const [newSession, setNewSession] = useState<Partial<CustomSession>>({
    name: '',
    description: '',
    checkInInterval: 15,
    pingInterval: 3,
    autoStart: false,
    selectedContacts: [],
    sessionDuration: undefined,
  });

  useEffect(() => {
    // Load saved sessions
    const savedSessions = localStorage.getItem('customSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    // Load contacts and routes
    const savedContacts = localStorage.getItem('trustedContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    const savedRoutes = localStorage.getItem('savedRoutes');
    if (savedRoutes) {
      setRoutes(JSON.parse(savedRoutes));
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('customSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleCreateSession = () => {
    // More lenient validation - only require name
    if (!newSession.name?.trim()) {
      alert('Please provide a session name');
      return;
    }

    // If no contacts are selected, use all available contacts
    const finalSelectedContacts = newSession.selectedContacts && newSession.selectedContacts.length > 0 
      ? newSession.selectedContacts 
      : contacts.map(c => c.id);

    if (finalSelectedContacts.length === 0) {
      alert('Please add some contacts in the Circle section first, or this session won\'t be able to notify anyone.');
      return;
    }

    const session: CustomSession = {
      id: editingSession || Date.now().toString(),
      name: newSession.name.trim(),
      description: newSession.description?.trim() || '',
      checkInInterval: newSession.checkInInterval || 15,
      pingInterval: newSession.pingInterval || 3,
      autoStart: newSession.autoStart || false,
      selectedRoute: newSession.selectedRoute,
      selectedContacts: finalSelectedContacts,
      sessionDuration: newSession.sessionDuration,
      createdAt: editingSession ? sessions.find(s => s.id === editingSession)?.createdAt || Date.now() : Date.now(),
    };

    // Update sessions state
    let updatedSessions;
    if (editingSession) {
      updatedSessions = sessions.map(s => s.id === editingSession ? session : s);
    } else {
      updatedSessions = [...sessions, session];
    }
    
    setSessions(updatedSessions);
    
    // Immediately save to localStorage
    localStorage.setItem('customSessions', JSON.stringify(updatedSessions));
    
    // Call the parent callback
    onCreateSession(session);
    
    // Reset form
    setNewSession({
      name: '',
      description: '',
      checkInInterval: 15,
      pingInterval: 3,
      autoStart: false,
      selectedContacts: [],
      sessionDuration: undefined,
    });
    setIsCreating(false);
    setEditingSession(null);
    setShowCustomDuration(false);

    // Auto-start if enabled
    if (session.autoStart) {
      handleStartSession(session);
    }
  };

  const handleEditSession = (session: CustomSession) => {
    setNewSession({
      name: session.name,
      description: session.description,
      checkInInterval: session.checkInInterval,
      pingInterval: session.pingInterval,
      autoStart: session.autoStart,
      selectedRoute: session.selectedRoute,
      selectedContacts: session.selectedContacts,
      sessionDuration: session.sessionDuration,
    });
    setShowCustomDuration(!!session.sessionDuration);
    setEditingSession(session.id);
    setIsCreating(true);
  };

  const handleStartSession = (session: CustomSession) => {
    // Update last used timestamp
    const updatedSessions = sessions.map(s => 
      s.id === session.id ? { ...s, lastUsed: Date.now() } : s
    );
    setSessions(updatedSessions);
    localStorage.setItem('customSessions', JSON.stringify(updatedSessions));
    
    onStartSession(session);
    onClose();
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Delete this custom session?')) {
      const updatedSessions = sessions.filter(s => s.id !== id);
      setSessions(updatedSessions);
      localStorage.setItem('customSessions', JSON.stringify(updatedSessions));
    }
  };

  const toggleContactSelection = (contactId: string) => {
    const currentContacts = newSession.selectedContacts || [];
    const isSelected = currentContacts.includes(contactId);
    
    setNewSession({
      ...newSession,
      selectedContacts: isSelected 
        ? currentContacts.filter(id => id !== contactId)
        : [...currentContacts, contactId]
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return newSession.name?.trim().length > 0;
  };

  const getSelectedContactsCount = () => {
    if (!newSession.selectedContacts || newSession.selectedContacts.length === 0) {
      return contacts.length; // Will use all contacts if none selected
    }
    return newSession.selectedContacts.length;
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingSession(null);
    setShowCustomDuration(false);
    setNewSession({
      name: '',
      description: '',
      checkInInterval: 15,
      pingInterval: 3,
      autoStart: false,
      selectedContacts: [],
      sessionDuration: undefined,
    });
  };

  const presetDurations = [
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
  ];

  const SessionCard: React.FC<{ session: CustomSession }> = ({ session }) => {
    const sessionContacts = contacts.filter(c => session.selectedContacts.includes(c.id));
    const sessionRoute = routes.find(r => r.id === session.selectedRoute?.id);

    return (
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">{session.name}</h3>
            {session.description && (
              <p className="text-slate-600 dark:text-slate-300 mb-4 transition-colors duration-300">{session.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Check-in: {session.checkInInterval}m</span>
              </span>
              <span className="flex items-center space-x-1">
                <Bell className="w-4 h-4" />
                <span>Ping: {session.pingInterval}m</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{sessionContacts.length} contacts</span>
              </span>
              {session.sessionDuration && (
                <span className="flex items-center space-x-1">
                  <Timer className="w-4 h-4" />
                  <span>{formatTime(session.sessionDuration)}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditSession(session)}
              className="p-3 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all duration-200"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteSession(session.id)}
              className="p-3 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Session Details */}
        <div className="space-y-4 mb-6">
          {sessionRoute && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl transition-colors duration-300">
              <Route className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100 transition-colors duration-300">{sessionRoute.name}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 transition-colors duration-300">Estimated: {formatTime(sessionRoute.totalTime)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl transition-colors duration-300">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-100 transition-colors duration-300">Trusted Circle</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 transition-colors duration-300">
                {sessionContacts.length > 0 ? sessionContacts.map(c => c.name).join(', ') : 'All contacts'}
              </p>
            </div>
          </div>

          {session.sessionDuration && (
            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl transition-colors duration-300">
              <Timer className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
              <div>
                <p className="font-bold text-purple-900 dark:text-purple-100 transition-colors duration-300">Session Duration</p>
                <p className="text-sm text-purple-700 dark:text-purple-300 transition-colors duration-300">
                  {formatTime(session.sessionDuration)} with automatic safety checks
                </p>
              </div>
            </div>
          )}

          {session.autoStart && (
            <div className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl transition-colors duration-300">
              <Play className="w-5 h-5 text-orange-600 dark:text-orange-400 transition-colors duration-300" />
              <div>
                <p className="font-bold text-orange-900 dark:text-orange-100 transition-colors duration-300">Auto-Start Enabled</p>
                <p className="text-sm text-orange-700 dark:text-orange-300 transition-colors duration-300">Companion mode starts automatically</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => handleStartSession(session)}
            className="flex-1 bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-500 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-3"
          >
            <Play className="w-6 h-6" />
            <span>Start Session</span>
          </button>
          
          <button
            onClick={() => setShowCamera(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <Camera className="w-5 h-5" />
            <span>Record</span>
          </button>
        </div>

        {session.lastUsed && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 transition-colors duration-300">
            Last used: {new Date(session.lastUsed).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  };

  if (showCamera) {
    return (
      <CameraRecorder
        onClose={() => setShowCamera(false)}
        onRecordingComplete={(recording) => {
          console.log('Recording completed:', recording);
          setShowCamera(false);
        }}
      />
    );
  }

  return (
    <div className="p-6 pb-28">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">Custom Sessions</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">Create personalized companion sessions with your preferred settings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCamera(true)}
            className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl hover:shadow-lg transition-all duration-200"
          >
            <Video className="w-6 h-6" />
          </button>
          <button
            onClick={onClose}
            className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Create Session Button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl p-8 font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-4 mb-8"
        >
          <Settings className="w-6 h-6" />
          <span>Create Custom Session</span>
        </button>
      )}

      {/* Create/Edit Session Form */}
      {isCreating && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-8 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 text-2xl transition-colors duration-300">
            {editingSession ? 'Edit Custom Session' : 'Create Custom Session'}
          </h3>
          
          <div className="space-y-6">
            <input
              type="text"
              value={newSession.name || ''}
              onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
              className="w-full px-6 py-4 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-lg transition-colors duration-300"
              placeholder="Session name (e.g., 'Evening Walk', 'Work Commute')"
            />

            <textarea
              value={newSession.description || ''}
              onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
              className="w-full px-6 py-4 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-300"
              placeholder="Description (optional)"
              rows={3}
            />

            {/* Session Duration */}
            <div>
              <label className="block text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 transition-colors duration-300">Session Duration (Optional)</label>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowCustomDuration(false);
                    setNewSession({ ...newSession, sessionDuration: undefined });
                  }}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    !showCustomDuration && !newSession.sessionDuration
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Infinity className="w-5 h-5" />
                    <div>
                      <div className="font-bold">No time limit</div>
                      <div className="text-sm mt-1">Session continues until manually ended</div>
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {presetDurations.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setShowCustomDuration(false);
                        setNewSession({ ...newSession, sessionDuration: preset.value });
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                        newSession.sessionDuration === preset.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      <Timer className="w-5 h-5 mx-auto mb-2" />
                      <div className="font-bold">{preset.label}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCustomDuration(!showCustomDuration)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    showCustomDuration
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-slate-200 dark:border-slate-600 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5" />
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Custom duration</div>
                      <div className="text-sm mt-1 text-slate-600 dark:text-slate-300 transition-colors duration-300">Set your own time limit</div>
                    </div>
                  </div>
                </button>

                {showCustomDuration && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl transition-colors duration-300">
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={newSession.sessionDuration || ''}
                        onChange={(e) => setNewSession({ ...newSession, sessionDuration: parseInt(e.target.value) || undefined })}
                        className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-300"
                        placeholder="Enter minutes"
                        min="1"
                        max="1440"
                      />
                      <span className="text-slate-600 dark:text-slate-300 font-medium transition-colors duration-300">minutes</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 transition-colors duration-300">
                      Maximum 24 hours (1440 minutes)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Timing Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-xl transition-colors duration-300">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-300 transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-purple-900 dark:text-purple-100 transition-colors duration-300">Check-in Interval</label>
                    <p className="text-sm text-purple-700 dark:text-purple-300 transition-colors duration-300">How often to check if you're okay</p>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-purple-800 dark:text-purple-200 transition-colors duration-300">{newSession.checkInInterval || 15}</span>
                  <span className="text-lg text-purple-600 dark:text-purple-400 ml-2 transition-colors duration-300">minutes</span>
                </div>
                
                <div className="px-2">
                  <input
                    type="range"
                    min="2"
                    max="60"
                    value={newSession.checkInInterval || 15}
                    onChange={(e) => setNewSession({ ...newSession, checkInInterval: parseInt(e.target.value) })}
                    className="purple-slider w-full"
                  />
                  <div className="flex justify-between text-sm text-purple-600 dark:text-purple-400 mt-3 font-medium transition-colors duration-300">
                    <span>More caring</span>
                    <span>More space</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-teal-200/50 dark:border-teal-800/50 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-teal-100 dark:bg-teal-800 rounded-xl transition-colors duration-300">
                    <Bell className="w-5 h-5 text-teal-600 dark:text-teal-300 transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-teal-900 dark:text-teal-100 transition-colors duration-300">Location Updates</label>
                    <p className="text-sm text-teal-700 dark:text-teal-300 transition-colors duration-300">How often to share your location</p>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-teal-800 dark:text-teal-200 transition-colors duration-300">{newSession.pingInterval || 3}</span>
                  <span className="text-lg text-teal-600 dark:text-teal-400 ml-2 transition-colors duration-300">minutes</span>
                </div>
                
                <div className="px-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newSession.pingInterval || 3}
                    onChange={(e) => setNewSession({ ...newSession, pingInterval: parseInt(e.target.value) })}
                    className="teal-slider w-full"
                  />
                  <div className="flex justify-between text-sm text-teal-600 dark:text-teal-400 mt-3 font-medium transition-colors duration-300">
                    <span>More frequent</span>
                    <span>Less frequent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Selection */}
            {routes.length > 0 && (
              <div>
                <label className="block text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 transition-colors duration-300">Select Route (Optional)</label>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setNewSession({ ...newSession, selectedRoute: undefined })}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      !newSession.selectedRoute
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    }`}
                  >
                    <div className="font-bold">No specific route</div>
                    <div className="text-sm mt-1">General companion session</div>
                  </button>
                  
                  {routes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => setNewSession({ 
                        ...newSession, 
                        selectedRoute: { 
                          id: route.id, 
                          name: route.name, 
                          estimatedTime: route.totalTime 
                        } 
                      })}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        newSession.selectedRoute?.id === route.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      }`}
                    >
                      <div className="font-bold">{route.name}</div>
                      <div className="text-sm mt-1">Estimated: {formatTime(route.totalTime)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Selection */}
            <div>
              <label className="block text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 transition-colors duration-300">
                Select Trusted Contacts 
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                  ({getSelectedContactsCount()} selected)
                </span>
              </label>
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-2xl transition-colors duration-300">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-500 transition-colors duration-300" />
                  <p className="font-medium">No contacts available</p>
                  <p className="text-sm">Add contacts in the Circle section first</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl transition-colors duration-300">
                    <p className="text-sm text-amber-800 dark:text-amber-200 transition-colors duration-300">
                      💡 <strong>Tip:</strong> If no contacts are selected, all your contacts will be notified during the session.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => toggleContactSelection(contact.id)}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                          newSession.selectedContacts?.includes(contact.id)
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{contact.name}</div>
                            <div className="text-sm mt-1">{contact.relationship}</div>
                          </div>
                          {newSession.selectedContacts?.includes(contact.id) && (
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-xl transition-colors duration-300">
                              <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-300 transition-colors duration-300" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auto-start Option */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 transition-colors duration-300">
              <div>
                <p className="font-bold text-purple-900 dark:text-purple-100 text-lg transition-colors duration-300">Auto-Start Session</p>
                <p className="text-purple-700 dark:text-purple-300 mt-1 transition-colors duration-300">Start companion mode immediately after {editingSession ? 'saving' : 'creating'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSession.autoStart || false}
                  onChange={(e) => setNewSession({ ...newSession, autoStart: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-400 peer-checked:to-pink-500 transition-colors duration-300"></div>
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCreateSession}
                disabled={!isFormValid()}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>
                  {editingSession 
                    ? (newSession.autoStart ? 'Save & Start Session' : 'Save Changes')
                    : (newSession.autoStart ? 'Create & Start Session' : 'Save Session')
                  }
                </span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-6">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
              <Settings className="w-8 h-8 text-purple-400 dark:text-purple-500 transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">No custom sessions yet</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">Create your first custom session to get started with personalized companion experiences</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        )}
      </div>
    </div>
  );
};

export default SessionCreator;