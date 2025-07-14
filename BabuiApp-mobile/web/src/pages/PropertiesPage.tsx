import React, { useState, useMemo } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { mockProperties } from '../data/mockProperties';
import { useLanguage } from '../hooks/useLanguage';

const PropertiesPage: React.FC = () => {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'newest' | 'area'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sort properties without filtering (show all properties)
  const sortedProperties = useMemo(() => {
    const properties = [...mockProperties];
    
    properties.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'area':
          return b.area - a.area;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return properties;
  }, [sortBy]);

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

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('all-properties', 'সকল সম্পত্তি', 'All Properties')}
            </h1>
            
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price-low' | 'price-high' | 'newest' | 'area')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="newest">{t('sort-newest', 'নতুন', 'Newest')}</option>
                <option value="price-low">{t('sort-price-low', 'কম দাম', 'Price: Low to High')}</option>
                <option value="price-high">{t('sort-price-high', 'বেশি দাম', 'Price: High to Low')}</option>
                <option value="area">{t('sort-area', 'এলাকা', 'Area')}</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {t('showing-results', 
              `${sortedProperties.length}টি ফলাফল দেখানো হচ্ছে`, 
              `Showing ${sortedProperties.length} results`
            )}
          </p>
          
          <p className="text-sm text-gray-500">
            {t('search-hint', 'অনুসন্ধানের জন্য হোম পেজে যান', 'Go to Home page to search')}
          </p>
        </div>

        {/* Properties Grid/List */}
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          {sortedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onFavorite={handleFavorite}
              isFavorite={favorites.has(property.id)}
            />
          ))}
        </div>

        {/* No Results (shouldn't happen since we show all properties) */}
        {sortedProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('no-properties', 'কোন সম্পত্তি পাওয়া যায়নি', 'No Properties Found')}
            </h3>
            <p className="text-gray-600">
              {t('check-back-later', 'পরে আবার চেষ্টা করুন', 'Please check back later')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PropertiesPage;