import React, { useState, useMemo, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import SearchFilters from '../components/SearchFilters';
import PropertyCard from '../components/PropertyCard';
import PropertiesMap from '../components/PropertiesMap';
import { SearchFilters as SearchFiltersType, Property } from '../types';
import { usePropertyStore } from '../stores/propertyStore';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const { properties, fetchProperties } = usePropertyStore();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<string>();
  const [displayCount, setDisplayCount] = useState(6);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Filter properties based on search criteria
  const filteredProperties = useMemo(() => {
    return properties.filter((property: Property) => {
      if (filters.division && property.location.division !== filters.division) return false;
      if (filters.district && property.location.district !== filters.district) return false;
      if (filters.thana && property.location.thana !== filters.thana) return false;
      if (filters.area && property.location.area !== filters.area) return false;
      // Property type filter (now includes categories)
      if (filters.type) {
        // Handle category-based filtering
        switch (filters.type) {
          case 'family':
            if (property.genderPreference !== 'family' && property.genderPreference !== 'any') return false;
            break;
          case 'bachelor':
            if (property.genderPreference === 'family') return false;
            break;
          case 'office':
            if (property.type !== 'studio' && property.type !== 'apartment') return false;
            break;
          case 'parking':
            if (!property.parking) return false;
            break;
          default:
            // Standard property types
            if (['apartment', 'house', 'room', 'studio'].includes(filters.type)) {
              if (property.type !== filters.type) return false;
            }
        }
      }
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
      if (filters.bathrooms && property.bathrooms < filters.bathrooms) return false;
      if (filters.minArea && property.area < filters.minArea) return false;
      if (filters.maxArea && property.area > filters.maxArea) return false;
      return true;
    });
  }, [properties, filters]);

  // Load more properties when scrolling
  React.useEffect(() => {
    if (inView && displayCount < filteredProperties.length) {
      setDisplayCount(prev => Math.min(prev + 6, filteredProperties.length));
    }
  }, [inView, displayCount, filteredProperties.length]);

  const displayedProperties = filteredProperties.slice(0, displayCount);

  const handleSearch = () => {
    setDisplayCount(6);
    console.log('Searching with filters:', filters);
  };

  const handleFavorite = (propertyId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperty(propertyId);
    navigate(`/property/${propertyId}`);
  };

  const propertiesWithCoords = displayedProperties.filter(
    p => p.location && p.location.coordinates &&
      typeof p.location.coordinates.lat === 'number' &&
      typeof p.location.coordinates.lng === 'number' &&
      p.location.coordinates.lat !== 0 &&
      p.location.coordinates.lng !== 0
  );
  console.log('Properties with coords:', propertiesWithCoords);

  return (
    <div className="pb-20">
      {/* Hero Section with Babui-inspired design */}
      <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-600 text-white py-20 overflow-hidden">
        {/* Animated weaving pattern background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
            <defs>
              <pattern id="heroWeave" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,20 Q10,10 20,20 T40,20" stroke="currentColor" strokeWidth="0.5" fill="none" className="animate-pulse">
                  <animate attributeName="d" values="M0,20 Q10,10 20,20 T40,20;M0,20 Q10,30 20,20 T40,20;M0,20 Q10,10 20,20 T40,20" dur="4s" repeatCount="indefinite"/>
                </path>
                <path d="M20,0 Q30,10 40,0" stroke="currentColor" strokeWidth="0.3" fill="none" className="animate-pulse delay-1000">
                  <animate attributeName="d" values="M20,0 Q30,10 40,0;M20,0 Q30,-10 40,0;M20,0 Q30,10 40,0" dur="3s" repeatCount="indefinite"/>
                </path>
                <path d="M0,40 Q10,30 20,40" stroke="currentColor" strokeWidth="0.3" fill="none" className="animate-pulse delay-2000">
                  <animate attributeName="d" values="M0,40 Q10,30 20,40;M0,40 Q10,50 20,40;M0,40 Q10,30 20,40" dur="5s" repeatCount="indefinite"/>
                </path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroWeave)"/>
          </svg>
        </div>

        {/* Floating nest elements */}
        <div className="absolute top-10 right-10 w-20 h-20 opacity-30">
          <div className="w-full h-full rounded-full border-2 border-white animate-spin-slow">
            <div className="w-full h-full rounded-full border border-white animate-pulse"></div>
          </div>
        </div>
        <div className="absolute bottom-20 left-10 w-16 h-16 opacity-20">
          <div className="w-full h-full rounded-full border border-white animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            {/* Main title with custom Bengali typography */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="font-bengali text-amber-100 drop-shadow-lg">
                {t('hero-title', 'আপনার স্বপ্নের বাসা', 'Your Dream Nest')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 mb-4 font-medium">
              {t('hero-subtitle', 
                'বাবুই পাখির মতো নিখুঁত বাসা খুঁজুন', 
                'Find the perfect nest, crafted like a Babui bird')}
            </p>
            <p className="text-amber-200 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('hero-description',
                'প্রকৃতির সেরা স্থপতির অনুপ্রেরণায় তৈরি আমাদের প্ল্যাটফর্ম',
                'Inspired by nature\'s greatest architect')}
            </p>
          </div>

          {/* Enhanced Search Component with nest-like design */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <SearchFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  console.log('setFilters called with:', newFilters);
                  setFilters(newFilters);
                }}
                onSearch={handleSearch}
                showMainSearch={true}
                showAdvancedFilters={showAdvancedFilters}
                onToggleAdvancedFilters={() => setShowAdvancedFilters((prev) => !prev)}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Advanced Search Filters */}
        {showAdvancedFilters && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
              <SearchFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  console.log('setFilters called with:', newFilters);
                  setFilters(newFilters);
                }}
                onSearch={handleSearch}
                showMainSearch={false}
              />
            </div>
          </div>
        )}

        {/* Results Header with organic design */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3 6l3 8 3-8c1.5-1.5 3-3.5 3-6 0-3.5-2.5-6-6-6z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-amber-800">
                {t('properties-found', 
                  `${filteredProperties.length}টি বাসা পাওয়া গেছে`, 
                  `${filteredProperties.length} Nests Found`
                )}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-1 border border-amber-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' 
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
              }`}
            >
              {t('grid-view', 'গ্রিড ভিউ', 'Grid')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'map' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' 
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
              }`}
            >
              {t('map-view', 'ম্যাপ ভিউ', 'Map')}
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <>
            {/* Property Grid with enhanced cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {displayedProperties.map((property) => (
                <div 
                  key={property.id} 
                  id={`property-${property.id}`}
                  className={`transition-all duration-300 transform hover:scale-105 ${
                    selectedProperty === property.id ? 'ring-4 ring-amber-400 ring-offset-4 scale-105' : ''
                  }`}
                >
                  <PropertyCard
                    property={property}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.has(property.id)}
                    onClick={() => handlePropertySelect(property.id)}
                  />
                </div>
              ))}
            </div>

            {/* Load More with nest-inspired design */}
            {displayCount < filteredProperties.length && (
              <div ref={loadMoreRef} className="flex justify-center py-12">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-2 border-orange-200 border-t-orange-400 rounded-full animate-spin animate-reverse"></div>
                </div>
              </div>
            )}

            {/* No Results with Babui theme */}
            {filteredProperties.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-amber-200">
                <div className="text-amber-400 mb-6">
                  <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-amber-800 mb-4">
                  {t('no-properties', 'কোন বাসা পাওয়া যায়নি', 'No Nests Found')}
                </h3>
                <p className="text-amber-600 text-lg">
                  {t('try-different-filters', 'বিভিন্ন ফিল্টার চেষ্টা করুন', 'Try adjusting your search filters')}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Map View with enhanced styling */
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
            {propertiesWithCoords.length > 0 ? (
              <PropertiesMap 
                properties={propertiesWithCoords}
                onPropertyClick={(property) => handlePropertySelect(property.id)}
                selectedPropertyId={selectedProperty}
                height="600px"
              />
            ) : (
              <div className="text-center py-20 text-amber-600 text-lg">
                {t('no-properties-with-location', 'কোন অবস্থানসহ বাসা পাওয়া যায়নি', 'No properties with valid locations found')}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;