import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Users,
  MapPin,
  Clock,
  Smartphone,
  Terminal,
  Play,
  Monitor
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  shareLocationWithContacts, 
  sendCheckInAlert, 
  sendEmergencyAlert,
  getUserDisplayName 
} from '../utils/locationSharing';

const LocationSharingTest: React.FC = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [lastShared, setLastShared] = useState<Date | null>(null);
  const [sharingStatus, setSharingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [contacts, setContacts] = useState<any[]>([]);
  const { showLocationShared, showCheckInSent, showEmergencyAlert } = useNotifications();

  React.useEffect(() => {
    const savedContacts = localStorage.getItem('trustedContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  const handleShareLocation = async () => {
    if (contacts.length === 0) {
      alert('Please add some trusted contacts first!');
      return;
    }

    setIsSharing(true);
    setSharingStatus('idle');

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      };

      const userName = getUserDisplayName();
      
      console.log('🛡️ STARTING LOCATION SHARING SIMULATION...');
      console.log('==========================================');
      
      // Share location with contacts
      await shareLocationWithContacts(location, userName, (contactCount) => {
        showLocationShared(contactCount);
      });
      
      setLastShared(new Date());
      setSharingStatus('success');
      
    } catch (error) {
      console.error('❌ Location sharing simulation failed:', error);
      setSharingStatus('error');
      alert('Failed to get location. Please check your location permissions and try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCheckInAlert = async () => {
    if (contacts.length === 0) {
      alert('Please add some trusted contacts first!');
      return;
    }

    try {
      const userName = getUserDisplayName();
      console.log('🔔 STARTING CHECK-IN ALERT SIMULATION...');
      console.log('========================================');
      await sendCheckInAlert(contacts, userName, undefined, () => {
        showCheckInSent();
      });
    } catch (error) {
      console.error('❌ Check-in alert simulation failed:', error);
      alert('Failed to simulate check-in alert. Please try again.');
    }
  };

  const handleEmergencyAlert = async () => {
    if (contacts.length === 0) {
      alert('Please add some trusted contacts first!');
      return;
    }

    const confirmed = confirm(
      '🚨 This will simulate sending an EMERGENCY ALERT to all your trusted contacts. The messages will be logged to the console. Continue?'
    );

    if (!confirmed) return;

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        });
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      };

      const userName = getUserDisplayName();
      console.log('🚨 STARTING EMERGENCY ALERT SIMULATION...');
      console.log('=========================================');
      await sendEmergencyAlert(contacts, location, userName, () => {
        showEmergencyAlert();
      });
      
    } catch (error) {
      console.error('❌ Emergency alert simulation failed:', error);
      alert('Failed to simulate emergency alert. Please try again.');
    }
  };

  const openConsole = () => {
    // Focus on console in dev tools
    console.log('👋 Console opened! All Niva message simulations will appear here.');
    console.log('💡 Tip: Keep this console open while testing to see detailed message logs.');
    console.log('🎯 This is a frontend-only simulation - perfect for development and demos!');
  };

  return (
    <div className="p-6 pb-28">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Location Sharing Test</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg transition-colors duration-300">
          Test the location sharing functionality with frontend-only console simulation
        </p>
      </div>

      {/* Frontend-Only Mode Notice */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-3xl p-8 mb-8 transition-colors duration-300">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-green-100 dark:bg-green-800 rounded-2xl transition-colors duration-300">
            <Monitor className="w-6 h-6 text-green-600 dark:text-green-300 transition-colors duration-300" />
          </div>
          <div>
            <h3 className="font-bold text-green-900 dark:text-green-100 text-xl transition-colors duration-300">Frontend-Only Simulation Mode</h3>
            <p className="text-green-700 dark:text-green-300 transition-colors duration-300">No backend server required - all messaging is simulated</p>
          </div>
        </div>
        
        <div className="bg-green-100 dark:bg-green-800/50 rounded-2xl p-6 transition-colors duration-300">
          <h4 className="font-bold text-green-900 dark:text-green-100 mb-4 transition-colors duration-300">✨ Perfect for:</h4>
          <div className="space-y-3 text-green-800 dark:text-green-200 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm"><strong>Development & Testing:</strong> See exactly how messages would be formatted</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm"><strong>Demos & Presentations:</strong> Show functionality without external services</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm"><strong>Learning:</strong> Understand the complete message flow and formatting</span>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Notifications Notice */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-3xl p-8 mb-8 transition-colors duration-300">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-2xl transition-colors duration-300">
            <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-300 transition-colors duration-300" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100 text-xl transition-colors duration-300">In-App Notifications</h3>
            <p className="text-purple-700 dark:text-purple-300 transition-colors duration-300">Beautiful toast notifications show when actions complete</p>
          </div>
        </div>
        
        <div className="bg-purple-100 dark:bg-purple-800/50 rounded-2xl p-6 transition-colors duration-300">
          <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-4 transition-colors duration-300">🎯 What you'll see:</h4>
          <div className="space-y-3 text-purple-800 dark:text-purple-200 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm"><strong>Location Shared:</strong> Confirmation with contact count</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm"><strong>Check-in Sent:</strong> Gentle notification to your circle</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm"><strong>Emergency Alert:</strong> Urgent notification sent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Console Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-3xl p-8 mb-8 transition-colors duration-300">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-2xl transition-colors duration-300">
            <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-300 transition-colors duration-300" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-100 text-xl transition-colors duration-300">Console Simulation Mode</h3>
            <p className="text-blue-700 dark:text-blue-300 transition-colors duration-300">All messages are logged to the browser console</p>
          </div>
        </div>
        
        <div className="bg-blue-100 dark:bg-blue-800/50 rounded-2xl p-6 mb-6 transition-colors duration-300">
          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 transition-colors duration-300">How to View Console Logs:</h4>
          <div className="space-y-3 text-blue-800 dark:text-blue-200 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm"><strong>Chrome/Edge:</strong> Press F12 or Ctrl+Shift+I, then click "Console" tab</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm"><strong>Firefox:</strong> Press F12 or Ctrl+Shift+K</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm"><strong>Safari:</strong> Press Cmd+Option+C (enable Developer menu first)</span>
            </div>
          </div>
        </div>

        <button
          onClick={openConsole}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
        >
          <Terminal className="w-6 h-6" />
          <span>Open Console & Start Testing</span>
        </button>
      </div>

      {/* Contact Status */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-8 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl transition-colors duration-300">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl transition-colors duration-300">Trusted Circle Status</h3>
            <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">
              {contacts.length > 0 
                ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} ready for simulation`
                : 'No contacts added yet'
              }
            </p>
          </div>
        </div>

        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{contact.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">{contact.relationship}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl transition-colors duration-300">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                  </div>
                  {contact.email && (
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl transition-colors duration-300">
                      <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                    </div>
                  )}
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl transition-colors duration-300">
                    <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400 transition-colors duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <Users className="w-8 h-8 text-slate-400 dark:text-slate-500 transition-colors duration-300" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium transition-colors duration-300">
              Add trusted contacts in the Circle section to test location sharing
            </p>
          </div>
        )}
      </div>

      {/* Sharing Methods Info */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 mb-8 transition-colors duration-300">
        <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-6 text-xl flex items-center space-x-3 transition-colors duration-300">
          <Smartphone className="w-6 h-6" />
          <span>Simulated Communication Channels</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors duration-300" />
            </div>
            <h4 className="font-bold text-green-900 dark:text-green-100 mb-2 transition-colors duration-300">SMS Messages</h4>
            <p className="text-green-800 dark:text-green-200 text-sm transition-colors duration-300">
              Instant text messages with Google Maps links and route information
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <Send className="w-8 h-8 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
            </div>
            <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-2 transition-colors duration-300">WhatsApp</h4>
            <p className="text-purple-800 dark:text-purple-200 text-sm transition-colors duration-300">
              Rich messages via WhatsApp with location details and media
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <Mail className="w-8 h-8 text-orange-600 dark:text-orange-400 transition-colors duration-300" />
            </div>
            <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2 transition-colors duration-300">Email Backup</h4>
            <p className="text-orange-800 dark:text-orange-200 text-sm transition-colors duration-300">
              Detailed email notifications as a reliable backup method
            </p>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="space-y-6">
        {/* Share Location */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl transition-colors duration-300">
                <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl transition-colors duration-300">Share Current Location</h3>
                <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">Simulate sending your current location to all trusted contacts</p>
              </div>
            </div>
            {sharingStatus === 'success' && (
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl transition-colors duration-300">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
              </div>
            )}
            {sharingStatus === 'error' && (
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl transition-colors duration-300">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 transition-colors duration-300" />
              </div>
            )}
          </div>

          {lastShared && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl transition-colors duration-300">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
                <span className="text-emerald-800 dark:text-emerald-200 font-medium transition-colors duration-300">
                  Last simulated: {lastShared.toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleShareLocation}
            disabled={isSharing || contacts.length === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
          >
            {isSharing ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Simulating Location Share...</span>
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                <span>Simulate Location Sharing</span>
              </>
            )}
          </button>
        </div>

        {/* Check-in Alert */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl transition-colors duration-300">
              <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400 transition-colors duration-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl transition-colors duration-300">Send Check-in Alert</h3>
              <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">Simulate letting your circle know you might need a gentle check-in</p>
            </div>
          </div>

          <button
            onClick={handleCheckInAlert}
            disabled={contacts.length === 0}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <MessageSquare className="w-6 h-6" />
            <span>Simulate Gentle Check-in Alert</span>
          </button>
        </div>

        {/* Emergency Alert */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-red-200 dark:border-red-800 transition-colors duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-2xl transition-colors duration-300">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 transition-colors duration-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl transition-colors duration-300">Emergency Alert</h3>
              <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">⚠️ Simulates emergency alert (console logging only)</p>
            </div>
          </div>

          <button
            onClick={handleEmergencyAlert}
            disabled={contacts.length === 0}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <AlertCircle className="w-6 h-6" />
            <span>🚨 Simulate Emergency Alert</span>
          </button>
        </div>
      </div>

      {/* Development Note */}
      <div className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-3xl p-8 transition-colors duration-300">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg transition-colors duration-300">🎯 Frontend-Only Simulation Mode</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 transition-colors duration-300">
          All messaging functionality is simulated with detailed console logging and beautiful in-app notifications. No backend server or external services required.
        </p>
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-4 text-green-400 font-mono text-sm">
          <p>💡 Open your browser's developer console (F12) to see detailed message logs!</p>
          <p className="mt-2 text-slate-400">🎯 Perfect for development, demos, and understanding the complete message flow</p>
          <p className="mt-2 text-blue-400">🚀 Ready for backend integration when you need real messaging</p>
        </div>
      </div>
    </div>
  );
};

export default LocationSharingTest;