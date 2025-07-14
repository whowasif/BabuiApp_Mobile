import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, X, ArrowRight, Locate, Layers, Car, Bike, Footprints, ChevronDown, Maximize2, Minus, Plus, LocateFixed } from 'lucide-react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { Point, LineString, Circle } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Icon, Stroke, Fill, Circle as StyleCircle } from 'ol/style';
import 'ol/ol.css';

// Search result interface
interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const LAYER_OPTIONS = [
  { key: 'default', label: 'Default', icon: <Layers className="w-5 h-5" /> },
  { key: 'satellite', label: 'Satellite', icon: <Layers className="w-5 h-5" /> },
  { key: 'terrain', label: 'Terrain', icon: <Layers className="w-5 h-5" /> },
];

const TRAVEL_MODES = [
  { key: 'car', label: 'Car', icon: <Car className="w-5 h-5" /> },
  { key: 'bike', label: 'Bike', icon: <Bike className="w-5 h-5" /> },
  { key: 'walk', label: 'Walk', icon: <Footprints className="w-5 h-5" /> },
];

const SimpleMapTest: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [layerType, setLayerType] = useState<'default' | 'satellite' | 'terrain'>('default');
  const [routingPanelOpen, setRoutingPanelOpen] = useState(true);
  const [routeStart, setRouteStart] = useState('');
  const [routeEnd, setRouteEnd] = useState('');
  const [routeStartResults, setRouteStartResults] = useState<SearchResult[]>([]);
  const [routeEndResults, setRouteEndResults] = useState<SearchResult[]>([]);
  const [routeStartShowResults, setRouteStartShowResults] = useState(false);
  const [routeEndShowResults, setRouteEndShowResults] = useState(false);
  const [travelMode, setTravelMode] = useState<'car' | 'bike' | 'walk'>('car');
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeSteps, setRouteSteps] = useState<Array<{ maneuver: { instruction: string }; distance: number; duration: number }>>([]);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const routeLineRef = useRef<Feature | null>(null);
  const [routeStartCoords, setRouteStartCoords] = useState<[number, number] | null>(null);
  const [routeEndCoords, setRouteEndCoords] = useState<[number, number] | null>(null);
  const currentLocationMarkerRef = useRef<Feature | null>(null);
  const currentLocationAccuracyRef = useRef<Feature | null>(null);
  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);
  const [usingCurrentLocationAsStart, setUsingCurrentLocationAsStart] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    // Create vector source for markers
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;
    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          src: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x-red.png',
          anchor: [0.5, 1],
          scale: 1
        })
      })
    });
    // Create tile layer
    const tileLayer = new TileLayer({
      source: new OSM(),
    });
    tileLayerRef.current = tileLayer;
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer],
      view: new View({
        center: fromLonLat([90.4125, 23.8103]), // Dhaka
        zoom: 10,
        minZoom: 8,
        maxZoom: 18
      })
    });
    mapInstanceRef.current = map;
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Handle layer switching
  useEffect(() => {
    if (!tileLayerRef.current || !mapInstanceRef.current) return;
    
    const maxZooms: Record<string, number> = {
      default: 18,
      satellite: 18,
      terrain: 18,
    };
    
    let source;
    switch (layerType) {
      case 'satellite':
        source = new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attributions: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: maxZooms['satellite']
        });
        break;
      case 'terrain':
        source = new XYZ({
          url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attributions: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
          maxZoom: maxZooms['terrain']
        });
        break;
      default:
        source = new OSM({
          maxZoom: maxZooms['default']
        });
    }
    tileLayerRef.current.setSource(source);
    
    // Update view zoom limits
    const view = mapInstanceRef.current.getView();
    const newMaxZoom = maxZooms[layerType];
    view.setMaxZoom(newMaxZoom);
    if ((view.getZoom() || 0) > newMaxZoom) {
      view.setZoom(newMaxZoom);
    }
  }, [layerType]);

  // Debounced search (main search bar)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=bd&limit=8&addressdetails=1`
        );
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Debounced search for route start
  useEffect(() => {
    if (routeStartTimeoutRef.current) {
      clearTimeout(routeStartTimeoutRef.current);
    }
    if (routeStart.trim().length < 2) {
      setRouteStartResults([]);
      setRouteStartShowResults(false);
      return;
    }
    routeStartTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(routeStart)}&countrycodes=bd&limit=8&addressdetails=1`
        );
        const data = await response.json();
        setRouteStartResults(data);
        setRouteStartShowResults(true);
      } catch {
        setRouteStartResults([]);
      }
    }, 300);
    return () => {
      if (routeStartTimeoutRef.current) {
        clearTimeout(routeStartTimeoutRef.current);
      }
    };
  }, [routeStart, usingCurrentLocationAsStart]);

  // Debounced search for route end
  useEffect(() => {
    if (routeEndTimeoutRef.current) {
      clearTimeout(routeEndTimeoutRef.current);
    }
    if (routeEnd.trim().length < 2) {
      setRouteEndResults([]);
      setRouteEndShowResults(false);
      return;
    }
    routeEndTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(routeEnd)}&countrycodes=bd&limit=8&addressdetails=1`
        );
        const data = await response.json();
        setRouteEndResults(data);
        setRouteEndShowResults(true);
      } catch {
        setRouteEndResults([]);
      }
    }, 300);
    return () => {
      if (routeEndTimeoutRef.current) {
        clearTimeout(routeEndTimeoutRef.current);
      }
    };
  }, [routeEnd, usingCurrentLocationAsStart]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // The search will be handled by the useEffect above
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedLocation({ lat, lng });
    setSearchQuery(result.display_name);
    setShowResults(false);
    // Add marker to map
    if (vectorSourceRef.current && mapInstanceRef.current) {
      // Clear existing markers
      vectorSourceRef.current.clear();
      // Add new marker
      const markerFeature = new Feature({
        geometry: new Point(fromLonLat([lng, lat]))
      });
      markerFeature.setStyle(new Style({
        image: new StyleCircle({
          radius: 8,
          fill: new Fill({ color: '#2563eb' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        })
      }));
      vectorSourceRef.current.addFeature(markerFeature);
      // Animate to location
      mapInstanceRef.current.getView().animate({
        center: fromLonLat([lng, lat]),
        zoom: 15,
        duration: 1000
      });
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedLocation(null);
    // Clear markers
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
    }
  };

  // Center map on current location
  const handleCurrentLocation = () => {
    if (!mapInstanceRef.current) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const center = fromLonLat([longitude, latitude]);
          mapInstanceRef.current!.getView().animate({
            center,
            zoom: 15,
            duration: 1000
          });
          // Add marker and accuracy circle
          if (vectorSourceRef.current) {
            // Remove previous marker and accuracy
            if (currentLocationMarkerRef.current) {
              vectorSourceRef.current.removeFeature(currentLocationMarkerRef.current);
              currentLocationMarkerRef.current = null;
            }
            if (currentLocationAccuracyRef.current) {
              vectorSourceRef.current.removeFeature(currentLocationAccuracyRef.current);
              currentLocationAccuracyRef.current = null;
            }
            // Marker
            const markerFeature = new Feature({
              geometry: new Point(center)
            });
            markerFeature.setStyle(new Style({
              image: new StyleCircle({
                radius: 8,
                fill: new Fill({ color: '#2563eb' }),
                stroke: new Stroke({ color: '#fff', width: 2 })
              })
            }));
            vectorSourceRef.current.addFeature(markerFeature);
            currentLocationMarkerRef.current = markerFeature;
            // Accuracy circle
            if (accuracy && accuracy > 0) {
              const accuracyFeature = new Feature({
                geometry: new Circle(center, accuracy)
              });
              accuracyFeature.setStyle(new Style({
                fill: new Fill({ color: 'rgba(37,99,235,0.15)' }),
                stroke: new Stroke({ color: 'rgba(37,99,235,0.3)', width: 1 })
              }));
              vectorSourceRef.current.addFeature(accuracyFeature);
              currentLocationAccuracyRef.current = accuracyFeature;
            }
          }
          setSelectedLocation({ lat: latitude, lng: longitude });
        },
        () => {
          alert('Unable to get your location.');
        }
      );
    }
  };

  // Routing panel handlers
  const handleRouteStartResultClick = (result: SearchResult) => {
    setRouteStart(result.display_name);
    setRouteStartShowResults(false);
    setRouteStartCoords([parseFloat(result.lon), parseFloat(result.lat)]);
    setTimeout(() => setRouteStartShowResults(false), 0);
  };
  const handleRouteEndResultClick = (result: SearchResult) => {
    setRouteEnd(result.display_name);
    setRouteEndShowResults(false);
    setRouteEndCoords([parseFloat(result.lon), parseFloat(result.lat)]);
    setTimeout(() => setRouteEndShowResults(false), 0);
  };

  // Handle Get Directions
  const handleGetDirections = async () => {
    setRouteError(null);
    setRouteSteps([]);
    setRouteDistance(null);
    setRouteDuration(null);
    if (!routeStartCoords || !routeEndCoords) {
      setRouteError('Please select both start and destination.');
      return;
    }
    setRouteLoading(true);
    // Remove previous route line
    if (routeLineRef.current && vectorSourceRef.current) {
      vectorSourceRef.current.removeFeature(routeLineRef.current);
      routeLineRef.current = null;
    }
    // OSRM API mode mapping
    const modeMap: Record<string, string> = {
      car: 'driving',
      bike: 'cycling',
      walk: 'foot',
    };
    const mode = modeMap[travelMode];
    const start = `${routeStartCoords[0]},${routeStartCoords[1]}`;
    const end = `${routeEndCoords[0]},${routeEndCoords[1]}`;
    try {
      const url = `https://router.project-osrm.org/route/v1/${mode}/${start};${end}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data.routes || !data.routes[0]) {
        setRouteError('No route found.');
        setRouteLoading(false);
        return;
      }
      const route = data.routes[0];
      setRouteDistance(route.distance);
      setRouteDuration(route.duration);
      setRouteSteps(route.legs[0].steps);
      // Draw route on map
      if (vectorSourceRef.current && mapInstanceRef.current) {
        const coords = route.geometry.coordinates.map(([lon, lat]: [number, number]) => fromLonLat([lon, lat]));
        const line = new Feature({ geometry: new LineString(coords) });
        line.setStyle(new Style({
          stroke: new Stroke({ color: '#2563eb', width: 5 })
        }));
        vectorSourceRef.current.addFeature(line);
        routeLineRef.current = line;
        // Fit map to route
        mapInstanceRef.current.getView().fit(new LineString(coords), { padding: [80, 80, 80, 400], duration: 800 });
      }
    } catch {
      setRouteError('Failed to fetch route.');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const zoom = view.getZoom() || 0;
      const maxZoom = view.getMaxZoom() || 18;
      if (zoom < maxZoom) {
        view.animate({ zoom: zoom + 1, duration: 200 });
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const zoom = view.getZoom() || 0;
      const minZoom = view.getMinZoom() || 8;
      if (zoom > minZoom) {
        view.animate({ zoom: zoom - 1, duration: 200 });
      }
    }
  };

  const handleFullscreen = () => {
    const mapElement = document.querySelector('.ol-map-custom');
    if (mapElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        (mapElement as HTMLElement).requestFullscreen();
      }
    }
  };

  const handleUseCurrentLocationAsStart = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRouteStart('Current Location');
          setRouteStartCoords([longitude, latitude]);
          setUsingCurrentLocationAsStart(true);
          setRouteStartShowResults(false);
        },
        () => {
          alert('Unable to get your location.');
        }
      );
    }
  };

  // If user edits the start input, revert to normal search
  useEffect(() => {
    if (routeStart !== 'Current Location' && usingCurrentLocationAsStart) {
      setUsingCurrentLocationAsStart(false);
      setRouteStartCoords(null);
    }
  }, [routeStart, usingCurrentLocationAsStart]);

  return (
    <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden relative">
      {/* Map Controls (OSM style) */}
      <div className="absolute top-24 right-4 z-[1003] flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white/90 border border-gray-200 rounded-lg shadow w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 text-xl font-bold"
          title="Zoom In"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white/90 border border-gray-200 rounded-lg shadow w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 text-xl font-bold"
          title="Zoom Out"
        >
          <Minus className="w-6 h-6" />
        </button>
        <button
          onClick={handleFullscreen}
          className="bg-white/90 border border-gray-200 rounded-lg shadow w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 text-xl font-bold"
          title="Fullscreen"
        >
          <Maximize2 className="w-6 h-6" />
        </button>
      </div>
      {/* Layer Switcher Dropdown (OSM style) */}
      <div className="absolute top-4 right-4 z-[1002]">
        <div className="relative">
          <button
            onClick={() => setLayerDropdownOpen((open) => !open)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 shadow border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Layers className="w-5 h-5" />
            {LAYER_OPTIONS.find(opt => opt.key === layerType)?.label || 'Layer'}
            <ChevronDown className="w-4 h-4" />
          </button>
          {layerDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[1003]">
              {LAYER_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setLayerType(opt.key as 'default' | 'satellite' | 'terrain'); setLayerDropdownOpen(false); }}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-left rounded-lg transition-colors font-medium ${layerType === opt.key ? 'bg-amber-100 text-amber-800' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Sidebar with Routing Panel */}
      <div className="absolute top-4 left-4 z-[1002] flex flex-col gap-4 bg-white/90 rounded-xl shadow-lg border border-gray-200 p-4 w-80 min-h-[28rem]">
        {/* Routing Panel */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-gray-700 text-lg">Directions</div>
            <button
              className="text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setRoutingPanelOpen((open) => !open)}
            >
              {routingPanelOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          {routingPanelOpen && (
            <div className="space-y-4">
              {/* Start location search */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Start</div>
                <div className="relative">
                  <input
                    type="text"
                    value={routeStart}
                    onChange={(e) => setRouteStart(e.target.value)}
                    placeholder="Enter start location..."
                    className="w-full pl-3 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    disabled={usingCurrentLocationAsStart}
                  />
                  {/* Use My Location button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocationAsStart}
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                    title="Use My Location"
                  >
                    <LocateFixed className="w-5 h-5" />
                  </button>
                  {routeStart && !usingCurrentLocationAsStart && (
                    <button
                      type="button"
                      onClick={() => { setRouteStart(''); setRouteStartCoords(null); }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {/* Results dropdown */}
                  {routeStartShowResults && routeStartResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-[1001]">
                      {routeStartResults.map((result) => (
                        <button
                          key={result.place_id}
                          onClick={() => handleRouteStartResultClick(result)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-900 line-clamp-1">
                                {result.display_name.split(',')[0]}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-2">
                                {result.display_name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* End location search */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Destination</div>
                <div className="relative">
                  <input
                    type="text"
                    value={routeEnd}
                    onChange={(e) => setRouteEnd(e.target.value)}
                    placeholder="Enter destination..."
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  />
                  {routeEnd && (
                    <button
                      type="button"
                      onClick={() => { setRouteEnd(''); setRouteEndCoords(null); }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {/* Results dropdown */}
                  {routeEndShowResults && routeEndResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-[1001]">
                      {routeEndResults.map((result) => (
                        <button
                          key={result.place_id}
                          onClick={() => handleRouteEndResultClick(result)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-900 line-clamp-1">
                                {result.display_name.split(',')[0]}
                              </div>
                              <div className="text-xs text-gray-500 line-clamp-2">
                                {result.display_name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Travel mode selector */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Travel Mode</div>
                <div className="flex gap-2">
                  {TRAVEL_MODES.map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => setTravelMode(mode.key as 'car' | 'bike' | 'walk')}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors font-medium border ${travelMode === mode.key ? 'bg-blue-100 text-blue-700 border-blue-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'}`}
                    >
                      {mode.icon}
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Route button */}
              <button
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                disabled={!routeStartCoords || !routeEndCoords || routeLoading}
                onClick={handleGetDirections}
              >
                {routeLoading ? 'Loading...' : 'Get Directions'}
              </button>
              {/* Error */}
              {routeError && <div className="text-xs text-red-600 mt-2">{routeError}</div>}
              {/* Route summary and steps */}
              {routeDistance && routeDuration && (
                <div className="mt-4">
                  <div className="text-xs text-gray-700 mb-2">
                    <b>Distance:</b> {(routeDistance / 1000).toFixed(2)} km &nbsp; <b>Time:</b> {Math.round(routeDuration / 60)} min
                  </div>
                  <div className="text-xs text-gray-700 font-semibold mb-1">Directions:</div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                    {routeSteps.map((step, idx) => (
                      <li key={idx}>{step.maneuver.instruction}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Current Location button only (no layer switcher here) */}
        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={handleCurrentLocation}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
          >
            <Locate className="w-5 h-5" />
            Current Location
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 left-[22rem] z-[1001] w-80">
        <div className="relative">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location..."
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-[1001]">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {result.display_name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {result.type} • Importance: {result.importance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-[1001]">
              <div className="text-sm text-gray-500 text-center">
                No results found
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full ol-map-custom" />
      
      {/* Location Info */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
          <div className="text-xs font-semibold text-gray-700 mb-1">
            Selected Location
          </div>
          <div className="text-xs text-gray-600">
            Lat: {selectedLocation.lat.toFixed(4)}
          </div>
          <div className="text-xs text-gray-600">
            Lng: {selectedLocation.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMapTest; 