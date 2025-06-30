import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Users, Settings, Activity, Heart, Route, TestTube } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CompanionMode from './components/CompanionMode';
import ContactsManager from './components/ContactsManager';
import SafeMap from './components/SafeMap';
import RouteManager from './components/RouteManager';
import SettingsPanel from './components/SettingsPanel';
import LocationSharingTest from './components/LocationSharingTest';
import LandingPage from './components/LandingPage';
import OnboardingTour from './components/OnboardingTour';
import InstallPrompt from './components/InstallPrompt';
import { SessionProvider } from './contexts/SessionContext';
import { LocationProvider } from './contexts/LocationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

type ActiveView = 'landing' | 'dashboard' | 'companion' | 'contacts' | 'map' | 'routes' | 'settings' | 'test';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenLanding, setHasSeenLanding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for first-time user and active session on mount
  useEffect(() => {
    // Add a small delay to ensure proper loading
    const initializeApp = () => {
      const hasSeenLandingBefore = localStorage.getItem('hasSeenLanding');
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
      
      console.log('App initialization:', {
        hasSeenLandingBefore,
        hasCompletedOnboarding,
        currentView: activeView
      });
      
      if (!hasSeenLandingBefore) {
        // First time user - show landing page
        setActiveView('landing');
        setHasSeenLanding(false);
      } else {
        // Returning user - go to dashboard
        setHasSeenLanding(true);
        setActiveView('dashboard');
        
        // Show onboarding if they haven't seen it
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
      }

      // Check for active session
      const savedSession = localStorage.getItem('activeSession');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.isActive && Date.now() - session.startTime < 24 * 60 * 60 * 1000) {
            setIsSessionActive(true);
            if (hasSeenLandingBefore) {
              setActiveView('companion');
            }
          } else {
            localStorage.removeItem('activeSession');
          }
        } catch (error) {
          console.error('Error parsing session data:', error);
          localStorage.removeItem('activeSession');
        }
      }
      
      setIsLoading(false);
    };

    // Small delay to ensure proper initialization
    setTimeout(initializeApp, 100);
  }, []);

  const handleGetStarted = () => {
    console.log('Get started clicked');
    localStorage.setItem('hasSeenLanding', 'true');
    setHasSeenLanding(true);
    setActiveView('dashboard');
    
    // Show onboarding for new users
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleStartSession = () => {
    const sessionData = {
      isActive: true,
      startTime: Date.now(),
      lastPing: Date.now(),
      lastCheckIn: Date.now(),
      checkInInterval: 15,
      pingInterval: 3
    };
    
    localStorage.setItem('activeSession', JSON.stringify(sessionData));
    setIsSessionActive(true);
    setActiveView('companion');
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setActiveView('dashboard');
    localStorage.removeItem('activeSession');
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-teal-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <img 
              src="/Niva Logo 1024x1024.png" 
              alt="Niva Logo" 
              className="w-12 h-12 rounded-2xl"
            />
          </div>
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (activeView === 'landing') {
      return <LandingPage onGetStarted={handleGetStarted} />;
    }

    switch (activeView) {
      case 'companion':
        return <CompanionMode isActive={isSessionActive} onEndSession={handleEndSession} />;
      case 'contacts':
        return <ContactsManager />;
      case 'map':
        return <SafeMap />;
      case 'routes':
        return <RouteManager />;
      case 'settings':
        return <SettingsPanel />;
      case 'test':
        return <LocationSharingTest />;
      default:
        return <Dashboard onStartSession={handleStartSession} />;
    }
  };

  // Show landing page without navigation
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen">
        {renderView()}
        <InstallPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-teal-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Enhanced Header */}
      <header className="relative overflow-hidden">
        {/* Background with subtle pattern - Dark mode friendly */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95 backdrop-blur-xl"></div>
        
        {/* Decorative elements - Dark mode friendly */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-teal-200/30 dark:from-purple-800/20 dark:to-teal-800/20 rounded-full -translate-x-16 -translate-y-16 blur-xl"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-200/30 to-purple-200/30 dark:from-teal-800/20 dark:to-purple-800/20 rounded-full translate-x-12 -translate-y-12 blur-xl"></div>
        
        <div className="relative max-w-md mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo and Brand Section */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Logo Container */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-teal-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 dark:bg-slate-800/80 p-2 rounded-3xl shadow-xl border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-105">
                  <img 
                    src="/Niva Logo 1024x1024.png" 
                    alt="Niva Logo" 
                    className="w-12 h-12 rounded-2xl"
                  />
                </div>
              </div>
              
              {/* Brand Text */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-300 bg-gradient-to-r from-purple-600 to-teal-600 dark:from-purple-400 dark:to-teal-400 bg-clip-text text-transparent">
                    Niva
                  </h1>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-teal-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold transition-colors duration-300 -mt-1">
                  Your safety companion ✨
                </p>
              </div>
            </div>

            {/* Session Status Badge */}
            {isSessionActive && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-md opacity-30 animate-pulse"></div>
                <div className="relative flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 px-4 py-3 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg backdrop-blur-sm transition-colors duration-300">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm text-emerald-700 dark:text-emerald-300 font-bold transition-colors duration-300">
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent dark:via-purple-700/50"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        {renderView()}
      </main>

      {/* Install Prompt */}
      <InstallPrompt />

      {/* Bottom Navigation - Dark mode friendly */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-purple-100/50 dark:border-slate-700/50 shadow-2xl transition-colors duration-300">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 ${
                activeView === 'dashboard'
                  ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/30 scale-110 shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:scale-105'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold">Home</span>
            </button>
            
            <button
              onClick={() => setActiveView('companion')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 ${
                activeView === 'companion'
                  ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/30 scale-110 shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:scale-105'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="text-xs font-bold">Companion</span>
            </button>

            <button
              onClick={() => setActiveView('routes')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 ${
                activeView === 'routes'
                  ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/30 scale-110 shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:scale-105'
              }`}
            >
              <Route className="w-4 h-4" />
              <span className="text-xs font-bold">Routes</span>
            </button>

            <button
              onClick={() => setActiveView('map')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 ${
                activeView === 'map'
                  ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/30 scale-110 shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:scale-105'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold">Places</span>
            </button>

            <button
              onClick={() => setActiveView('contacts')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 ${
                activeView === 'contacts'
                  ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/30 scale-110 shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:scale-105'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold">Circle</span>
            </button>

            <button
              onClick={() => setActiveView('test')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 ${
                activeView === 'test'
                  ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/30 scale-110 shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:scale-105'
              }`}
            >
              <TestTube className="w-4 h-4" />
              <span className="text-xs font-bold">Test</span>
            </button>

            <button
              onClick={() => setActiveView('settings')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all duration-300 ${
                activeView === 'settings'
                  ? 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-900/30 dark:to-teal-900/30 scale-110 shadow-lg'
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:scale-105'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs font-bold">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Onboarding Tour */}
      {showOnboarding && hasSeenLanding && (
        <OnboardingTour
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SessionProvider>
          <LocationProvider>
            <AppContent />
          </LocationProvider>
        </SessionProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;