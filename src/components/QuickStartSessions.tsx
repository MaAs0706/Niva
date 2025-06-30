import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  MapPin, 
  Route,
  Home,
  Briefcase,
  Coffee,
  ShoppingBag,
  Heart,
  Navigation,
  Sparkles
} from 'lucide-react';

interface MapLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface SavedRoute {
  id: string;
  name: string;
  description: string;
  startLocation: MapLocation;
  endLocation: MapLocation;
  estimatedTime: number;
  icon: string;
  color: string;
  waypoints?: MapLocation[];
}

interface QuickStartSessionsProps {
  onStartSession: (route: SavedRoute) => void;
}

const QuickStartSessions: React.FC<QuickStartSessionsProps> = ({ onStartSession }) => {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<SavedRoute[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedRoutes');
    if (saved) {
      const allRoutes = JSON.parse(saved);
      setRoutes(allRoutes);
      
      // Get recently used routes
      const recentIds = JSON.parse(localStorage.getItem('recentRoutes') || '[]');
      const recent = allRoutes.filter((route: SavedRoute) => recentIds.includes(route.id));
      setRecentRoutes(recent);
    }
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'home': return <Home className="w-6 h-6" />;
      case 'briefcase': return <Briefcase className="w-6 h-6" />;
      case 'coffee': return <Coffee className="w-6 h-6" />;
      case 'shopping-bag': return <ShoppingBag className="w-6 h-6" />;
      case 'heart': return <Heart className="w-6 h-6" />;
      default: return <Route className="w-6 h-6" />;
    }
  };

  const handleStartRoute = (route: SavedRoute) => {
    // Add to recent routes
    const recentIds = JSON.parse(localStorage.getItem('recentRoutes') || '[]');
    const updatedRecent = [route.id, ...recentIds.filter((id: string) => id !== route.id)].slice(0, 5);
    localStorage.setItem('recentRoutes', JSON.stringify(updatedRecent));
    
    onStartSession(route);
  };

  const RouteCard: React.FC<{ route: SavedRoute; isRecent?: boolean }> = ({ route, isRecent = false }) => (
    <div 
      className={`bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
        isRecent ? 'ring-2 ring-orange-200' : ''
      }`}
      onClick={() => handleStartRoute(route)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-3xl ${route.color} shadow-lg`}>
            {getIconComponent(route.icon)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{route.name}</h3>
            <p className="text-slate-600">{route.description}</p>
            {isRecent && (
              <div className="flex items-center space-x-2 mt-1">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-600">Recently used</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-slate-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{route.estimatedTime} min</span>
          </div>
          <button className="bg-gradient-to-r from-orange-400 to-rose-500 text-white p-3 rounded-2xl hover:shadow-lg transition-all duration-200">
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>From: {route.startLocation.name || 'Selected location'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-rose-600" />
          <span>To: {route.endLocation.name || 'Selected location'}</span>
        </div>
        {route.waypoints && route.waypoints.length > 0 && (
          <div className="flex items-center space-x-2">
            <Route className="w-4 h-4 text-blue-600" />
            <span>+{route.waypoints.length} stop{route.waypoints.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (routes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Route className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4">No routes saved yet</h3>
        <p className="text-slate-600 leading-relaxed text-lg mb-8">
          Create your first route in the Places section to get started with quick companion sessions
        </p>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <div className="text-left">
              <h4 className="font-bold text-amber-900">Pro tip</h4>
              <p className="text-amber-800 text-sm">
                Save routes like "Work to Home" or "Coffee Run" for instant companion sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Recent Routes */}
      {recentRoutes.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-800 mb-6 text-xl flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <span>Recently Used</span>
          </h3>
          <div className="grid gap-6">
            {recentRoutes.map((route) => (
              <RouteCard key={`recent-${route.id}`} route={route} isRecent={true} />
            ))}
          </div>
        </div>
      )}

      {/* All Routes */}
      <div>
        <h3 className="font-bold text-slate-800 mb-6 text-xl">All Your Routes ({routes.length})</h3>
        <div className="grid gap-6">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <Heart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-3 text-lg">Quick Start Benefits</h4>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Automatically sets estimated journey time</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Shares your route with your trusted circle</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Adjusts check-in frequency based on journey length</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartSessions;