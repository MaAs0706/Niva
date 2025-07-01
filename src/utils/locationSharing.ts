// Enhanced location sharing utilities for Niva - Frontend-Only Console Logging Version with Offline Support

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface SessionData {
  isActive: boolean;
  startTime: number;
  selectedRoute?: {
    name: string;
    estimatedTime: number;
  };
}

/**
 * Check if we're online
 */
const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Queue action for offline sync
 */
const queueOfflineAction = (type: string, data: any): void => {
  const action = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type,
    data,
    timestamp: Date.now()
  };

  const pendingActions = JSON.parse(localStorage.getItem('pendingOfflineActions') || '[]');
  pendingActions.push(action);
  localStorage.setItem('pendingOfflineActions', JSON.stringify(pendingActions));

  console.log(`📝 Queued offline action: ${type}`);

  // Trigger background sync if available
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(type);
    }).catch((error) => {
      console.error('❌ Background sync registration failed:', error);
    });
  }
};

/**
 * Formats location data into a shareable message with route information
 */
export const formatLocationMessage = (
  location: LocationData, 
  userName: string = 'Your friend',
  sessionData?: SessionData
): string => {
  const googleMapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  const timestamp = new Date(location.timestamp).toLocaleString();
  
  let routeInfo = '';
  if (sessionData?.selectedRoute) {
    const elapsed = Math.floor((Date.now() - sessionData.startTime) / 60000); // minutes
    const remaining = Math.max(0, sessionData.selectedRoute.estimatedTime - elapsed);
    routeInfo = `\n🗺️ Route: ${sessionData.selectedRoute.name}\n⏱️ ETA: ${remaining} minutes remaining`;
  }

  return `🛡️ Niva Location Update

Hi! ${userName} is sharing their location with you.

📍 Current Location: ${googleMapsUrl}
🕐 Time: ${timestamp}${routeInfo}

This is an automated safety check-in. ${userName} wanted you to know where they are.

Reply "SAFE" if you want to confirm you received this.

Stay safe! 💝

---
Sent via Niva Safety App`;
};

/**
 * Formats a gentle check-in alert message
 */
export const formatCheckInAlert = (
  userName: string = 'Your friend',
  sessionData?: SessionData
): string => {
  let routeInfo = '';
  if (sessionData?.selectedRoute) {
    routeInfo = `\n\nThey were on their "${sessionData.selectedRoute.name}" route.`;
  }

  return `🛡️ Niva Gentle Check-in

Hi! This is a gentle check-in from Niva.

${userName} hasn't responded to their safety check-in in a while. This might just mean they're busy, but we wanted to let you know.${routeInfo}

You might want to reach out and say hello! 💝

This is an automated message from Niva safety app.`;
};

/**
 * Formats an emergency alert message
 */
export const formatEmergencyAlert = (
  location: LocationData,
  userName: string = 'Your friend'
): string => {
  const googleMapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  const timestamp = new Date(location.timestamp).toLocaleString();

  return `🚨 NIVA EMERGENCY ALERT 🚨

${userName} may need immediate assistance!

📍 LAST KNOWN LOCATION: ${googleMapsUrl}
🕐 Time: ${timestamp}

Please check on them immediately or contact emergency services if needed.

This is an automated emergency alert from Niva safety app.`;
};

/**
 * Enhanced SMS simulation with offline support
 */
export const shareLocationViaSMS = async (
  contacts: Contact[], 
  location: LocationData, 
  userName: string = 'Your friend',
  sessionData?: SessionData,
  showNotification?: (contactCount: number) => void
): Promise<void> => {
  const mode = isOnline() ? 'ONLINE SIMULATION' : 'OFFLINE MODE';
  
  console.log(`📱 SMS SERVICE - ${mode}`);
  console.log('=========================================');
  console.log(`📤 ${isOnline() ? 'Simulating' : 'Queuing'} SMS to ${contacts.length} contacts...`);
  console.log('📍 Location:', {
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: new Date(location.timestamp).toLocaleString(),
    googleMapsUrl: `https://maps.google.com/?q=${location.latitude},${location.longitude}`
  });
  
  if (sessionData?.selectedRoute) {
    console.log('🗺️ Route Info:', sessionData.selectedRoute);
  }
  
  const message = formatLocationMessage(location, userName, sessionData);
  
  console.log('\n📝 SMS Message Content:');
  console.log('----------------------');
  console.log(message);
  console.log('----------------------\n');

  if (!isOnline()) {
    // Store for offline sync
    const locationData = {
      location,
      userName,
      contacts,
      sessionData,
      timestamp: Date.now()
    };

    // Save to offline storage
    const locationHistory = JSON.parse(localStorage.getItem('offlineLocationHistory') || '[]');
    locationHistory.push(locationData);
    
    // Keep only last 50 locations
    if (locationHistory.length > 50) {
      locationHistory.splice(0, locationHistory.length - 50);
    }
    
    localStorage.setItem('offlineLocationHistory', JSON.stringify(locationHistory));
    
    // Queue for sync
    queueOfflineAction('location-share', locationData);

    console.log('📴 OFFLINE: Location queued for sync when online');
    console.log(`💾 Stored locally for ${contacts.length} contacts`);
    console.log('=========================================\n');

    // Show offline notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Location Saved Offline 📴', {
        body: `Location saved locally. Will share with ${contacts.length} contacts when online.`,
        icon: '/Niva Logo 1024x1024.png'
      });
    }

    if (showNotification) {
      showNotification(contacts.length);
    }
    return;
  }

  // Online simulation
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    console.log(`📱 [${i + 1}/${contacts.length}] SMS → ${contact.name} (${contact.phone})`);
    console.log(`   Relationship: ${contact.relationship}`);
    console.log(`   Status: ✅ SIMULATED DELIVERY`);
    console.log(`   Message ID: SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    console.log(`   💡 In production: Would send via Twilio/SMS API`);
    console.log('');
  }
  
  console.log('🎉 All SMS simulations completed!');
  console.log(`📊 Summary: ${contacts.length} messages would be delivered`);
  console.log('=========================================\n');

  // Show in-app notification
  if (showNotification) {
    showNotification(contacts.length);
  }
};

/**
 * Enhanced WhatsApp simulation with offline support
 */
export const shareLocationViaWhatsApp = async (
  contacts: Contact[], 
  location: LocationData, 
  userName: string = 'Your friend',
  sessionData?: SessionData
): Promise<void> => {
  const mode = isOnline() ? 'ONLINE SIMULATION' : 'OFFLINE MODE';
  
  console.log(`💬 WHATSAPP SERVICE - ${mode}`);
  console.log('==============================================');
  console.log(`📤 ${isOnline() ? 'Simulating' : 'Queuing'} WhatsApp messages to ${contacts.length} contacts...`);
  
  if (!isOnline()) {
    console.log('📴 OFFLINE: WhatsApp messages queued for sync');
    console.log('==============================================\n');
    return;
  }
  
  const message = formatLocationMessage(location, userName, sessionData);
  
  for (const contact of contacts) {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`💬 WhatsApp → ${contact.name} (${contact.phone})`);
    console.log(`   Status: ✅ SIMULATED DELIVERY`);
    console.log(`   💡 In production: Would send via WhatsApp Business API`);
  }
  
  console.log('🎉 All WhatsApp simulations completed!');
  console.log('==============================================\n');
};

/**
 * Enhanced email simulation with offline support
 */
export const shareLocationViaEmail = async (
  contacts: Contact[], 
  location: LocationData, 
  userName: string = 'Your friend',
  sessionData?: SessionData
): Promise<void> => {
  const mode = isOnline() ? 'ONLINE SIMULATION' : 'OFFLINE MODE';
  
  console.log(`📧 EMAIL SERVICE - ${mode}`);
  console.log('===========================================');
  console.log(`📤 ${isOnline() ? 'Simulating' : 'Queuing'} email notifications to ${contacts.length} contacts...`);
  
  if (!isOnline()) {
    console.log('📴 OFFLINE: Email notifications queued for sync');
    console.log('===========================================\n');
    return;
  }
  
  const message = formatLocationMessage(location, userName, sessionData);
  
  for (const contact of contacts) {
    if (contact.email) {
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log(`📧 Email → ${contact.name} (${contact.email})`);
      console.log(`   Subject: 🛡️ Niva Location Update from ${userName}`);
      console.log(`   Status: ✅ SIMULATED DELIVERY`);
      console.log(`   💡 In production: Would send via SendGrid/Email API`);
    }
  }
  
  console.log('🎉 All email simulations completed!');
  console.log('===========================================\n');
};

/**
 * Enhanced check-in alerts with offline support
 */
export const sendCheckInAlert = async (
  contacts: Contact[], 
  userName: string = 'Your friend',
  sessionData?: SessionData,
  showNotification?: () => void
): Promise<void> => {
  const mode = isOnline() ? 'ONLINE SIMULATION' : 'OFFLINE MODE';
  
  console.log(`🔔 CHECK-IN ALERT SERVICE - ${mode}`);
  console.log('====================================================');
  console.log(`📤 ${isOnline() ? 'Simulating' : 'Queuing'} gentle check-in alerts to ${contacts.length} contacts...`);
  
  const message = formatCheckInAlert(userName, sessionData);
  
  console.log('\n📝 Check-in Message:');
  console.log('--------------------');
  console.log(message);
  console.log('--------------------\n');

  if (!isOnline()) {
    // Queue for offline sync
    queueOfflineAction('check-in-alert', {
      contacts,
      userName,
      sessionData,
      timestamp: Date.now()
    });

    console.log('📴 OFFLINE: Check-in alerts queued for sync');
    console.log('====================================================\n');

    if (showNotification) {
      showNotification();
    }
    return;
  }
  
  for (const contact of contacts) {
    await new Promise(resolve => setTimeout(resolve, 700));
    console.log(`🔔 Check-in Alert → ${contact.name}`);
    console.log(`   📱 SMS: ${contact.phone} - ✅ SIMULATED`);
    if (contact.email) {
      console.log(`   📧 Email: ${contact.email} - ✅ SIMULATED`);
    }
    console.log(`   💡 In production: Would send via multiple channels`);
    console.log('');
  }
  
  console.log('🎉 All check-in alert simulations completed!');
  console.log('====================================================\n');

  // Show in-app notification
  if (showNotification) {
    showNotification();
  }
};

/**
 * Enhanced emergency alerts with offline support
 */
export const sendEmergencyAlert = async (
  contacts: Contact[],
  location: LocationData,
  userName: string = 'Your friend',
  showNotification?: () => void
): Promise<void> => {
  const mode = isOnline() ? 'ONLINE SIMULATION' : 'OFFLINE MODE';
  
  console.log(`🚨 EMERGENCY ALERT SERVICE - ${mode}`);
  console.log('=====================================================');
  console.log('🚨 EMERGENCY SITUATION SIMULATION!');
  console.log(`📤 ${isOnline() ? 'Simulating' : 'Queuing'} emergency alerts to ${contacts.length} contacts...`);
  
  const message = formatEmergencyAlert(location, userName);
  
  console.log('\n🚨 EMERGENCY MESSAGE:');
  console.log('=====================');
  console.log(message);
  console.log('=====================\n');
  
  console.log('📍 Emergency Location Details:');
  console.log(`   Latitude: ${location.latitude}`);
  console.log(`   Longitude: ${location.longitude}`);
  console.log(`   Google Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}`);
  console.log(`   Timestamp: ${new Date(location.timestamp).toLocaleString()}\n`);

  if (!isOnline()) {
    // Queue for offline sync with high priority
    queueOfflineAction('emergency-alert', {
      contacts,
      location,
      userName,
      timestamp: Date.now(),
      priority: 'high'
    });

    console.log('📴 OFFLINE: Emergency alerts queued for immediate sync when online');
    console.log('🚨 HIGH PRIORITY: Will be sent first when connection is restored');
    console.log('=====================================================\n');

    // Show offline emergency notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 Emergency Alert Queued', {
        body: 'Emergency alert saved offline. Will send immediately when online.',
        icon: '/Niva Logo 1024x1024.png'
      });
    }

    if (showNotification) {
      showNotification();
    }
    return;
  }
  
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    
    // Simulate immediate sending for emergency
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`🚨 [URGENT ${i + 1}/${contacts.length}] Emergency Alert → ${contact.name}`);
    console.log(`   📱 SMS: ${contact.phone} - ✅ SIMULATED PRIORITY DELIVERY`);
    if (contact.email) {
      console.log(`   📧 Email: ${contact.email} - ✅ SIMULATED PRIORITY DELIVERY`);
    }
    console.log(`   💬 WhatsApp: ${contact.phone} - ✅ SIMULATED PRIORITY DELIVERY`);
    console.log(`   Relationship: ${contact.relationship}`);
    console.log(`   💡 In production: Would trigger immediate multi-channel alerts`);
    console.log('');
  }
  
  console.log('🚨 ALL EMERGENCY ALERT SIMULATIONS COMPLETED!');
  console.log('📞 In production: Contacts would be notified immediately');
  console.log('🆘 In production: Could also integrate with emergency services');
  console.log('=====================================================\n');

  // Show in-app notification
  if (showNotification) {
    showNotification();
  }
};

/**
 * Main function to share location with all contacts using enhanced offline support
 */
export const shareLocationWithContacts = async (
  location: LocationData, 
  userName: string = 'Your friend',
  showNotification?: (contactCount: number) => void
): Promise<void> => {
  const contacts: Contact[] = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
  const sessionData: SessionData | undefined = (() => {
    const saved = localStorage.getItem('activeSession');
    return saved ? JSON.parse(saved) : undefined;
  })();
  
  if (contacts.length === 0) {
    console.log('❌ No trusted contacts found');
    throw new Error('No trusted contacts available for location sharing');
  }
  
  const mode = isOnline() ? 'ONLINE SIMULATION' : 'OFFLINE MODE';
  
  console.log(`🛡️ NIVA LOCATION SHARING - ${mode}`);
  console.log('===================================================');
  console.log(`👤 User: ${userName}`);
  console.log(`📱 ${isOnline() ? 'Simulating sharing' : 'Queuing for sync'} with ${contacts.length} trusted contacts`);
  console.log(`📍 Location: ${location.latitude}, ${location.longitude}`);
  console.log(`🕐 Time: ${new Date(location.timestamp).toLocaleString()}`);
  console.log(`🌐 Connection: ${isOnline() ? 'Online' : 'Offline'}`);
  
  if (sessionData?.selectedRoute) {
    console.log(`🗺️ Active Route: ${sessionData.selectedRoute.name}`);
  }
  
  console.log('\n👥 Trusted Circle:');
  contacts.forEach((contact, index) => {
    console.log(`   ${index + 1}. ${contact.name} (${contact.relationship})`);
    console.log(`      📱 ${contact.phone}`);
    if (contact.email) {
      console.log(`      📧 ${contact.email}`);
    }
  });
  console.log('');
  
  try {
    // Start multi-channel sharing
    console.log(`🚀 Starting multi-channel ${isOnline() ? 'simulation' : 'offline queuing'}...\n`);
    
    // Primary: SMS
    await shareLocationViaSMS(contacts, location, userName, sessionData, showNotification);
    
    // Secondary: WhatsApp (if available)
    await shareLocationViaWhatsApp(contacts, location, userName, sessionData);
    
    // Backup: Email
    await shareLocationViaEmail(contacts, location, userName, sessionData);
    
    console.log(`✅ LOCATION SHARING ${mode} COMPLETED!`);
    console.log('=========================================');
    console.log('📊 Summary:');
    if (isOnline()) {
      console.log(`   📱 SMS: ${contacts.length} messages simulated`);
      console.log(`   💬 WhatsApp: ${contacts.length} messages simulated`);
      console.log(`   📧 Email: ${contacts.filter(c => c.email).length} emails simulated`);
      console.log(`   🎯 Total notifications: ${contacts.length * 3} would be delivered`);
      console.log('   💡 Ready for production backend integration!');
    } else {
      console.log(`   📴 All messages queued for offline sync`);
      console.log(`   💾 Data stored locally and secure`);
      console.log(`   🔄 Will sync automatically when online`);
      console.log(`   🛡️ Your safety data is protected!`);
    }
    console.log('=========================================\n');
    
  } catch (error) {
    console.error(`❌ Failed to ${isOnline() ? 'simulate' : 'queue'} location sharing:`, error);
    throw error;
  }
};

/**
 * Gets user's display name from localStorage or returns default
 */
export const getUserDisplayName = (): string => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    const parsed = JSON.parse(userData);
    return parsed.name || 'Your friend';
  }
  return 'Your friend';
};

/**
 * Get offline status and pending actions
 */
export const getOfflineStatus = () => {
  const pendingActions = JSON.parse(localStorage.getItem('pendingOfflineActions') || '[]');
  const locationHistory = JSON.parse(localStorage.getItem('offlineLocationHistory') || '[]');
  
  return {
    isOnline: isOnline(),
    pendingActionsCount: pendingActions.length,
    offlineLocationsCount: locationHistory.length,
    lastOfflineAction: pendingActions.length > 0 ? pendingActions[pendingActions.length - 1] : null
  };
};