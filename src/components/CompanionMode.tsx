import React, { useState, useEffect } from 'react';
import { 
  StopCircle, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Activity,
  Send,
  Heart,
  Sparkles,
  Route,
  Navigation,
  Users,
  Settings,
  Camera,
  Video,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { useLocation } from '../contexts/LocationContext';
import { useNotifications } from '../contexts/NotificationContext';
import { shareLocationWithContacts, getUserDisplayName, sendEmergencyAlert, sendCheckInAlert } from '../utils/locationSharing';
import CameraRecorder from './CameraRecorder';

interface CompanionModeProps {
  isActive: boolean;
  onEndSession: () => void;
}

const CompanionMode: React.FC<CompanionModeProps> = ({ isActive, onEndSession }) => {
  const { session, updatePing, updateCheckIn } = useSession();
  const { currentLocation, shareLocation, startTracking, stopTracking, isTracking, error } = useLocation();
  const { showLocationShared, showCheckInSent, showEmergencyAlert, showSessionEnded, showSafetyCheck } = useNotifications();
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [nextPing, setNextPing] = useState(0);
  const [nextCheckIn, setNextCheckIn] = useState(0);
  const [isCheckInPrompt, setIsCheckInPrompt] = useState(false);
  const [checkInCountdown, setCheckInCountdown] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [customSession, setCustomSession] = useState<any>(null);
  const [routeProgress, setRouteProgress] = useState<{ elapsed: number; remaining: number } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [safetyCheckCountdown, setSafetyCheckCountdown] = useState(0);
  const [showSafetyCheckPrompt, setShowSafetyCheckPrompt] = useState(false);
  const [smartIntervals, setSmartIntervals] = useState<{ ping: number; checkIn: number }>({ ping: 3, checkIn: 15 });

  // Calculate smart intervals based on session duration
  const calculateSmartIntervals = (sessionDurationMinutes?: number, remainingMinutes?: number) => {
    if (!sessionDurationMinutes) {
      // No duration set - use default intervals
      return { ping: 3, checkIn: 15 };
    }

    const totalDuration = sessionDurationMinutes;
    const remaining = remainingMinutes || totalDuration;

    // Smart ping intervals (location updates)
    let pingInterval = 3; // default 3 minutes
    if (totalDuration <= 15) {
      pingInterval = 1; // Every 1 minute for very short trips
    } else if (totalDuration <= 30) {
      pingInterval = 2; // Every 2 minutes for short trips
    } else if (totalDuration <= 60) {
      pingInterval = 3; // Every 3 minutes for medium trips
    } else if (totalDuration <= 240) {
      pingInterval = 5; // Every 5 minutes for longer trips
    } else {
      pingInterval = 10; // Every 10 minutes for very long trips
    }

    // Smart check-in intervals (wellness checks)
    let checkInInterval = 15; // default 15 minutes
    if (totalDuration <= 10) {
      checkInInterval = 5; // Every 5 minutes for very short trips
    } else if (totalDuration <= 30) {
      checkInInterval = 8; // Every 8 minutes for short trips
    } else if (totalDuration <= 60) {
      checkInInterval = 15; // Every 15 minutes for medium trips
    } else if (totalDuration <= 240) {
      checkInInterval = 30; // Every 30 minutes for longer trips
    } else {
      checkInInterval = 60; // Every hour for very long trips
    }

    // Increase frequency as session nears end
    if (remaining <= 15) {
      pingInterval = Math.max(1, Math.floor(pingInterval / 2)); // Double frequency in last 15 min
      checkInInterval = Math.max(3, Math.floor(checkInInterval / 3)); // Triple frequency in last 15 min
    } else if (remaining <= 30) {
      pingInterval = Math.max(1, Math.floor(pingInterval * 0.75)); // 25% more frequent in last 30 min
      checkInInterval = Math.max(5, Math.floor(checkInInterval / 2)); // Double frequency in last 30 min
    } else if (remaining <= 60) {
      checkInInterval = Math.max(10, Math.floor(checkInInterval * 0.75)); // 25% more frequent in last hour
    }

    return { ping: pingInterval, checkIn: checkInInterval };
  };

  useEffect(() => {
    if (isActive && !isTracking) {
      startTracking();
    }
    
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isActive, isTracking, startTracking, stopTracking]);

  useEffect(() => {
    if (!isActive) return;

    // Get session data from localStorage if session context is empty
    let sessionData = session;
    if (!sessionData.startTime) {
      const savedSession = localStorage.getItem('activeSession');
      if (savedSession) {
        sessionData = JSON.parse(savedSession);
        if (sessionData.selectedRoute) {
          setSelectedRoute(sessionData.selectedRoute);
        }
        if (sessionData.customSession) {
          setCustomSession(sessionData.customSession);
        }
        if (sessionData.endTime) {
          setSessionEndTime(sessionData.endTime);
        }
      }
    }

    if (!sessionData.startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionData.startTime!) / 1000);
      setTimeElapsed(elapsed);

      // Calculate time remaining if session has an end time
      let remainingMinutes: number | undefined;
      if (sessionEndTime) {
        const remaining = Math.max(0, Math.floor((sessionEndTime - now) / 1000));
        setTimeRemaining(remaining);
        remainingMinutes = Math.floor(remaining / 60);

        // Check if session has expired
        if (remaining === 0 && !isSessionExpired && !showSafetyCheckPrompt) {
          console.log('🛡️ SESSION DURATION EXPIRED');
          console.log('==============================');
          console.log('⏰ Session time has ended. Initiating safety check...');
          console.log('❓ Are you okay? Please respond within 2 minutes.');
          console.log('==============================');
          
          setIsSessionExpired(true);
          setShowSafetyCheckPrompt(true);
          setSafetyCheckCountdown(120); // 2 minutes
          showSafetyCheck();
        }
      }

      // Calculate smart intervals based on session duration
      const sessionDurationMinutes = sessionData.sessionDuration;
      const intervals = calculateSmartIntervals(sessionDurationMinutes, remainingMinutes);
      setSmartIntervals(intervals);

      // Calculate route progress if we have a selected route
      if (selectedRoute) {
        const elapsedMinutes = Math.floor(elapsed / 60);
        const remainingMinutes = Math.max(0, selectedRoute.estimatedTime - elapsedMinutes);
        setRouteProgress({ elapsed: elapsedMinutes, remaining: remainingMinutes });
      }

      // Calculate next ping time using smart intervals
      const pingInterval = intervals.ping * 60; // Convert to seconds
      const timeSinceLastPing = sessionData.lastPing ? Math.floor((now - sessionData.lastPing) / 1000) : elapsed;
      const nextPingTime = Math.max(0, pingInterval - timeSinceLastPing);
      setNextPing(nextPingTime);

      // Calculate next check-in time using smart intervals
      const checkInInterval = intervals.checkIn * 60; // Convert to seconds
      const timeSinceLastCheckIn = sessionData.lastCheckIn ? Math.floor((now - sessionData.lastCheckIn) / 1000) : elapsed;
      const nextCheckInTime = Math.max(0, checkInInterval - timeSinceLastCheckIn);
      setNextCheckIn(nextCheckInTime);

      // Auto ping every interval
      if (nextPingTime === 0 && timeSinceLastPing >= pingInterval) {
        handlePing();
      }

      // Check-in prompt
      if (nextCheckInTime === 0 && !isCheckInPrompt && !showSafetyCheckPrompt) {
        setIsCheckInPrompt(true);
        setCheckInCountdown(180); // 3 minutes to respond
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, session, isCheckInPrompt, selectedRoute, sessionEndTime, isSessionExpired, showSafetyCheckPrompt, timeRemaining]);

  // Safety check countdown
  useEffect(() => {
    if (showSafetyCheckPrompt && safetyCheckCountdown > 0) {
      const interval = setInterval(() => {
        setSafetyCheckCountdown(prev => {
          if (prev <= 1) {
            // Time's up - trigger emergency alert
            handleEmergencyAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showSafetyCheckPrompt, safetyCheckCountdown]);

  useEffect(() => {
    if (isCheckInPrompt && checkInCountdown > 0) {
      const interval = setInterval(() => {
        setCheckInCountdown(prev => {
          if (prev <= 1) {
            // Trigger gentle alert
            handleGentleAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCheckInPrompt, checkInCountdown]);

  const handlePing = async () => {
    try {
      const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
      
      if (currentLocation) {
        const userName = getUserDisplayName();
        await shareLocationWithContacts(currentLocation, userName, (contactCount) => {
          showLocationShared(contactCount);
        });
      } else {
        await shareLocation();
      }
      updatePing();
      
      // Update localStorage with new ping time
      const savedSession = localStorage.getItem('activeSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        sessionData.lastPing = Date.now();
        localStorage.setItem('activeSession', JSON.stringify(sessionData));
      }
    } catch (err) {
      console.error('Failed to ping location:', err);
    }
  };

  const handleCheckIn = () => {
    updateCheckIn();
    setIsCheckInPrompt(false);
    setCheckInCountdown(0);
    showCheckInSent();
    
    // Update localStorage with new check-in time
    const savedSession = localStorage.getItem('activeSession');
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      sessionData.lastCheckIn = Date.now();
      localStorage.setItem('activeSession', JSON.stringify(sessionData));
    }
  };

  const handleSafetyCheckOkay = () => {
    console.log('🛡️ SAFETY CHECK RESPONSE');
    console.log('========================');
    console.log('✅ User responded: "I\'m okay"');
    console.log('🔄 Extending session by 5 minutes...');
    console.log('⏰ Next safety check in 5 minutes');
    console.log('========================');

    // Extend session by 5 minutes
    const newEndTime = Date.now() + (5 * 60 * 1000);
    setSessionEndTime(newEndTime);
    setShowSafetyCheckPrompt(false);
    setSafetyCheckCountdown(0);
    setIsSessionExpired(false);

    // Update localStorage
    const savedSession = localStorage.getItem('activeSession');
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      sessionData.endTime = newEndTime;
      localStorage.setItem('activeSession', JSON.stringify(sessionData));
    }

    showCheckInSent();
  };

  const handleEmergencyAlert = async () => {
    console.log('🚨 EMERGENCY ALERT TRIGGERED');
    console.log('============================');
    console.log('⚠️ User did not respond to safety check within 2 minutes');
    console.log('📞 Sending emergency alerts to all trusted contacts...');
    console.log('============================');

    try {
      const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
      const userName = getUserDisplayName();
      
      if (currentLocation && contacts.length > 0) {
        await sendEmergencyAlert(contacts, currentLocation, userName, () => {
          showEmergencyAlert();
        });
      }
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    }

    setShowSafetyCheckPrompt(false);
    setSafetyCheckCountdown(0);
  };

  const handleGentleAlert = async () => {
    try {
      const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
      const userName = getUserDisplayName();
      
      await sendCheckInAlert(contacts, userName, undefined, () => {
        showCheckInSent();
      });
    } catch (error) {
      console.error('Failed to send gentle alert:', error);
    }

    setIsCheckInPrompt(false);
    setCheckInCountdown(0);
  };

  const handleEndSession = () => {
    localStorage.setItem('lastSessionEnd', Date.now().toString());
    localStorage.removeItem('activeSession');
    showSessionEnded();
    onEndSession();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimingStatus = () => {
    if (!timeRemaining) return 'normal';
    const remainingMinutes = Math.floor(timeRemaining / 60);
    if (remainingMinutes <= 15) return 'urgent';
    if (remainingMinutes <= 30) return 'warning';
    return 'normal';
  };

  const getTimingColor = () => {
    const status = getTimingStatus();
    switch (status) {
      case 'urgent': return 'from-red-400 to-orange-400';
      case 'warning': return 'from-amber-400 to-yellow-400';
      default: return 'from-emerald-400 via-teal-400 to-cyan-500';
    }
  };

  const getSmartTimingDescription = () => {
    const savedSession = localStorage.getItem('activeSession');
    if (!savedSession) return null;
    
    const sessionData = JSON.parse(savedSession);
    const sessionDuration = sessionData.sessionDuration;
    
    if (!sessionDuration) return null;

    if (sessionDuration <= 15) {
      return "⚡ Ultra-frequent monitoring for short trip";
    } else if (sessionDuration <= 30) {
      return "🔄 Frequent monitoring for quick journey";
    } else if (sessionDuration <= 60) {
      return "📍 Regular monitoring for medium trip";
    } else if (sessionDuration <= 240) {
      return "⏰ Balanced monitoring for longer journey";
    } else {
      return "🕐 Relaxed monitoring for extended trip";
    }
  };

  if (showCamera) {
    return (
      <CameraRecorder
        onClose={() => setShowCamera(false)}
        onRecordingComplete={(recording) => {
          console.log('Recording completed:', recording);
          setShowCamera(false);
          // Here you could save the recording or send it to contacts
        }}
      />
    );
  }

  if (!isActive) {
    return (
      <div className="p-6 pb-28">
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30 dark:from-slate-800 dark:via-purple-900/20 dark:to-teal-900/20 rounded-3xl shadow-lg p-10 text-center border border-purple-100/50 dark:border-slate-700/50 backdrop-blur-sm transition-colors duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
            <Heart className="w-10 h-10 text-slate-400 dark:text-slate-500 transition-colors duration-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Ready when you are</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed transition-colors duration-300">Start a companion session from your home screen whenever you need me by your side</p>
          <div className="flex items-center justify-center space-x-2 mt-6">
            <Sparkles className="w-5 h-5 text-purple-400 dark:text-purple-500 transition-colors duration-300" />
            <span className="text-purple-600 dark:text-purple-400 font-medium transition-colors duration-300">I'll be right here</span>
            <Sparkles className="w-5 h-5 text-purple-400 dark:text-purple-500 transition-colors duration-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-28">
      {/* Safety Check Prompt */}
      {showSafetyCheckPrompt && (
        <div className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 text-white rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Safety Check</h2>
            <p className="mb-8 text-orange-50 text-lg leading-relaxed">Your session time has ended. Are you okay?</p>
            <div className="text-4xl font-bold mb-8">{formatTime(safetyCheckCountdown)}</div>
            <button
              onClick={handleSafetyCheckOkay}
              className="bg-white text-orange-600 px-10 py-5 rounded-3xl font-bold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              I'm Okay! ✨
            </button>
            <p className="text-orange-100 text-sm mt-4">
              Session will extend by 5 minutes if you respond
            </p>
          </div>
        </div>
      )}

      {/* Check-in Prompt */}
      {isCheckInPrompt && !showSafetyCheckPrompt && (
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Just checking in</h2>
            <p className="mb-8 text-orange-50 text-lg leading-relaxed">Let me know you're doing well with a gentle tap below</p>
            <div className="text-4xl font-bold mb-8">{formatTime(checkInCountdown)}</div>
            <button
              onClick={handleCheckIn}
              className="bg-white text-orange-600 px-10 py-5 rounded-3xl font-bold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              I'm doing wonderfully ✨
            </button>
          </div>
        </div>
      )}

      {/* Custom Session Info */}
      {customSession && (
        <div className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 text-white rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{customSession.name}</h3>
                <p className="text-purple-100 text-lg">{customSession.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100 font-semibold">Custom Session</div>
              <div className="flex items-center space-x-2 mt-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">{customSession.selectedContacts.length} contacts</span>
              </div>
              {customSession.sessionDuration && (
                <div className="flex items-center space-x-2 mt-1">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm">{Math.floor(customSession.sessionDuration / 60)}h {customSession.sessionDuration % 60}m duration</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Route Progress (if route is selected) */}
      {selectedRoute && routeProgress && (
        <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-white rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Route className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedRoute.name}</h3>
                <p className="text-emerald-100 text-lg">Your planned journey</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{routeProgress.remaining}m</div>
              <div className="text-emerald-100 font-semibold">remaining</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-emerald-100 mb-2">
              <span>Progress</span>
              <span>{Math.round((routeProgress.elapsed / selectedRoute.estimatedTime) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-1000"
                style={{ width: `${Math.min(100, (routeProgress.elapsed / selectedRoute.estimatedTime) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Session Status with Smart Timing */}
      <div className={`bg-gradient-to-r ${getTimingColor()} text-white rounded-3xl p-8 mb-8 shadow-2xl`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold text-xl">Watching over you</span>
            </div>
            <div className="text-white/90 font-semibold text-lg">Together for: {formatDuration(timeElapsed)}</div>
            {timeRemaining !== null && (
              <div className="text-white/90 font-semibold text-lg mt-2">
                Time remaining: {formatDuration(timeRemaining)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{formatDuration(timeElapsed)}</div>
            <div className="text-white/90 text-base font-semibold">Active</div>
            {timeRemaining !== null && (
              <div className="text-white/90 text-sm mt-2 flex items-center space-x-1">
                <Timer className="w-4 h-4" />
                <span>{formatDuration(timeRemaining)} left</span>
              </div>
            )}
          </div>
        </div>

        {/* Smart Timing Indicator */}
        <div className="mt-6 p-4 bg-white/20 rounded-2xl">
          <div className="flex items-center space-x-3 mb-3">
            <Activity className="w-5 h-5" />
            <div className="text-sm font-semibold">Smart Timing Active</div>
          </div>
          <div className="text-sm space-y-1">
            <div>📍 Location updates: Every {smartIntervals.ping} minute{smartIntervals.ping !== 1 ? 's' : ''}</div>
            <div>💝 Check-ins: Every {smartIntervals.checkIn} minute{smartIntervals.checkIn !== 1 ? 's' : ''}</div>
            {getSmartTimingDescription() && (
              <div className="text-white/80 mt-2 italic">{getSmartTimingDescription()}</div>
            )}
          </div>
        </div>
      </div>

      {/* Location Status */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-8 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl transition-colors duration-300">Your Location</h3>
          {currentLocation && (
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl transition-colors duration-300">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
            </div>
          )}
        </div>
        
        {error ? (
          <div className="text-amber-600 dark:text-amber-400 font-semibold text-lg transition-colors duration-300">{error}</div>
        ) : currentLocation ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-300 transition-colors duration-300">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-2xl transition-colors duration-300">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
              </div>
              <span className="font-mono text-lg">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </span>
            </div>
            <div className="text-slate-500 dark:text-slate-400 font-semibold transition-colors duration-300">
              Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 transition-colors duration-300">
              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium transition-colors duration-300">
                📍 Smart location sharing every {smartIntervals.ping} minute{smartIntervals.ping !== 1 ? 's' : ''}
                {getTimingStatus() !== 'normal' && (
                  <span className="block mt-1 text-orange-600 dark:text-orange-400">
                    ⚡ Increased frequency due to session timing
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 dark:text-slate-400 font-semibold text-lg transition-colors duration-300">Getting your location...</div>
        )}
      </div>

      {/* Next Actions with Smart Timing */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl transition-colors duration-300">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Next Update</span>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{formatTime(nextPing)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium transition-colors duration-300">
            Every {smartIntervals.ping}min
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl transition-colors duration-300">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Next Check-in</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">{formatTime(nextCheckIn)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium transition-colors duration-300">
            Every {smartIntervals.checkIn}min
          </div>
        </div>
      </div>

      {/* Manual Actions */}
      <div className="space-y-6 mb-8">
        <button
          onClick={handlePing}
          className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-3xl p-8 font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-lg"
        >
          Share My Location Now ✨
        </button>
        
        <button
          onClick={handleCheckIn}
          className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-3xl p-8 font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-lg"
        >
          I'm Doing Wonderfully 💝
        </button>

        <button
          onClick={() => setShowCamera(true)}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 text-white rounded-3xl p-8 font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-4 text-lg"
        >
          <Camera className="w-7 h-7" />
          <span>Record Safety Video</span>
        </button>
      </div>

      {/* End Session */}
      <button
        onClick={handleEndSession}
        className="w-full bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-3xl p-8 font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-4 text-lg"
      >
        <StopCircle className="w-7 h-7" />
        <span>End Our Time Together</span>
      </button>
    </div>
  );
};

export default CompanionMode;