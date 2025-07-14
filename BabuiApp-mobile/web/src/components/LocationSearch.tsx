import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { bangladeshCities, searchCities, searchAreas, getAreasForCity } from '../data/bangladeshLocations';
import { useLanguage } from '../hooks/useLanguage';

interface LocationSearchProps {
  selectedCity?: string;
  selectedArea?: string;
  onCityChange: (cityId: string) => void;
  onAreaChange: (areaId: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  selectedCity,
  selectedArea,
  onCityChange,
  onAreaChange,
  placeholder,
  className = ''
}) => {
  const { language, t } = useLanguage();
  const [cityQuery, setCityQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const areaInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  const filteredCities = searchCities(cityQuery);
  const filteredAreas = selectedCity ? searchAreas(selectedCity, areaQuery) : [];

  const selectedCityData = bangladeshCities.find(c => c.id === selectedCity);
  const selectedAreaData = selectedCity ? getAreasForCity(selectedCity).find(a => a.id === selectedArea) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setShowAreaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (cityId: string) => {
    onCityChange(cityId);
    setCityQuery('');
    setShowCityDropdown(false);
    onAreaChange(''); // Reset area when city changes
    setAreaQuery('');
  };

  const handleAreaSelect = (areaId: string) => {
    onAreaChange(areaId);
    setAreaQuery('');
    setShowAreaDropdown(false);
  };

  const clearCity = () => {
    onCityChange('');
    onAreaChange('');
    setCityQuery('');
    setAreaQuery('');
  };

  const clearArea = () => {
    onAreaChange('');
    setAreaQuery('');
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* City Search */}
      <div className="relative flex-1" ref={cityDropdownRef}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            ref={cityInputRef}
            type="text"
            value={selectedCityData ? (language === 'bn' ? selectedCityData.nameBn : selectedCityData.name) : cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              setShowCityDropdown(true);
            }}
            onFocus={() => setShowCityDropdown(true)}
            placeholder={placeholder || t('select-city', 'শহর নির্বাচন করুন', 'Select City')}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
          />
          {selectedCity && (
            <button
              onClick={clearCity}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        {showCityDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {language === 'bn' ? city.nameBn : city.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {language === 'bn' ? city.divisionBn : city.division}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {t('no-cities-found', 'কোন শহর পাওয়া যায়নি', 'No cities found')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Area Search */}
      {selectedCity && (
        <div className="relative flex-1" ref={areaDropdownRef}>
          <div className="relative">
            <input
              ref={areaInputRef}
              type="text"
              value={selectedAreaData ? (language === 'bn' ? selectedAreaData.nameBn : selectedAreaData.name) : areaQuery}
              onChange={(e) => {
                setAreaQuery(e.target.value);
                setShowAreaDropdown(true);
              }}
              onFocus={() => setShowAreaDropdown(true)}
              placeholder={t('select-area', 'এলাকা নির্বাচন করুন', 'Select Area')}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            />
            {selectedArea && (
              <button
                onClick={clearArea}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {showAreaDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredAreas.length > 0 ? (
                <>
                  {/* Popular areas first */}
                  {filteredAreas.filter(area => area.popular).length > 0 && (
                    <>
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                        {t('popular-areas', 'জনপ্রিয় এলাকা', 'Popular Areas')}
                      </div>
                      {filteredAreas.filter(area => area.popular).map((area) => (
                        <button
                          key={area.id}
                          onClick={() => handleAreaSelect(area.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <div className="font-medium text-gray-900">
                            {language === 'bn' ? area.nameBn : area.name}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  
                  {/* Other areas */}
                  {filteredAreas.filter(area => !area.popular).length > 0 && (
                    <>
                      {filteredAreas.filter(area => area.popular).length > 0 && (
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                          {t('other-areas', 'অন্যান্য এলাকা', 'Other Areas')}
                        </div>
                      )}
                      {filteredAreas.filter(area => !area.popular).map((area) => (
                        <button
                          key={area.id}
                          onClick={() => handleAreaSelect(area.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {language === 'bn' ? area.nameBn : area.name}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  {t('no-areas-found', 'কোন এলাকা পাওয়া যায়নি', 'No areas found')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;