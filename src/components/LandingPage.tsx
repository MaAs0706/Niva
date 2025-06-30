import React, { useState } from 'react';
import { 
  Shield, 
  Heart, 
  MapPin, 
  Users, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Play,
  Route,
  Bell,
  Camera,
  Settings,
  Download,
  Smartphone,
  Monitor
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showInstallInfo, setShowInstallInfo] = useState(false);

  const features = [
    {
      icon: Heart,
      title: "Your Silent Companion",
      description: "I watch over you with care, sharing your location and checking in gently",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: Users,
      title: "Trusted Circle",
      description: "Connect with people who care about you most - they'll be notified if you need support",
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: Route,
      title: "Smart Routes",
      description: "Save your regular journeys and get intelligent monitoring based on your trip duration",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: Clock,
      title: "Intelligent Timing",
      description: "Adaptive check-ins that adjust based on your journey length and remaining time",
      color: "from-amber-400 to-orange-500"
    }
  ];

  const handleInstallClick = () => {
    setShowInstallInfo(true);
  };

  const handleGetStartedClick = () => {
    console.log('Landing page: Get started clicked');
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-teal-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-800/20 dark:to-pink-800/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-bl from-teal-200/30 to-cyan-200/30 dark:from-teal-800/20 dark:to-cyan-800/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 dark:from-indigo-800/20 dark:to-purple-800/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-20">
          {/* Logo and Brand */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-teal-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative bg-white/90 dark:bg-slate-800/90 p-4 rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
                  <img 
                    src="/Niva Logo 1024x1024.png" 
                    alt="Niva Logo" 
                    className="w-20 h-20 rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-slate-800 dark:text-slate-100 mb-6 tracking-tight transition-colors duration-300">
              <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-teal-600 dark:from-purple-400 dark:via-purple-500 dark:to-teal-400 bg-clip-text text-transparent">
                Welcome to Niva
              </span>
            </h1>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-700 dark:text-slate-200 mb-8 transition-colors duration-300">
                Your Silent Safety Companion
              </h2>
              <div className="absolute -top-2 -right-4 md:-right-8">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-teal-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-12 transition-colors duration-300">
              I'm here to keep you safe, supported, and connected to the people who love you most. 
              With intelligent monitoring and gentle care, you're never truly alone.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button
                onClick={handleGetStartedClick}
                className="group bg-gradient-to-r from-purple-500 via-purple-600 to-teal-500 text-white px-12 py-6 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-4"
              >
                <span>Begin Your Journey</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button
                onClick={handleInstallClick}
                className="group bg-white/90 dark:bg-slate-800/90 text-purple-600 dark:text-purple-400 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-3 border border-purple-200 dark:border-purple-700"
              >
                <Download className="w-5 h-5" />
                <span>Download App</span>
              </button>
            </div>

            {/* Download Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-emerald-500" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span>Native app experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-purple-500" />
                <span>Quick home screen access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-6 transition-colors duration-300">
            How I Care for You
          </h3>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
            Every feature designed with love, empathy, and your safety in mind
          </p>
        </div>

        {/* Interactive Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = currentFeature === index;
            
            return (
              <div
                key={index}
                onMouseEnter={() => setCurrentFeature(index)}
                className={`relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 transform ${
                  isActive 
                    ? 'border-purple-300 dark:border-purple-700 bg-white/90 dark:bg-slate-800/90 shadow-2xl scale-105' 
                    : 'border-purple-100 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 shadow-lg hover:shadow-xl hover:scale-102'
                }`}
              >
                <div className="flex items-start space-x-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg ${isActive ? 'animate-pulse' : ''}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">
                      {feature.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-teal-500/10 rounded-3xl pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">Smart Location Sharing</h5>
            <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
              Intelligent location updates that adapt to your journey
            </p>
          </div>

          <div className="text-center p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">Gentle Check-ins</h5>
            <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
              Caring reminders that respect your space and privacy
            </p>
          </div>

          <div className="text-center p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg border border-purple-100/50 dark:border-slate-700/50 transition-colors duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">Safety Recording</h5>
            <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
              Record safety videos and document your journey
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-500/10 via-purple-600/10 to-teal-500/10 dark:from-purple-900/20 dark:via-purple-800/20 dark:to-teal-900/20 py-20 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="w-8 h-8 text-purple-500 dark:text-purple-400 transition-colors duration-300" />
            <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">Ready to feel safer?</h3>
            <Sparkles className="w-8 h-8 text-purple-500 dark:text-purple-400 transition-colors duration-300" />
          </div>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed transition-colors duration-300">
            Join thousands who trust Niva to keep them connected and protected. 
            Your safety journey starts with a single tap.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleGetStartedClick}
              className="group bg-gradient-to-r from-purple-500 via-purple-600 to-teal-500 text-white px-10 py-5 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-3"
            >
              <Play className="w-6 h-6" />
              <span>Start Your Safety Journey</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 transition-colors duration-300">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Free • Private • Caring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/50 dark:bg-slate-900/50 py-12 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/Niva Logo 1024x1024.png" 
              alt="Niva Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 dark:from-purple-400 dark:to-teal-400 bg-clip-text text-transparent">
              Niva
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
            Your silent safety companion, always by your side
          </p>
        </div>
      </div>

      {/* Install Info Modal */}
      {showInstallInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full transition-colors duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
                    <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xl">Download Niva</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Install for the best experience</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallInfo(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                >
                  <ArrowRight className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
                  <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-4">📱 How to Install</h4>
                  <div className="space-y-3 text-purple-800 dark:text-purple-200 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong>Chrome/Edge:</strong> Look for "Install" button in address bar</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong>iPhone:</strong> Tap Share → "Add to Home Screen"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span><strong>Android:</strong> Tap menu → "Install app"</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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

                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowInstallInfo(false);
                      handleGetStartedClick();
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
                  >
                    <Play className="w-5 h-5" />
                    <span>Continue to App</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;