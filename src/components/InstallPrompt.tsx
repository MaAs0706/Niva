import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Plus, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Always show install button if not installed
    if (!standalone) {
      setShowInstallButton(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay if not already installed
      if (!standalone && !sessionStorage.getItem('installPromptDismissed')) {
        setTimeout(() => setShowInstallPrompt(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else if (isIOS) {
      // Show iOS instructions
      setShowInstallPrompt(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show anything if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Floating Install Button - Always visible */}
      {showInstallButton && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 group"
            title="Install Niva App"
          >
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Install App</span>
            </div>
          </button>
        </div>
      )}

      {/* Install Prompt Modal */}
      {showInstallPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full transition-colors duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                    <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl">Install Niva</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Get the app for the best experience</p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isIOS ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center space-x-2">
                      <Share className="w-5 h-5" />
                      <span>Install on iPhone/iPad</span>
                    </h4>
                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-3 list-decimal list-inside">
                      <li className="flex items-start space-x-2">
                        <span className="font-semibold min-w-[20px]">1.</span>
                        <span>Tap the <strong>Share button</strong> <Share className="w-4 h-4 inline mx-1" /> in Safari</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="font-semibold min-w-[20px]">2.</span>
                        <span>Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus className="w-4 h-4 inline mx-1" /></span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="font-semibold min-w-[20px]">3.</span>
                        <span>Tap <strong>"Add"</strong> to install Niva on your home screen</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={handleDismiss}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-8 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                      Install Niva for faster access, offline features, and a native app experience
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                          <Monitor className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Works Offline</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                          <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Native Feel</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                          <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Quick Access</p>
                      </div>
                    </div>

                    <button
                      onClick={handleInstallClick}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3 text-lg"
                    >
                      <Download className="w-6 h-6" />
                      <span>Install Niva App</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={handleDismiss}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium transition-colors duration-200"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;