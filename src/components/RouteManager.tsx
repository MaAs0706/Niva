import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Route, 
  Edit, 
  Trash2, 
  Play, 
  Navigation,
  Home,
  Briefcase,
  Coffee,
  ShoppingBag,
  Heart,
  Star,
  ArrowRight,
  X,
  Save,
  CheckCircle
} from 'lucide-react';
import MapView from './MapView';

interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  estimatedTime: number; // minutes
  type: 'start' | 'waypoint' | 'destination';
}

interface SavedRoute {
  id: string;
  name: string;
  description: string;
  type: 'work' | 'home' | 'shopping' | 'social' | 'other';
  waypoints: Waypoint[];
  totalTime: number;
  createdAt: number;
  lastUsed?: number;
}

const RouteManager: React.FC = () => {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    estimatedTime: 5
  });
  
  const [newRoute, setNewRoute] = useState<Partial<SavedRoute>>({
    name: '',
    description: '',
    type: 'work',
    waypoints: [],
  });

  useEffect(() => {
    const savedRoutes = localStorage.getItem('savedRoutes');
    if (savedRoutes) {
      try {
        const parsed = JSON.parse(savedRoutes);
        setRoutes(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error parsing saved routes:', error);
        setRoutes([]);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('savedRoutes', JSON.stringify(routes));
    } catch (error) {
      console.error('Error saving routes to localStorage:', error);
    }
  }, [routes]);

  const routeTypeIcons = {
    work: Briefcase,
    home: Home,
    shopping: ShoppingBag,
    social: Coffee,
    other: Star
  };

  const routeTypeColors = {
    work: 'from-blue-500 to-indigo-600',
    home: 'from-emerald-500 to-teal-600',
    shopping: 'from-purple-500 to-pink-600',
    social: 'from-orange-500 to-red-600',
    other: 'from-slate-500 to-slate-600'
  };

  const handleCreateRoute = async () => {
    if (!newRoute.name?.trim()) {
      alert('Please add a route name');
      return;
    }
    
    if (!newRoute.waypoints || newRoute.waypoints.length < 2) {
      alert('Please add at least 2 locations (start and destination)');
      return;
    }

    setIsSaving(true);

    try {
      // Simulate saving process
      await new Promise(resolve => setTimeout(resolve, 1000));

      const totalTime = newRoute.waypoints.reduce((sum, wp) => sum + wp.estimatedTime, 0);
      
      const route: SavedRoute = {
        id: editingRoute || Date.now().toString(),
        name: newRoute.name.trim(),
        description: newRoute.description?.trim() || '',
        type: newRoute.type || 'other',
        waypoints: newRoute.waypoints,
        totalTime,
        createdAt: editingRoute ? routes.find(r => r.id === editingRoute)?.createdAt || Date.now() : Date.now(),
      };

      let updatedRoutes;
      if (editingRoute) {
        updatedRoutes = routes.map(r => r.id === editingRoute ? route : r);
      } else {
        updatedRoutes = [...routes, route];
      }

      setRoutes(updatedRoutes);
      
      // Show success
      setSaveSuccess(true);
      
      // Reset form after success animation
      setTimeout(() => {
        setNewRoute({ name: '', description: '', type: 'work', waypoints: [] });
        setIsCreating(false);
        setEditingRoute(null);
        setShowMap(false);
        setSelectedLocation(null);
        setShowLocationForm(false);
        setLocationFormData({ name: '', estimatedTime: 5 });
        setSaveSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoute = (id: string) => {
    if (confirm('Delete this route?')) {
      const updatedRoutes = routes.filter(r => r.id !== id);
      setRoutes(updatedRoutes);
    }
  };

  const handleStartRoute = (route: SavedRoute) => {
    // Update last used timestamp
    const updatedRoutes = routes.map(r => 
      r.id === route.id ? { ...r, lastUsed: Date.now() } : r
    );
    setRoutes(updatedRoutes);

    // In a real app, this would start the companion session with this route
    alert(`Starting route: ${route.name}\nEstimated time: ${route.totalTime} minutes`);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setShowLocationForm(true);
    // Clear any previous form data
    setLocationFormData({ name: '', estimatedTime: 5 });
  };

  const addLocationToRoute = () => {
    if (!selectedLocation || !locationFormData.name.trim()) {
      alert('Please enter a location name');
      return;
    }

    const waypointType = newRoute.waypoints?.length === 0 ? 'start' : 'waypoint';
    
    const waypoint: Waypoint = {
      id: Date.now().toString(),
      name: locationFormData.name.trim(),
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      estimatedTime: locationFormData.estimatedTime,
      type: waypointType
    };

    // Update the last waypoint to be destination if this is the second or later waypoint
    const updatedWaypoints = [...(newRoute.waypoints || []), waypoint];
    if (updatedWaypoints.length > 1) {
      updatedWaypoints[updatedWaypoints.length - 2].type = 'waypoint';
      updatedWaypoints[updatedWaypoints.length - 1].type = 'destination';
    }

    setNewRoute(prev => ({
      ...prev,
      waypoints: updatedWaypoints
    }));

    // Reset form
    setLocationFormData({ name: '', estimatedTime: 5 });
    setSelectedLocation(null);
    setShowLocationForm(false);
  };

  const cancelLocationSelection = () => {
    setSelectedLocation(null);
    setShowLocationForm(false);
    setLocationFormData({ name: '', estimatedTime: 5 });
  };

  const removeWaypoint = (waypointId: string) => {
    const updatedWaypoints = newRoute.waypoints?.filter(wp => wp.id !== waypointId) || [];
    
    // Update types after removal
    if (updatedWaypoints.length > 0) {
      updatedWaypoints[0].type = 'start';
      if (updatedWaypoints.length > 1) {
        updatedWaypoints[updatedWaypoints.length - 1].type = 'destination';
        for (let i = 1; i < updatedWaypoints.length - 1; i++) {
          updatedWaypoints[i].type = 'waypoint';
        }
      }
    }
    
    setNewRoute(prev => ({
      ...prev,
      waypoints: updatedWaypoints
    }));
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getMapMarkers = () => {
    const markers = [];
    
    // Add existing waypoints
    if (newRoute.waypoints) {
      markers.push(...newRoute.waypoints.map(wp => ({
        lat: wp.latitude,
        lng: wp.longitude,
        title: wp.name,
        type: wp.type
      })));
    }
    
    // Add selected location if it exists
    if (selectedLocation) {
      markers.push({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        title: 'Selected Location',
        type: 'selected' as any
      });
    }
    
    return markers;
  };

  const getMapCenter = () => {
    if (!newRoute.waypoints || newRoute.waypoints.length === 0) return undefined;
    
    // Return center of first waypoint
    return {
      lat: newRoute.waypoints[0].latitude,
      lng: newRoute.waypoints[0].longitude
    };
  };

  const getRouteWaypoints = () => {
    if (!newRoute.waypoints || newRoute.waypoints.length < 2) return [];
    
    // Return intermediate waypoints (exclude start and end)
    return newRoute.waypoints
      .slice(1, -1)
      .map(wp => ({ lat: wp.latitude, lng: wp.longitude }));
  };

  const shouldShowRoute = () => {
    // Show route if we have at least 2 waypoints OR if we have 1 waypoint and a selected location
    const totalPoints = (newRoute.waypoints?.length || 0) + (selectedLocation ? 1 : 0);
    return totalPoints >= 2;
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setEditingRoute(null);
    setNewRoute({ name: '', description: '', type: 'work', waypoints: [] });
    setShowMap(false);
    setSelectedLocation(null);
    setShowLocationForm(false);
    setLocationFormData({ name: '', estimatedTime: 5 });
    setSaveSuccess(false);
  };

  return (
    <div className="p-6 pb-28">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Your Routes</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg transition-colors duration-300">Save your regular journeys for quick companion sessions</p>
      </div>

      {/* Success Modal */}
      {saveSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Route Saved! ✨</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Your route has been successfully saved and is ready to use.</p>
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Create Route Button */}
      {!isCreating && (
        <button
          onClick={() => {
            setIsCreating(true);
            setShowMap(true); // Automatically show map when creating
          }}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl p-8 font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-4 mb-8"
        >
          <Plus className="w-6 h-6" />
          <span>Create New Route</span>
        </button>
      )}

      {/* Create Route Form */}
      {isCreating && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-8 border border-orange-100/50 dark:border-slate-700/50 transition-colors duration-300">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-8 text-2xl transition-colors duration-300">
            {editingRoute ? 'Edit Route' : 'Create New Route'}
          </h3>
          
          <div className="space-y-6">
            <input
              type="text"
              value={newRoute.name || ''}
              onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
              className="w-full px-6 py-4 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-lg transition-colors duration-300"
              placeholder="Route name (e.g., 'Work to Home')"
            />

            <textarea
              value={newRoute.description || ''}
              onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
              className="w-full px-6 py-4 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-300"
              placeholder="Description (optional)"
              rows={3}
            />

            {/* Route Type Selection */}
            <div>
              <label className="block text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 transition-colors duration-300">Route Type</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(routeTypeIcons).map(([type, Icon]) => (
                  <button
                    key={type}
                    onClick={() => setNewRoute({ ...newRoute, type: type as any })}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      newRoute.type === type
                        ? `border-indigo-500 bg-gradient-to-br ${routeTypeColors[type as keyof typeof routeTypeColors]} text-white shadow-lg`
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-3" />
                    <div className="text-lg font-bold capitalize">{type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Map Section - Always visible when creating */}
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Select Route Points</h4>
              <p className="text-slate-600 dark:text-slate-300 mb-6 transition-colors duration-300">Tap anywhere on the map to add locations. Routes will be drawn automatically!</p>
              
              <div className="mb-6">
                <MapView
                  onLocationSelect={handleLocationSelect}
                  markers={getMapMarkers()}
                  center={getMapCenter()}
                  height="h-80"
                  showRoute={shouldShowRoute()}
                  routeWaypoints={getRouteWaypoints()}
                />
              </div>

              {/* Location Selection Form - Shows when a location is selected */}
              {showLocationForm && selectedLocation && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-bold text-blue-900 dark:text-blue-100 flex items-center space-x-2 transition-colors duration-300">
                      <MapPin className="w-5 h-5" />
                      <span>Add This Location</span>
                    </h5>
                    <button
                      onClick={cancelLocationSelection}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-xl transition-colors duration-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-100 dark:bg-blue-800/50 rounded-xl p-4 transition-colors duration-300">
                      <p className="text-sm text-blue-700 dark:text-blue-200 font-medium transition-colors duration-300">
                        📍 Selected coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                      {newRoute.waypoints && newRoute.waypoints.length > 0 && (
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-2 transition-colors duration-300">
                          🗺️ Route will be drawn from your current location through all points
                        </p>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={locationFormData.name}
                      onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                      placeholder="What do you call this place? (e.g., 'Home', 'Office', 'Coffee Shop')"
                      autoFocus
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-200 mb-2 transition-colors duration-300">
                        Time spent here (minutes)
                      </label>
                      <input
                        type="number"
                        value={locationFormData.estimatedTime}
                        onChange={(e) => setLocationFormData({ ...locationFormData, estimatedTime: parseInt(e.target.value) || 5 })}
                        className="w-full px-4 py-3 border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                        min="1"
                        max="120"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={addLocationToRoute}
                        disabled={!locationFormData.name.trim()}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        Add to Route
                      </button>
                      <button
                        onClick={cancelLocationSelection}
                        className="flex-1 bg-slate-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-colors duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Waypoints List */}
              <div className="space-y-4">
                <h5 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors duration-300">Route Points ({newRoute.waypoints?.length || 0})</h5>
                
                {newRoute.waypoints?.map((waypoint, index) => (
                  <div key={waypoint.id} className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl transition-colors duration-300">
                    <div className={`p-3 rounded-2xl ${
                      waypoint.type === 'start' ? 'bg-green-100 dark:bg-green-900/50' : 
                      waypoint.type === 'destination' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-blue-100 dark:bg-blue-900/50'
                    } transition-colors duration-300`}>
                      {waypoint.type === 'start' ? (
                        <Navigation className="w-5 h-5 text-green-600 dark:text-green-400 transition-colors duration-300" />
                      ) : waypoint.type === 'destination' ? (
                        <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 transition-colors duration-300" />
                      ) : (
                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{waypoint.name}</h6>
                      <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
                        {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)} • {waypoint.estimatedTime}min
                      </p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        waypoint.type === 'start' ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' :
                        waypoint.type === 'destination' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300' :
                        'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                      } transition-colors duration-300`}>
                        {waypoint.type === 'start' ? 'Start Point' : 
                         waypoint.type === 'destination' ? 'Destination' : 'Stop'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeWaypoint(waypoint.id)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {(!newRoute.waypoints || newRoute.waypoints.length === 0) && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-2xl transition-colors duration-300">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-500 transition-colors duration-300" />
                    <p className="font-medium text-lg">No route points added yet</p>
                    <p className="text-sm">Tap anywhere on the map above to add your first location</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCreateRoute}
                disabled={!newRoute.name?.trim() || !newRoute.waypoints || newRoute.waypoints.length < 2 || isSaving}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Route...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingRoute ? 'Update Route' : 'Save Route'}</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancelCreate}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routes List */}
      <div className="space-y-6">
        {routes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
              <Route className="w-8 h-8 text-purple-400 dark:text-purple-500 transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 transition-colors duration-300">No routes yet</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">Create your first route to get started with quick companion sessions</p>
          </div>
        ) : (
          routes.map((route) => {
            const Icon = routeTypeIcons[route.type];
            return (
              <div key={route.id} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-orange-100/50 dark:border-slate-700/50 transition-colors duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${routeTypeColors[route.type]} text-white shadow-lg`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{route.name}</h3>
                      {route.description && (
                        <p className="text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">{route.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(route.totalTime)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{route.waypoints.length} stops</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="p-3 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Route Preview */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {route.waypoints.map((waypoint, index) => (
                      <React.Fragment key={waypoint.id}>
                        <div className="flex-shrink-0 text-center">
                          <div className={`w-3 h-3 rounded-full ${
                            waypoint.type === 'start' ? 'bg-green-500' : 
                            waypoint.type === 'destination' ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-20 truncate transition-colors duration-300">{waypoint.name}</p>
                        </div>
                        {index < route.waypoints.length - 1 && (
                          <ArrowRight className="flex-shrink-0 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleStartRoute(route)}
                  className={`w-full bg-gradient-to-r ${routeTypeColors[route.type]} text-white py-4 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-3`}
                >
                  <Play className="w-6 h-6" />
                  <span>Start This Journey</span>
                </button>

                {route.lastUsed && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3 transition-colors duration-300">
                    Last used: {new Date(route.lastUsed).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RouteManager;