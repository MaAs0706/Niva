import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Shield, Navigation, Heart, Home, Route } from 'lucide-react';
import MapView from './MapView';
import RouteManager from './RouteManager';

interface SafePlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'safe' | 'comfortable';
  description: string;
  radius: number; // in meters
}

const SafeMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'places' | 'routes'>('places');
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [newPlace, setNewPlace] = useState({
    name: '',
    type: 'safe' as 'safe' | 'comfortable',
    description: '',
    radius: 100,
  });

  useEffect(() => {
    // Load saved places
    const saved = localStorage.getItem('safePlaces');
    if (saved) {
      setSafePlaces(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('safePlaces', JSON.stringify(safePlaces));
  }, [safePlaces]);

  const getCurrentLocationForPlace = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        console.error('Error getting location:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access would help mark your special places. You can enable it in your browser settings when you\'re ready.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information isn\'t available right now. Please try again in a moment.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request took too long. Please try again.');
            break;
          default:
            setLocationError('Having trouble getting your location. No worries, you can try again later.');
            break;
        }
      }
    );
  };

  const handleAddPlace = () => {
    if (!newPlace.name || !currentLocation) return;

    const place: SafePlace = {
      id: Date.now().toString(),
      name: newPlace.name,
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
      type: newPlace.type,
      description: newPlace.description,
      radius: newPlace.radius,
    };

    setSafePlaces([...safePlaces, place]);
    setNewPlace({
      name: '',
      type: 'safe',
      description: '',
      radius: 100,
    });
    setIsAdding(false);
    setCurrentLocation(null);
  };

  const handleDeletePlace = (id: string) => {
    if (confirm('Remove this place from your map?')) {
      setSafePlaces(safePlaces.filter(p => p.id !== id));
    }
  };

  const getDistanceFromCurrentLocation = (place: SafePlace) => {
    if (!currentLocation) return null;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = currentLocation.lat * Math.PI/180;
    const φ2 = place.latitude * Math.PI/180;
    const Δφ = (place.latitude - currentLocation.lat) * Math.PI/180;
    const Δλ = (place.longitude - currentLocation.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // Distance in meters
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const PlaceCard: React.FC<{ place: SafePlace }> = ({ place }) => {
    const distance = getDistanceFromCurrentLocation(place);
    
    return (
      <div className={`p-6 rounded-2xl border-2 shadow-sm ${
        place.type === 'safe' 
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${
              place.type === 'safe' ? 'bg-emerald-100' : 'bg-blue-100'
            }`}>
              {place.type === 'safe' ? (
                <Shield className="w-6 h-6 text-emerald-600" />
              ) : (
                <Home className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{place.name}</h3>
              <p className={`text-sm font-medium ${
                place.type === 'safe' ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {place.type === 'safe' ? 'Safe Haven' : 'Comfortable Space'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDeletePlace(place.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white/50 rounded-xl transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {place.description && (
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">{place.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-white/50 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs">{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
          </div>
          {distance && (
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-white/50 rounded-lg">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="font-medium">{distance} away</span>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-slate-500 font-medium">
          Comfort radius: {place.radius}m
        </div>
      </div>
    );
  };

  if (activeTab === 'routes') {
    return <RouteManager />;
  }

  return (
    <div className="p-6 pb-24">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Places & Routes</h2>
        </div>
        
        <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-purple-100">
          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'places'
                ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Safe Places</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'routes'
                ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-lg'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <Route className="w-5 h-5" />
            <span>My Routes</span>
          </button>
        </div>
      </div>

      <p className="text-slate-600 leading-relaxed text-lg mb-8">Mark the places that make you feel safe and comfortable</p>

      {/* Current Location Display */}
      {currentLocation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">You are here</h3>
              <p className="text-sm text-blue-700 font-mono">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Place Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Mark This Special Place</h3>
          {!currentLocation ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">We need your current location to mark this place</p>
              <button
                onClick={getCurrentLocationForPlace}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Get My Location
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <input
                type="text"
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                placeholder="What do you call this place? *"
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setNewPlace({ ...newPlace, type: 'safe' })}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    newPlace.type === 'safe'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <Shield className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-bold">Safe Haven</div>
                  <div className="text-xs mt-1">A place of security</div>
                </button>
                <button
                  onClick={() => setNewPlace({ ...newPlace, type: 'comfortable' })}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    newPlace.type === 'comfortable'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Home className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-bold">Comfort Zone</div>
                  <div className="text-xs mt-1">A place of peace</div>
                </button>
              </div>

              <textarea
                value={newPlace.description}
                onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="What makes this place special? (optional)"
                rows={3}
              />

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Comfort Radius: {newPlace.radius}m
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={newPlace.radius}
                  onChange={(e) => setNewPlace({ ...newPlace, radius: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Close by</span>
                  <span>Wider area</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddPlace}
                  disabled={!newPlace.name}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Mark This Place
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setCurrentLocation(null);
                    setNewPlace({ name: '', type: 'safe', description: '', radius: 100 });
                  }}
                  className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Location Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-3 mb-8"
        >
          <Plus className="w-5 h-5" />
          <span>Mark Current Location</span>
        </button>
      )}

      {/* Location Error Display */}
      {locationError && !isAdding && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Heart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 mb-2">Location Needed</h4>
              <p className="text-sm text-amber-800 leading-relaxed">{locationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Places List */}
      <div className="space-y-6">
        {safePlaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Your map awaits</h3>
            <p className="text-slate-600 leading-relaxed">Start by marking the places that make you feel safe and comfortable</p>
          </div>
        ) : (
          <>
            {safePlaces.filter(p => p.type === 'safe').length > 0 && (
              <div>
                <h3 className="font-bold text-emerald-700 mb-4 flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span>Safe Havens ({safePlaces.filter(p => p.type === 'safe').length})</span>
                </h3>
                <div className="space-y-4">
                  {safePlaces.filter(p => p.type === 'safe').map(place => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </div>
            )}

            {safePlaces.filter(p => p.type === 'comfortable').length > 0 && (
              <div>
                <h3 className="font-bold text-blue-700 mb-4 flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Home className="w-5 h-5" />
                  </div>
                  <span>Comfort Zones ({safePlaces.filter(p => p.type === 'comfortable').length})</span>
                </h3>
                <div className="space-y-4">
                  {safePlaces.filter(p => p.type === 'comfortable').map(place => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SafeMap;