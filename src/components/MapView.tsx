import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Plus, Clock, Route, Crosshair } from 'lucide-react';

interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    type?: 'current' | 'waypoint' | 'destination' | 'start' | 'selected';
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showRoute?: boolean;
  routeWaypoints?: Array<{ lat: number; lng: number }>;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapView: React.FC<MapViewProps> = ({ 
  onLocationSelect, 
  markers = [], 
  center,
  zoom = 13,
  height = "h-96",
  showRoute = false,
  routeWaypoints = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  // Initialize map without getting location automatically
  useEffect(() => {
    // Set default location (San Francisco) for initial map display
    const defaultLocation = { lat: 37.7749, lng: -122.4194 };
    setCurrentLocation(defaultLocation);

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            initializeMap();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeMap();
      };
      
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key and internet connection.');
      };
      
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google || !currentLocation) return;

      try {
        const mapCenter = center || currentLocation;
        
        // Create map with Google Maps default styling
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: zoom,
          mapTypeId: 'roadmap',
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: true,
          disableDefaultUI: false,
          keyboardShortcuts: true,
          scrollwheel: true,
          disableDoubleClickZoom: false,
          draggable: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_CENTER,
          },
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER
          },
          streetViewControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER
          },
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP
          }
        });

        // Initialize directions service and renderer
        const directionsServiceInstance = new window.google.maps.DirectionsService();
        const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 5,
            strokeOpacity: 0.8,
            geodesic: true
          },
          preserveViewport: false
        });
        
        directionsRendererInstance.setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);

        // Add click listener for location selection
        if (onLocationSelect) {
          mapInstance.addListener('click', (event: any) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onLocationSelect(lat, lng);
          });
        }

        setMap(mapInstance);
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        setError('Failed to initialize map. Please try refreshing the page.');
        console.error('Map initialization error:', err);
      }
    };

    loadGoogleMaps();
  }, [center, zoom, onLocationSelect]);

  // Draw route when showRoute is true and we have waypoints
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderer || !showRoute || !currentLocation) return;

    const destinations = markers.filter(m => m.type === 'selected' || m.type === 'destination');
    if (destinations.length === 0) return;

    const destination = destinations[destinations.length - 1];

    // Build waypoints array from routeWaypoints and intermediate markers
    const waypoints = [
      ...routeWaypoints.map(wp => ({ location: wp, stopover: true })),
      ...markers
        .filter(m => m.type === 'waypoint')
        .map(m => ({ location: { lat: m.lat, lng: m.lng }, stopover: true }))
    ];

    const request = {
      origin: currentLocation,
      destination: { lat: destination.lat, lng: destination.lng },
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
      optimizeWaypoints: true
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        
        // Extract route information
        const route = result.routes[0];
        let totalDistance = 0;
        let totalDuration = 0;
        
        route.legs.forEach((leg: any) => {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });

        // Convert to readable format
        const distanceText = totalDistance >= 1000 
          ? `${(totalDistance / 1000).toFixed(1)} km`
          : `${totalDistance} m`;
        
        const durationText = totalDuration >= 3600
          ? `${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`
          : `${Math.floor(totalDuration / 60)}m`;

        setRouteInfo({
          distance: distanceText,
          duration: durationText
        });
      } else {
        console.error('Directions request failed due to ' + status);
        setRouteInfo(null);
        directionsRenderer.setDirections({ routes: [] });
      }
    });
  }, [map, directionsService, directionsRenderer, showRoute, markers, routeWaypoints, currentLocation]);

  // Update markers when they change
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing custom markers
    mapMarkers.forEach(marker => marker.setMap(null));
    setMapMarkers([]);

    const newMarkers: any[] = [];

    // Add new markers with Google-style icons
    markers.forEach((marker, index) => {
      const mapMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: map,
        title: marker.title,
        icon: getGoogleStyleMarkerIcon(marker.type || 'waypoint'),
        animation: marker.type === 'selected' ? window.google.maps.Animation.BOUNCE : window.google.maps.Animation.DROP,
        zIndex: marker.type === 'selected' ? 1000 : 100,
      });

      // Add info window with Google-style design
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: 'Google Sans', Roboto, Arial, sans-serif; max-width: 250px; line-height: 1.4;">
            <div style="font-weight: 500; color: #202124; font-size: 16px; margin-bottom: 8px;">${marker.title}</div>
            <div style="color: #5f6368; font-size: 14px; margin-bottom: 8px;">
              ${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}
            </div>
            <div style="background: #f8f9fa; padding: 8px; border-radius: 8px; font-size: 12px; color: #5f6368; margin-bottom: 8px;">
              ${getMarkerTypeLabel(marker.type || 'waypoint')}
            </div>
            ${routeInfo && marker.type === 'selected' ? `
              <div style="background: #4285f4; color: white; padding: 12px; border-radius: 8px; font-size: 14px;">
                <div style="font-weight: 500; margin-bottom: 4px;">📍 Route Information</div>
                <div style="margin-bottom: 2px;">🚗 Distance: ${routeInfo.distance}</div>
                <div>⏱️ Duration: ${routeInfo.duration}</div>
              </div>
            ` : ''}
          </div>
        `,
        pixelOffset: new window.google.maps.Size(0, -10)
      });

      mapMarker.addListener('click', () => {
        // Close other info windows
        newMarkers.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        infoWindow.open(map, mapMarker);
      });

      mapMarker.infoWindow = infoWindow;
      newMarkers.push(mapMarker);
    });

    setMapMarkers(newMarkers);
  }, [map, markers, isLoaded, routeInfo]);

  const getGoogleStyleMarkerIcon = (type: string) => {
    switch (type) {
      case 'current':
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        };
      case 'start':
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#34A853',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        };
      case 'destination':
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EA4335',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        };
      case 'selected':
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#FBBC04',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        };
      default: // waypoint
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#FF6D01',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        };
    }
  };

  const getMarkerTypeLabel = (type: string) => {
    switch (type) {
      case 'current': return '📍 Your Location';
      case 'start': return '🟢 Starting Point';
      case 'destination': return '🔴 Destination';
      case 'selected': return '⭐ Selected Location';
      default: return '🟠 Waypoint';
    }
  };

  const goToCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map) {
          map.setCenter(pos);
          map.setZoom(16);

          // Add/update current location marker
          new window.google.maps.Marker({
            position: pos,
            map: map,
            title: 'Your Current Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            animation: window.google.maps.Animation.BOUNCE,
            zIndex: 1000,
          });

          setTimeout(() => {
            const markers = map.markers || [];
            markers.forEach((marker: any) => {
              if (marker.getTitle() === 'Your Current Location') {
                marker.setAnimation(null);
              }
            });
          }, 2000);
        }

        setCurrentLocation(pos);
        setIsGettingLocation(false);
      },
      (error) => {
        setError('Unable to get your location. Please enable location services.');
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  if (error) {
    return (
      <div className={`w-full ${height} bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Map Error</h3>
          <p className="text-red-700 mb-4 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${height} bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-lg`}>
      {(!isLoaded || isGettingLocation) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-blue-700 font-semibold">
              {isGettingLocation ? 'Finding your location...' : 'Loading Google Maps...'}
            </p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Route Info Display */}
      {routeInfo && showRoute && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-56">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Route className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-900">Route</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium text-gray-900">{routeInfo.distance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">{routeInfo.duration}</span>
            </div>
          </div>
        </div>
      )}
      
      {isLoaded && (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-3">
          <button
            onClick={goToCurrentLocation}
            disabled={isGettingLocation}
            className="bg-white text-gray-700 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Go to current location"
          >
            {isGettingLocation ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Crosshair className="w-6 h-6" />
            )}
          </button>
          
          {onLocationSelect && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-40">
              <p className="text-xs text-gray-600 font-medium text-center leading-tight">
                Tap anywhere to select location
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapView;