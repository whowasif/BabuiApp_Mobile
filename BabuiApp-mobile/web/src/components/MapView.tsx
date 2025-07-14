import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Minus, Maximize2, RotateCcw, Locate, X, MapPin, Search, Navigation, Filter, ArrowRight, Route, Car, Building, Bike, Bus } from 'lucide-react';
import { Property } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Icon, Text, Fill, Stroke, Circle } from 'ol/style';
import { Select, defaults as defaultInteractions } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { ScaleLine, defaults as defaultControls, ZoomSlider, FullScreen, Attribution, MousePosition } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import 'ol/ol.css';

interface MapViewProps {
  properties: Property[];
  selectedProperty?: string;
  onPropertySelect?: (propertyId: string) => void;
}

// Search result interface
interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

// Route result interface
interface RouteResult {
  distance: number;
  duration: number;
  geometry: number[][];
  mode: 'driving' | 'walking' | 'cycling' | 'transit';
}

// Custom marker style for properties
const createPropertyStyle = (isActive: boolean) => {
  return new Style({
    image: new Circle({
      radius: 12,
      fill: new Fill({
        color: isActive ? '#f59e0b' : '#ffffff'
      }),
      stroke: new Stroke({
        color: isActive ? '#d97706' : '#9ca3af',
        width: 2
      })
    }),
    text: new Text({
      text: '৳',
      font: 'bold 10px Arial',
      fill: new Fill({
        color: isActive ? '#92400e' : '#4b5563'
      }),
      offsetY: -1
    })
  });
};

// Cluster marker style
const createClusterStyle = (count: number) => {
  return new Style({
    image: new Circle({
      radius: 16,
      fill: new Fill({
        color: '#ffffff'
      }),
      stroke: new Stroke({
        color: '#9ca3af',
        width: 2
      })
    }),
    text: new Text({
      text: count.toString(),
      font: 'bold 12px Arial',
      fill: new Fill({
        color: '#1f2937'
      })
    })
  });
};

// Heatmap style for property density
const createHeatmapStyle = () => {
  return new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.6)'
      }),
      stroke: new Stroke({
        color: '#ff0000',
        width: 1
      })
    })
  });
};

// Search pin style
const createSearchPinStyle = () => {
  return new Style({
    image: new Icon({
      src: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
      anchor: [0.5, 1],
      scale: 1.2,
      color: '#2563eb', // blue
    })
  });
};



// Enhanced Search Bar Component with Routing
const SearchBar: React.FC<{
  onSearch: (query: string) => void;
  onResultSelect: (result: SearchResult) => void;
  onClear: () => void;
  onRouteRequest?: (from: string, to: string, mode: string) => void;
}> = ({ onSearch, onResultSelect, onClear }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
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
      } catch (error) {
        console.error('Search error:', error);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result);
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onClear();
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search-placeholder', 'Search for a place...', 'Search for a place...')}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
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
              className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
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
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors search-result-item"
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
            {t('no-results', 'No results found', 'No results found')}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Map controls component with OpenStreetMap features
const MapControls: React.FC<{
  map: Map;
  mapStyle: 'default' | 'satellite' | 'terrain' | 'dark' | 'cycle' | 'transport';
  onToggleMapStyle: () => void;
  onSearchLocation: () => void;
  onShowHeatmap: () => void;
  onToggleTraffic: () => void;
  onTogglePOI: () => void;
  onToggleBuildings: () => void;
  setSearchPin: (pin: { lat: number; lng: number }) => void;
}> = ({ map, onToggleMapStyle, onShowHeatmap, onToggleTraffic, onTogglePOI, onToggleBuildings, setSearchPin }) => {
  const { t } = useLanguage();

  const handleZoomIn = () => {
    const view = map.getView();
    const zoom = view.getZoom() || 0;
    const maxZoom = view.getMaxZoom() || 18;
    if (zoom < maxZoom) {
      view.animate({
        zoom: zoom + 1,
        duration: 250
      });
    }
  };

  const handleZoomOut = () => {
    const view = map.getView();
    const zoom = view.getZoom() || 0;
    const minZoom = view.getMinZoom() || 8;
    if (zoom > minZoom) {
      view.animate({
        zoom: zoom - 1,
        duration: 250
      });
    }
  };

  const handleResetPosition = () => {
    map.getView().animate({
      center: fromLonLat([90.4125, 23.8103]), // Dhaka center
      zoom: 12,
      duration: 1000
    });
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSearchPin({ lat: latitude, lng: longitude });
          map.getView().animate({
            center: fromLonLat([longitude, latitude]),
            zoom: 15,
            duration: 1000
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          handleResetPosition();
        }
      );
    }
  };

  const handleFullscreen = () => {
    const mapElement = document.querySelector('.ol-map');
    if (mapElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapElement.requestFullscreen();
      }
    }
  };

  return (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000] map-controls">
      {/* Zoom Controls */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="block w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors border-b border-gray-200 map-control-button"
          title={t('zoom-in', 'জুম ইন', 'Zoom In')}
        >
          <Plus size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="block w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors map-control-button"
          title={t('zoom-out', 'জুম আউট', 'Zoom Out')}
        >
          <Minus size={16} className="text-gray-700" />
        </button>
      </div>

      {/* Map Style Toggle */}
      <button
        onClick={onToggleMapStyle}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('toggle-map-style', 'ম্যাপ স্টাইল পরিবর্তন করুন', 'Toggle Map Style')}
      >
        <Layers size={16} className="text-gray-700" />
      </button>

      {/* Heatmap Toggle */}
      <button
        onClick={onShowHeatmap}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('show-heatmap', 'হিটম্যাপ দেখান', 'Show Heatmap')}
      >
        <Filter size={16} className="text-gray-700" />
      </button>

      {/* Reset Position */}
      <button
        onClick={handleResetPosition}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('reset-position', 'অবস্থান রিসেট করুন', 'Reset Position')}
      >
        <RotateCcw size={16} className="text-gray-700" />
      </button>

      {/* My Location */}
      <button
        onClick={handleMyLocation}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('my-location', 'আমার অবস্থান', 'My Location')}
      >
        <Locate size={16} className="text-gray-700" />
      </button>

      {/* Fullscreen */}
      <button
        onClick={handleFullscreen}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('fullscreen', 'ফুলস্ক্রিন', 'Fullscreen')}
      >
        <Maximize2 size={16} className="text-gray-700" />
      </button>

      {/* Traffic Layer */}
      <button
        onClick={onToggleTraffic}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('traffic', 'ট্রাফিক', 'Traffic')}
      >
        <Car size={16} className="text-gray-700" />
      </button>

      {/* POI Layer */}
      <button
        onClick={onTogglePOI}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('poi', 'পয়েন্ট অফ ইন্টারেস্ট', 'Points of Interest')}
      >
        <Building size={16} className="text-gray-700" />
      </button>

      {/* Buildings Layer */}
      <button
        onClick={onToggleBuildings}
        className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors map-control-button"
        title={t('buildings', 'বিল্ডিং', 'Buildings')}
      >
        <Building size={16} className="text-gray-700" />
      </button>
    </div>
  );
};

// Map Legend Component
const MapLegend: React.FC = () => {
  const { t } = useLanguage();
  
  return (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000] map-legend">
      <div className="text-xs font-semibold text-gray-700 mb-2">
        {t('legend', 'লেজেন্ড', 'Legend')}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
          <span className="text-xs text-gray-600">{t('property', 'সম্পত্তি', 'Property')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 border-2 border-amber-600 rounded-full"></div>
          <span className="text-xs text-gray-600">{t('selected', 'নির্বাচিত', 'Selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800">2+</span>
          </div>
          <span className="text-xs text-gray-600">{t('cluster', 'ক্লাস্টার', 'Cluster')}</span>
        </div>
      </div>
    </div>
  );
};

const MapView: React.FC<MapViewProps> = ({
  properties,
  selectedProperty,
  onPropertySelect
}) => {
  const { t } = useLanguage();
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite' | 'terrain' | 'dark' | 'cycle' | 'transport'>('default');
  const [showPropertyDetails, setShowPropertyDetails] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showPOI, setShowPOI] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false);
  const [searchPin, setSearchPin] = useState<{ lat: number; lng: number } | null>(null);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const heatmapSourceRef = useRef<VectorSource | null>(null);
  const heatmapLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      console.log('Map ref not available');
      return;
    }

    // Only create the map once
    if (mapInstanceRef.current) {
      console.log('Map already initialized');
      return;
    }

    console.log('Initializing OpenLayers map...');
    console.log('Map container:', mapRef.current);
    console.log('Map container dimensions:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);

    // Ensure container has proper dimensions
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      console.log('Map container has zero dimensions, waiting for layout...');
      setTimeout(() => {
        if (mapRef.current && mapRef.current.offsetWidth > 0 && mapRef.current.offsetHeight > 0) {
          console.log('Container now has dimensions:', mapRef.current.offsetWidth, 'x', mapRef.current.offsetHeight);
          // Re-run the effect
          return;
        }
      }, 100);
      return;
    }

    // Create vector source for markers
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const isCluster = feature.get('isCluster');
        const count = feature.get('count');
        const isActive = feature.get('isActive');
        
        if (isCluster) {
          return createClusterStyle(count);
        }
        return createPropertyStyle(isActive);
      }
    });
    vectorLayerRef.current = vectorLayer;

    // Create heatmap source and layer
    const heatmapSource = new VectorSource();
    heatmapSourceRef.current = heatmapSource;

    const heatmapLayer = new VectorLayer({
      source: heatmapSource,
      style: createHeatmapStyle(),
      opacity: 0.7
    });
    heatmapLayerRef.current = heatmapLayer;

    // Create tile layer with fallback
    const tileLayer = new TileLayer({
      source: new OSM({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      visible: true
    });

    // Add error handling for tile loading
    tileLayer.getSource()?.on('tileloaderror', (event) => {
      console.log('Tile load error:', event);
      console.log('Trying fallback source...');
      // Fallback to a different tile source
      tileLayer.setSource(new XYZ({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }));
    });

    // Create map with enhanced controls
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer, heatmapLayer],
      view: new View({
        center: fromLonLat([90.4125, 23.8103]), // Dhaka center
        zoom: 12,
        minZoom: 8,
        maxZoom: 18
      }),
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'metric'
        }),
        new ZoomSlider(),
        new FullScreen(),
        new Attribution({
          collapsible: false
        }),
        new MousePosition({
          coordinateFormat: createStringXY(4),
          projection: 'EPSG:4326',
          className: 'custom-mouse-position'
        })
      ]),
      interactions: defaultInteractions().extend([
        new Select({
          condition: click,
          layers: [vectorLayer]
        })
      ])
    });

    // Add error handling for map creation
    try {
      mapInstanceRef.current = map;
      console.log('Map created successfully');
    } catch (error) {
      console.error('Error creating map:', error);
      // Try with simpler configuration
      const simpleMap = new Map({
        target: mapRef.current,
        layers: [tileLayer],
        view: new View({
          center: fromLonLat([90.4125, 23.8103]),
          zoom: 12
        })
      });
      mapInstanceRef.current = simpleMap;
      console.log('Simple map created as fallback');
    }

    console.log('Map initialized successfully');

    // Force map update
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.updateSize();
        console.log('Map size updated');
      }
    }, 100);

    // Handle feature click
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const propertyId = feature.get('propertyId');
        if (propertyId) {
          setShowPropertyDetails(propertyId);
          onPropertySelect?.(propertyId);
        }
      }
    });

    // Handle pointer move for hover effects
    map.on('pointermove', (event) => {
      const pixel = map.getEventPixel(event.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    // Add load event listener
    map.once('loadend', () => {
      console.log('Map tiles loaded successfully');
      
      // Add a test marker to verify map is working
      const testFeature = new Feature({
        geometry: new Point(fromLonLat([90.4125, 23.8103]))
      });
      testFeature.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      }));
      vectorSource.addFeature(testFeature);
      console.log('Test marker added to verify map functionality');
    });

    return () => {
      console.log('Cleaning up map...');
      map.setTarget(undefined);
    };
  }, []); // <-- empty dependency array, runs only once

  // Update markers when properties or searchPin change
  useEffect(() => {
    if (!vectorSourceRef.current || !heatmapSourceRef.current) return;

    // Clear existing features
    vectorSourceRef.current.clear();
    heatmapSourceRef.current.clear();

    // Group properties by location for clustering
    const groupedProperties = properties.reduce((acc, property) => {
      const key = `${Math.round(property.location.coordinates.lat * 1000)}-${Math.round(property.location.coordinates.lng * 1000)}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(property);
      return acc;
    }, {} as Record<string, Property[]>);

    // Add features to map
    Object.entries(groupedProperties).forEach(([, groupProperties]) => {
      const property = groupProperties[0];
      const isCluster = groupProperties.length > 1;
              const isActive = selectedProperty ? groupProperties.some(p => p.id === selectedProperty) : false;

        const feature = new Feature({
          geometry: new Point(fromLonLat([property.location.coordinates.lng, property.location.coordinates.lat])),
          propertyId: property.id,
          isCluster,
          count: groupProperties.length,
          isActive,
          properties: groupProperties
        });

      vectorSourceRef.current?.addFeature(feature);

      // Add heatmap features
      if (showHeatmap) {
        const heatmapFeature = new Feature({
          geometry: new Point(fromLonLat([property.location.coordinates.lng, property.location.coordinates.lat])),
          weight: groupProperties.length
        });
        heatmapSourceRef.current?.addFeature(heatmapFeature);
      }
    });

    // Add search pin marker if present
    if (searchPin) {
      const searchFeature = new Feature({
        geometry: new Point(fromLonLat([searchPin.lng, searchPin.lat]))
      });
      searchFeature.setStyle(createSearchPinStyle());
      vectorSourceRef.current?.addFeature(searchFeature);
    }
  }, [properties, selectedProperty, showHeatmap, searchPin, onPropertySelect]);

  // Handle map style toggle
  const handleToggleMapStyle = () => {
    if (!mapInstanceRef.current) return;

    const styles = ['default', 'satellite', 'terrain', 'dark', 'cycle', 'transport'];
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    const newStyle = styles[nextIndex] as 'default' | 'satellite' | 'terrain' | 'dark' | 'cycle' | 'transport';
    setMapStyle(newStyle);

    const layers = mapInstanceRef.current.getLayers();
    const tileLayer = layers.getArray().find(layer => layer instanceof TileLayer) as TileLayer;

    if (tileLayer) {
      const maxZooms: Record<string, number> = {
        default: 18,
        satellite: 18,
        terrain: 18,
        dark: 18,
        cycle: 18,
        transport: 18,
      };
      switch (newStyle) {
        case 'satellite':
          tileLayer.setSource(new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attributions: '&copy; <a href="https://www.esri.com/">Esri</a>',
            maxZoom: maxZooms['satellite']
          }));
          break;
        case 'terrain':
          tileLayer.setSource(new XYZ({
            url: 'https://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
            attributions: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
            maxZoom: maxZooms['terrain']
          }));
          break;
        case 'dark':
          tileLayer.setSource(new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: maxZooms['dark']
          }));
          break;
        case 'cycle':
          tileLayer.setSource(new XYZ({
            url: 'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
            attributions: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
            maxZoom: maxZooms['cycle']
          }));
          break;
        case 'transport':
          tileLayer.setSource(new XYZ({
            url: 'https://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
            attributions: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>',
            maxZoom: maxZooms['transport']
          }));
          break;
        default:
          tileLayer.setSource(new OSM({
            maxZoom: maxZooms['default']
          }));
          break;
      }
      // Always set the view's maxZoom and clamp zoom to maxZoom if needed
      if (mapInstanceRef.current) {
        const view = mapInstanceRef.current.getView();
        const newMaxZoom = maxZooms[newStyle];
        view.setMaxZoom(newMaxZoom);
        if ((view.getZoom() || 0) > newMaxZoom) {
          view.setZoom(newMaxZoom);
        }
      }
      // Satellite fallback logic (if needed)
      if (newStyle === 'satellite' && mapInstanceRef.current) {
        const view = mapInstanceRef.current.getView();
        const handleZoom = () => {
          if ((view.getZoom() || 0) > maxZooms['satellite']) {
            alert('No higher resolution satellite imagery available. Switching to default map.');
            tileLayer.setSource(new OSM({ maxZoom: maxZooms['default'] }));
            setMapStyle('default');
            view.setMaxZoom(maxZooms['default']);
            view.setZoom(maxZooms['default']);
            view.un('change:resolution', handleZoom);
          }
        };
        view.on('change:resolution', handleZoom);
      }
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (!mapInstanceRef.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setSearchPin({ lat, lng });
        const view = mapInstanceRef.current.getView();
        const maxZoom = view.getMaxZoom() || 18;
        const targetZoom = Math.min(15, maxZoom);
        view.animate({
          center: fromLonLat([lng, lat]),
          zoom: targetZoom,
          duration: 1000
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    if (!mapInstanceRef.current) return;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchPin({ lat, lng });
            const view = mapInstanceRef.current.getView();
        const maxZoom = view.getMaxZoom() || 18;
        const targetZoom = Math.min(15, maxZoom);
        view.animate({
          center: fromLonLat([lng, lat]),
          zoom: targetZoom,
          duration: 1000
        });
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchPin(null);
  };

  // Handle heatmap toggle
  const handleShowHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  // Handle traffic layer toggle
  const handleToggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  // Handle POI layer toggle
  const handleTogglePOI = () => {
    setShowPOI(!showPOI);
  };

  // Handle buildings layer toggle
  const handleToggleBuildings = () => {
    setShowBuildings(!showBuildings);
  };



  // Get property for popup
  const getPropertyForPopup = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  return (
    <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden shadow-lg">
      {/* Main Search Bar - Similar to OpenStreetMap.org */}
      <div className="absolute top-4 left-4 z-[1001]">
        <SearchBar
          onSearch={handleSearch}
          onResultSelect={handleSearchResultSelect}
          onClear={handleSearchClear}
        />
      </div>

      <div ref={mapRef} className="w-full h-full ol-map" style={{ minHeight: '384px' }} />
      
      {/* Map Controls */}
      {mapInstanceRef.current && (
        <MapControls
          map={mapInstanceRef.current}
          mapStyle={mapStyle}
          onToggleMapStyle={handleToggleMapStyle}
          onSearchLocation={() => {}}
          onShowHeatmap={handleShowHeatmap}
          onToggleTraffic={handleToggleTraffic}
          onTogglePOI={handleTogglePOI}
          onToggleBuildings={handleToggleBuildings}
          setSearchPin={setSearchPin}
        />
      )}

      {/* Map Legend */}
      <MapLegend />

      {/* Property Details Popup */}
      {showPropertyDetails && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-[1000] property-popup">
          {(() => {
            const property = getPropertyForPopup(showPropertyDetails);
            if (!property) return null;
            
            return (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {property.title}
                  </h3>
                  <button
                    onClick={() => setShowPropertyDetails(null)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="text-lg font-bold text-amber-600 mb-2">
                  ৳{property.price.toLocaleString()}/month
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {property.bedrooms} bed • {property.bathrooms} bath • {property.area} sqft
                </div>
                <div className="text-xs text-gray-500">
                  {property.location.area}, {property.location.city === 'dhaka' ? 'Dhaka' : 'Chittagong'}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Route Information */}
      {routeData && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-[1000] route-info-panel">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              {t('route-info', 'রুট তথ্য', 'Route Information')}
            </h3>
            <button
              onClick={() => setRouteData(null)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Route size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600">
                {t('distance', 'দূরত্ব', 'Distance')}: {(routeData.distance / 1000).toFixed(1)} km
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">
                {t('duration', 'সময়', 'Duration')}: {Math.round(routeData.duration / 60)} min
              </span>
            </div>
            <div className="flex items-center gap-2">
              {routeData.mode === 'driving' && <Car size={16} className="text-blue-500" />}
              {routeData.mode === 'walking' && <Bike size={16} className="text-green-500" />}
              {routeData.mode === 'cycling' && <Bike size={16} className="text-orange-500" />}
              {routeData.mode === 'transit' && <Bus size={16} className="text-purple-500" />}
              <span className="text-sm text-gray-600 capitalize">
                {routeData.mode}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Layer Status Indicators */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-[1000] layer-status">
        <div className="flex items-center gap-4 text-xs">
          {showTraffic && (
            <div className="flex items-center gap-1 text-blue-600">
              <Car size={12} />
              <span>{t('traffic', 'ট্রাফিক', 'Traffic')}</span>
            </div>
          )}
          {showPOI && (
            <div className="flex items-center gap-1 text-green-600">
              <Building size={12} />
              <span>{t('poi', 'পয়েন্ট অফ ইন্টারেস্ট', 'POI')}</span>
            </div>
          )}
          {showBuildings && (
            <div className="flex items-center gap-1 text-purple-600">
              <Building size={12} />
              <span>{t('buildings', 'বিল্ডিং', 'Buildings')}</span>
            </div>
          )}
          {showHeatmap && (
            <div className="flex items-center gap-1 text-red-600">
              <Filter size={12} />
              <span>{t('heatmap', 'হিটম্যাপ', 'Heatmap')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;