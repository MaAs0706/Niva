import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MapPin, 
  Clock, 
  Shield, 
  Volume2, 
  Vibrate,
  Moon,
  Sun,
  Heart,
  MessageSquare,
  Phone,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Settings {
  notifications: boolean;
  locationSharing: boolean;
  pingInterval: number; // minutes
  checkInInterval: number; // minutes
  soundAlerts: boolean;
  vibrationAlerts: boolean;
  darkMode: boolean;
  autoStartOnLowBattery: boolean;
}

const SettingsPanel: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    locationSharing: true,
    pingInterval: 3,
    checkInInterval: 15,
    soundAlerts: false, // Off by default for stealth
    vibrationAlerts: true,
    darkMode: false,
    autoStartOnLowBattery: false,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({ ...parsed, darkMode: isDarkMode });
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (key: keyof Settings) => {
    if (key === 'darkMode') {
      toggleDarkMode();
      setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleIntervalChange = (key: 'pingInterval' | 'checkInInterval', value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Gentle notifications enabled', {
          body: 'You\'ll receive caring reminders and check-ins',
          icon: '/Niva Logo 1024x1024.png'
        });
      }
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        trustedContacts: JSON.parse(localStorage.getItem('trustedContacts') || '[]'),
        safePlaces: JSON.parse(localStorage.getItem('safePlaces') || '[]'),
        savedRoutes: JSON.parse(localStorage.getItem('savedRoutes') || '[]'),
        customSessions: JSON.parse(localStorage.getItem('customSessions') || '[]'),
        appSettings: JSON.parse(localStorage.getItem('appSettings') || '{}'),
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `niva-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Data exported successfully', {
          body: 'Your Niva data has been downloaded',
          icon: '/Niva Logo 1024x1024.png'
        });
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    
    try {
      // Clear all localStorage data
      const keysToRemove = [
        'trustedContacts',
        'safePlaces', 
        'savedRoutes',
        'customSessions',
        'activeSession',
        'recentRoutes',
        'lastSessionEnd',
        'hasVisitedBefore',
        'hasCompletedOnboarding',
        'userData'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Reset app settings to defaults but keep theme preference
      const defaultSettings = {
        notifications: true,
        locationSharing: true,
        pingInterval: 3,
        checkInInterval: 15,
        soundAlerts: false,
        vibrationAlerts: true,
        darkMode: isDarkMode,
        autoStartOnLowBattery: false,
      };
      
      setSettings(defaultSettings);
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      
      // Simulate clearing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsClearing(false);
      setClearSuccess(true);
      setShowClearConfirm(false);
      
      // Show success for 3 seconds then reload
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to clear data:', error);
      setIsClearing(false);
      alert('Failed to clear data. Please try again.');
    }
  };

  return (
    <div className="p-6 pb-28">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Your Preferences</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg transition-colors duration-300">Customize how Niva cares for you</p>
      </div>

      {/* Success Message */}
      {clearSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">All Clear! ✨</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Your data has been completely cleared. The app will restart fresh.</p>
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Clear All Data?</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This will permanently delete all your trusted contacts, saved places, routes, and custom sessions. This action cannot be undone.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
              <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">What will be deleted:</h4>
              <ul className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
                <li>• All trusted contacts</li>
                <li>• Saved safe places</li>
                <li>• Custom routes</li>
                <li>• Custom sessions</li>
                <li>• App preferences (except theme)</li>
              </ul>
            </div>

            {isClearing ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Clearing all data...</p>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-slate-500 text-white py-4 px-6 rounded-2xl font-bold hover:bg-slate-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 bg-red-600 text-white py-4 px-6 rounded-2xl font-bold hover:bg-red-700 transition-all duration-200"
                >
                  Clear All Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Notifications Section */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-orange-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center space-x-4 text-xl transition-colors duration-300">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl transition-colors duration-300">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
            </div>
            <span>Gentle Notifications</span>
          </h3>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Caring Reminders</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">Receive gentle check-ins and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => {
                    handleToggle('notifications');
                    if (!settings.notifications) {
                      requestNotificationPermission();
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-rose-500 transition-colors duration-300"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Sound Alerts</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">Quiet by default for your privacy</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={() => handleToggle('soundAlerts')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-rose-500 transition-colors duration-300"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Gentle Vibration</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">Subtle haptic feedback</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.vibrationAlerts}
                  onChange={() => handleToggle('vibrationAlerts')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-rose-500 transition-colors duration-300"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-orange-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center space-x-4 text-xl transition-colors duration-300">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl transition-colors duration-300">
              <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
            </div>
            <span>Location & Connection</span>
          </h3>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Share Your Location</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">Let your circle know where you are</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.locationSharing}
                  onChange={() => handleToggle('locationSharing')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-rose-500 transition-colors duration-300"></div>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Location Update Frequency</p>
                <span className="text-slate-600 dark:text-slate-300 font-bold text-lg transition-colors duration-300">{settings.pingInterval} min</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.pingInterval}
                onChange={(e) => handleIntervalChange('pingInterval', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-orange-200 to-rose-200 dark:from-orange-800 dark:to-rose-800 rounded-lg appearance-none cursor-pointer transition-colors duration-300"
              />
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium transition-colors duration-300">
                <span>More frequent</span>
                <span>Less frequent</span>
              </div>
            </div>

            {/* Location Sharing Methods */}
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50 transition-colors duration-300">
              <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center space-x-3 transition-colors duration-300">
                <MessageSquare className="w-5 h-5" />
                <span>How locations are shared</span>
              </h4>
              <div className="space-y-3 text-blue-800 dark:text-blue-200 transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full transition-colors duration-300"></div>
                  <span className="text-sm">SMS messages with Google Maps links</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full transition-colors duration-300"></div>
                  <span className="text-sm">WhatsApp messages (if available)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full transition-colors duration-300"></div>
                  <span className="text-sm">Email notifications as backup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Section */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-orange-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center space-x-4 text-xl transition-colors duration-300">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl transition-colors duration-300">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
            </div>
            <span>Care & Support</span>
          </h3>
          
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Check-in Frequency</p>
                <span className="text-slate-600 dark:text-slate-300 font-bold text-lg transition-colors duration-300">{settings.checkInInterval} min</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 transition-colors duration-300">How often should I gently check if you're okay?</p>
              <input
                type="range"
                min="2"
                max="60"
                step="1"
                value={settings.checkInInterval}
                onChange={(e) => handleIntervalChange('checkInInterval', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-lg appearance-none cursor-pointer transition-colors duration-300"
              />
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium transition-colors duration-300">
                <span>More caring (2 min)</span>
                <span>More space (60 min)</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Low Battery Care</p>
                <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">Start watching when your battery gets low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoStartOnLowBattery}
                  onChange={() => handleToggle('autoStartOnLowBattery')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-rose-500 transition-colors duration-300"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-orange-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center space-x-4 text-xl transition-colors duration-300">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl transition-colors duration-300">
              {isDarkMode ? (
                <Moon className="w-6 h-6 text-amber-600 dark:text-amber-400 transition-colors duration-300" />
              ) : (
                <Sun className="w-6 h-6 text-amber-600 dark:text-amber-400 transition-colors duration-300" />
              )}
            </div>
            <span>Appearance</span>
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Dark Mode</p>
              <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">Easier on your eyes in low light</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => handleToggle('darkMode')}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-rose-500 transition-colors duration-300"></div>
            </label>
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-orange-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 text-xl transition-colors duration-300">Your Data & Privacy</h3>
          
          <div className="space-y-6">
            <button 
              onClick={handleExportData}
              className="w-full text-left p-6 rounded-2xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-300">
                  <Download className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Export Your Data</p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">Download your safety information as JSON</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="w-full text-left p-6 rounded-2xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 text-rose-600 dark:text-rose-400 hover:shadow-lg group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-2xl group-hover:bg-rose-200 dark:group-hover:bg-rose-800 transition-colors duration-300">
                  <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400 transition-colors duration-300" />
                </div>
                <div>
                  <p className="font-bold text-lg transition-colors duration-300">Clear All Data</p>
                  <p className="text-rose-500 dark:text-rose-400 mt-1 transition-colors duration-300">Remove all contacts and places (this can't be undone)</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Caring Message */}
        <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 rounded-3xl p-8 shadow-lg transition-colors duration-300">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-3xl transition-colors duration-300">
              <Heart className="w-8 h-8 text-purple-700 dark:text-purple-300 transition-colors duration-300" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-3 text-xl transition-colors duration-300">You matter deeply</h3>
              <p className="text-purple-800 dark:text-purple-200 leading-relaxed text-lg transition-colors duration-300">
                These settings help me care for you in the way that feels right. You can change them anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;