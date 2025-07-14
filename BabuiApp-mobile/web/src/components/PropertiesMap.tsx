import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Home, Bed, Building, Car, Info } from 'lucide-react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Icon, Fill, Stroke, Text } from 'ol/style';
import { Property } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import 'ol/ol.css';

interface PropertiesMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string;
  height?: string;
}

const PropertiesMap: React.FC<PropertiesMapProps> = ({
  properties,
  onPropertyClick,
  selectedPropertyId,
  height = "500px"
}) => {
  const { t, language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);

  // Find the most expensive property (featured)
  const maxPrice = Math.max(...properties.map(p => p.price || 0));
  const featuredPropertyId = properties.find(p => p.price === maxPrice)?.id;

  // Pin head color by property type
  const iconColors: Record<string, string> = {
    apartment: '#3b82f6', // blue
    house: '#10b981',     // green
    room: '#f59e0b',      // orange
    studio: '#8b5cf6',    // purple
    office: '#ef4444',    // red
    shop: '#f97316',      // orange
    parking: '#6b7280',   // gray
    family: '#3b82f6',    // blue
    bachelor: '#f59e0b',  // orange
    sublet: '#8b5cf6',    // purple
    hostel: '#10b981',    // green
  };

  // Create marker style based on property type and if it's featured
  const createPropertyMarkerStyle = (property: Property, isSelected: boolean = false) => {
    const size = isSelected ? 36 : 28;
    let color = iconColors[property.type] || '#6b7280';
    if (property.id === featuredPropertyId) {
      color = '#FFD700'; // gold for featured
    }
    // SVG for classic pin: circle head, white stem
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size * 1.6}' viewBox='0 0 60 96'>
        <circle cx='30' cy='24' r='22' fill='${color}' stroke='black' stroke-width='2'/>
        <rect x='26' y='24' width='8' height='60' rx='4' fill='white' stroke='gray' stroke-width='2'/>
        <ellipse cx='30' cy='84' rx='6' ry='8' fill='gray' opacity='0.2'/>
      </svg>
    `;
    const encodedSvg = encodeURIComponent(svg);
    return new Style({
      image: new Icon({
        src: `data:image/svg+xml;utf8,${encodedSvg}`,
        anchor: [0.5, 0.25],
        scale: 1
      }),
      text: new Text({
        text: property.price.toLocaleString(),
        font: 'bold 16px Arial',
        fill: new Fill({ color: '#222' }),
        stroke: new Stroke({ color: '#fff', width: 3 }),
        offsetY: 36
      })
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source for markers
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;

    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const property = feature.get('property') as Property;
        const isSelected = property.id === selectedPropertyId;
        return createPropertyMarkerStyle(property, isSelected);
      }
    });

    // Create tile layer
    const tileLayer = new TileLayer({
      source: new OSM()
    });

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer],
      view: new View({
        center: fromLonLat([90.4125, 23.8103]), // Dhaka center
        zoom: 10,
        minZoom: 8,
        maxZoom: 18
      })
    });

    mapInstanceRef.current = map;

    // Handle marker click
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const property = feature.get('property') as Property;
        if (onPropertyClick) {
          onPropertyClick(property);
        }
      }
    });

    // Handle marker hover
    map.on('pointermove', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const property = feature.get('property') as Property;
        setHoveredProperty(property);
        map.getTargetElement().style.cursor = 'pointer';
      } else {
        setHoveredProperty(null);
        map.getTargetElement().style.cursor = '';
      }
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [onPropertyClick, selectedPropertyId]);

  // Update markers when properties change
  useEffect(() => {
    if (!vectorSourceRef.current || !mapInstanceRef.current) return;

    vectorSourceRef.current.clear();

    properties.forEach(property => {
      if (property.location?.coordinates) {
        const lat = Number(property.location.coordinates.lat);
        const lng = Number(property.location.coordinates.lng);
        console.log('Adding marker for:', { lat, lng });
        const coordinate = fromLonLat([lng, lat]);
        const feature = new Feature({
          geometry: new Point(coordinate),
          property: property
        });
        vectorSourceRef.current?.addFeature(feature);
        console.log('Feature added:', feature);
      }
    });

    // Fit map to show all properties if there are any
    if (properties.length > 0) {
      const extent = vectorSourceRef.current.getExtent();
      if (!extent.every(coord => coord === Infinity)) {
        mapInstanceRef.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
      }
    }
  }, [properties]);

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Property Info Tooltip */}
      {hoveredProperty && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs z-10">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {hoveredProperty.images && hoveredProperty.images.length > 0 ? (
                <img 
                  src={hoveredProperty.images[0].src} 
                  alt={hoveredProperty.title}
                  className="w-16 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Home className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {language === 'bn' ? hoveredProperty.titleBn : hoveredProperty.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {hoveredProperty.location?.area || hoveredProperty.location?.city}
              </p>
              <p className="text-sm font-bold text-amber-600 mt-1">
                ৳{hoveredProperty.price.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{hoveredProperty.bedrooms} {t('bedrooms', 'বেডরুম', 'Bedrooms')}</span>
                <span>•</span>
                <span>{hoveredProperty.bathrooms} {t('bathrooms', 'বাথরুম', 'Bathrooms')}</span>
                <span>•</span>
                <span>{hoveredProperty.area} {t('sqft', 'বর্গফুট', 'sq ft')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">
          {t('property-types', 'সম্পত্তির ধরন', 'Property Types')}
        </h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>{t('apartment', 'অ্যাপার্টমেন্ট', 'Apartment')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>{t('room', 'রুম', 'Room')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>{t('office', 'অফিস', 'Office')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>{t('shop', 'দোকান', 'Shop')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>{t('parking', 'পার্কিং', 'Parking')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesMap; 