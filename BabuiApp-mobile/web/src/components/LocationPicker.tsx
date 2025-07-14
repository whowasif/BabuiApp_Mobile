import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Navigation, Crosshair } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { Select, defaults as defaultInteractions } from 'ol/interaction';
import { click } from 'ol/events/condition';
import 'ol/ol.css';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number; address?: string } | null;
  height?: string;
}

// Custom marker style for location picker (red circle)
const createLocationMarkerStyle = () => {
  return new Style({
    image: new Circle({
      radius: 12,
      fill: new Fill({
        color: '#ef4444'
      }),
      stroke: new Stroke({
        color: '#ffffff',
        width: 2
      })
    })
  });
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  height = "400px"
}) => {
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [suggestions] = useState<Array<{ place_id: string; display_name: string; lon: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const defaultCenter = useMemo(() => [90.4125, 23.8103], []); // Dhaka center

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source for marker
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    // Create vector layer for marker
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: createLocationMarkerStyle()
    });
    vectorLayerRef.current = vectorLayer;

    // Create tile layer
    const tileLayer = new TileLayer({
      source: new OSM()
    });

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer],
      view: new View({
        center: fromLonLat(defaultCenter),
        zoom: selectedLocation ? 15 : 12,
        minZoom: 8,
        maxZoom: 18
      }),
      interactions: defaultInteractions().extend([
        new Select({
          condition: click,
          layers: [vectorLayer]
        })
      ])
    });

    mapInstanceRef.current = map;

    // Handle map click
    map.on('click', async (event) => {
      const coordinate = event.coordinate;
      const [lng, lat] = toLonLat(coordinate);
      
      // Try to get address from coordinates using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        const location = { lat, lng, address };
        setSelectedLocation(location);
        onLocationSelect(location);
      } catch (error) {
        console.error('Error getting address:', error);
        const location = { lat, lng };
        setSelectedLocation(location);
        onLocationSelect(location);
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [onLocationSelect, defaultCenter, selectedLocation]);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!vectorSourceRef.current || !mapInstanceRef.current) return;

    vectorSourceRef.current.clear();

    if (selectedLocation) {
      const coordinate = fromLonLat([selectedLocation.lng, selectedLocation.lat]);
      const feature = new Feature({
        geometry: new Point(coordinate)
      });
      feature.setStyle(createLocationMarkerStyle());
      vectorSourceRef.current.addFeature(feature);

      // Center map on selected location
      mapInstanceRef.current.getView().animate({
        center: coordinate,
        zoom: 15,
        duration: 1000
      });
    }
  }, [selectedLocation]);

  // Add this effect to sync selectedLocation with initialLocation
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=bd&limit=5`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const [lng, lat] = result.lon.split(',').map(Number);
        const location = { lat, lng, address: result.display_name };
        setSelectedLocation(location);
        onLocationSelect(location);
        setSearchQuery('');
        setShowSuggestions(false);
      } else {
        setSearchError(t('no-results', 'কোন ফলাফল পাওয়া যায়নি', 'No results found'));
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(t('search-error', 'অনুসন্ধানে ত্রুটি হয়েছে', 'Search error occurred'));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: { place_id: string; display_name: string; lon: string }) => {
    const [lng, lat] = suggestion.lon.split(',').map(Number);
    const location = { lat, lng, address: suggestion.display_name };
    setSelectedLocation(location);
    onLocationSelect(location);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            const location = { lat: latitude, lng: longitude, address };
            setSelectedLocation(location);
            onLocationSelect(location);
          } catch (error) {
            console.error('Error getting address:', error);
            const location = { lat: latitude, lng: longitude };
            setSelectedLocation(location);
            onLocationSelect(location);
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
          // Show error message
          alert(t('location-error', 'অবস্থান পাওয়া যায়নি। অনুগ্রহ করে ম্যানুয়ালি পিন করুন।', 'Location not available. Please pin manually.'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLoading(false);
      alert(t('geolocation-not-supported', 'আপনার ব্রাউজার অবস্থান সেবা সমর্থন করে না।', 'Geolocation is not supported by this browser.'));
    }
  };



  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form ref={searchContainerRef} onSubmit={handleSearch} className="relative flex gap-2 mb-2" autoComplete="off">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Search for a place or address..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          disabled={searchLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
          disabled={searchLoading}
        >
          {searchLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Navigation size={16} />
          )}
        </button>
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 left-0 right-12 mt-12 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto min-w-[300px]">
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                className="px-4 py-2 cursor-pointer hover:bg-teal-100 text-sm"
                onMouseDown={() => handleSuggestionClick(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </form>
      {searchError && <div className="text-red-600 text-sm mb-2">{searchError}</div>}

      {/* Map Container */}
      <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {t('selected-location', 'নির্বাচিত অবস্থান', 'Selected Location')}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Crosshair size={16} />
          )}
          {t('use-current-location', 'বর্তমান অবস্থান ব্যবহার করুন', 'Use Current Location')}
        </button>
      </div>
    </div>
  );
};

export default LocationPicker; 