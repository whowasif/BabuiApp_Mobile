import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { 
  getDivisions, 
  getDistrictsByDivision, 
  getUpazilasByDistrict, 
  getAreasByUpazilaId 
} from '../data/bd-geocode/locationUtils';
import { useLanguage } from '../hooks/useLanguage';

interface BangladeshLocationSearchProps {
  selectedDivision?: string;
  selectedDistrict?: string;
  selectedThana?: string;
  selectedArea?: string;
  onDivisionChange: (divisionId: string) => void;
  onDistrictChange: (districtId: string) => void;
  onThanaChange: (thanaId: string) => void;
  onAreaChange: (areaId: string) => void;
  className?: string;
}

const BangladeshLocationSearch: React.FC<BangladeshLocationSearchProps> = ({
  selectedDivision,
  selectedDistrict,
  selectedThana,
  selectedArea,
  onDivisionChange,
  onDistrictChange,
  onThanaChange,
  onAreaChange,
  className = ''
}) => {
  const { language, t } = useLanguage();
  
  // Search queries
  const [divisionQuery, setDivisionQuery] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [thanaQuery, setThanaQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  
  // Dropdown states
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showThanaDropdown, setShowThanaDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  
  // Refs
  const divisionInputRef = useRef<HTMLInputElement>(null);
  const districtInputRef = useRef<HTMLInputElement>(null);
  const thanaInputRef = useRef<HTMLInputElement>(null);
  const areaInputRef = useRef<HTMLInputElement>(null);
  const divisionDropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);
  const thanaDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  // Get data
  const divisions = getDivisions().filter(d => divisionQuery.trim() === '' || d.name.toLowerCase().includes(divisionQuery.toLowerCase()) || d.bn_name?.includes(divisionQuery));
  const districts = selectedDivision
    ? getDistrictsByDivision(selectedDivision).filter(d => districtQuery.trim() === '' || d.name.toLowerCase().includes(districtQuery.toLowerCase()) || d.bn_name?.includes(districtQuery))
    : [];
  const thanas = selectedDistrict
    ? getUpazilasByDistrict(selectedDistrict).filter(t => thanaQuery.trim() === '' || t.name.toLowerCase().includes(thanaQuery.toLowerCase()) || t.bn_name?.includes(thanaQuery))
    : [];
  const areas = selectedThana
    ? getAreasByUpazilaId(Number(selectedThana)).filter(area => areaQuery.trim() === '' || area.toLowerCase().includes(areaQuery.toLowerCase()))
    : [];

  // Get selected data
  const selectedDivisionData = getDivisions().find(d => d.id === selectedDivision);
  const selectedDistrictData = selectedDivision ? getDistrictsByDivision(selectedDivision).find(d => d.id === selectedDistrict) : null;
  const selectedThanaData = selectedDistrict ? getUpazilasByDistrict(selectedDistrict).find(t => t.id === selectedThana) : null;
  const selectedAreaData = selectedArea;

  // Handle clicks outside - Fixed with proper event handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (divisionDropdownRef.current && !divisionDropdownRef.current.contains(target)) {
        setShowDivisionDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(target)) {
        setShowDistrictDropdown(false);
      }
      if (thanaDropdownRef.current && !thanaDropdownRef.current.contains(target)) {
        setShowThanaDropdown(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(target)) {
        setShowAreaDropdown(false);
      }
    };

    // Use capture phase to ensure we catch the event before other handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  // Handle selections - Fixed with proper event handling
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDivisionSelect = (divisionId: string, _event?: React.MouseEvent) => {
    onDivisionChange(divisionId);
    setDivisionQuery('');
    setShowDivisionDropdown(false);
    // Reset dependent selections
    onDistrictChange('');
    onThanaChange('');
    onAreaChange('');
    setDistrictQuery('');
    setThanaQuery('');
    setAreaQuery('');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDistrictSelect = (districtId: string, _event?: React.MouseEvent) => {
    onDistrictChange(districtId);
    setDistrictQuery('');
    setShowDistrictDropdown(false);
    // Reset dependent selections
    onThanaChange('');
    onAreaChange('');
    setThanaQuery('');
    setAreaQuery('');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleThanaSelect = (thanaId: string, _event?: React.MouseEvent) => {
    onThanaChange(thanaId);
    setThanaQuery('');
    setShowThanaDropdown(false);
    // Reset dependent selections
    onAreaChange('');
    setAreaQuery('');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAreaSelect = (areaId: string, _event?: React.MouseEvent) => {
    onAreaChange(areaId);
    setAreaQuery('');
    setShowAreaDropdown(false);
  };

  // Clear functions
  const clearDivision = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onDivisionChange('');
    onDistrictChange('');
    onThanaChange('');
    onAreaChange('');
    setDivisionQuery('');
    setDistrictQuery('');
    setThanaQuery('');
    setAreaQuery('');
  };

  const clearDistrict = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onDistrictChange('');
    onThanaChange('');
    onAreaChange('');
    setDistrictQuery('');
    setThanaQuery('');
    setAreaQuery('');
  };

  const clearThana = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onThanaChange('');
    onAreaChange('');
    setThanaQuery('');
    setAreaQuery('');
  };

  const clearArea = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    onAreaChange('');
    setAreaQuery('');
  };

  // Keyboard navigation support
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleKeyDown = (
    event: React.KeyboardEvent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[],
    selectedIndex: number,
    onSelect: (id: string) => void,
    setSelectedIndex: (index: number) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onSelect(items[selectedIndex].id);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setShowDivisionDropdown(false);
        setShowDistrictDropdown(false);
        setShowThanaDropdown(false);
        setShowAreaDropdown(false);
        break;
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-50 ${className}`}>
      {/* Division */}
      <div className="relative" ref={divisionDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('division', 'বিভাগ', 'Division')}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            ref={divisionInputRef}
            type="text"
            value={divisionQuery !== ''
              ? divisionQuery
              : selectedDivisionData
                ? (language === 'bn' ? selectedDivisionData.nameBn : selectedDivisionData.name)
                : ''}
            onChange={(e) => {
              setDivisionQuery(e.target.value);
              setShowDivisionDropdown(true);
            }}
            onFocus={() => setShowDivisionDropdown(true)}
            placeholder={t('select-division', 'বিভাগ নির্বাচন করুন', 'Select Division')}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            autoComplete="off"
          />
          {selectedDivision && (
            <button
              type="button"
              onClick={clearDivision}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        {showDivisionDropdown && (
          <div className="absolute z-[99999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {divisions.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              divisions.map((division, idx) => (
                <button
                  key={`${division.id}-${idx}`}
                  type="button"
                  onClick={(e) => handleDivisionSelect(division.id, e)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-150"
                >
                  <div className="font-medium text-gray-900">
                    {language === 'bn' ? division.nameBn : division.name}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {t('no-divisions-found', 'কোন বিভাগ পাওয়া যায়নি', 'No divisions found')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* District */}
      <div className="relative" ref={districtDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('district', 'জেলা', 'District')}
        </label>
        <div className="relative">
          <input
            ref={districtInputRef}
            type="text"
            value={selectedDistrictData ? (language === 'bn' ? selectedDistrictData.nameBn : selectedDistrictData.name) : districtQuery}
            onChange={(e) => {
              setDistrictQuery(e.target.value);
              setShowDistrictDropdown(true);
            }}
            onFocus={() => setShowDistrictDropdown(true)}
            placeholder={t('select-district', 'জেলা নির্বাচন করুন', 'Select District')}
            disabled={!selectedDivision}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            autoComplete="off"
          />
          {selectedDistrict && (
            <button
              type="button"
              onClick={clearDistrict}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        {showDistrictDropdown && selectedDivision && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {districts.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              districts.map((district, idx) => (
                <button
                  key={`${district.id}-${idx}`}
                  type="button"
                  onClick={(e) => handleDistrictSelect(district.id, e)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-150"
                >
                  <div className="font-medium text-gray-900">
                    {language === 'bn' ? district.nameBn : district.name}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {t('no-districts-found', 'কোন জেলা পাওয়া যায়নি', 'No districts found')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thana */}
      <div className="relative" ref={thanaDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('thana', 'থানা', 'Thana')}
        </label>
        <div className="relative">
          <input
            ref={thanaInputRef}
            type="text"
            value={selectedThanaData ? (language === 'bn' ? selectedThanaData.nameBn : selectedThanaData.name) : thanaQuery}
            onChange={(e) => {
              setThanaQuery(e.target.value);
              setShowThanaDropdown(true);
            }}
            onFocus={() => setShowThanaDropdown(true)}
            placeholder={t('select-thana', 'থানা নির্বাচন করুন', 'Select Thana')}
            disabled={!selectedDistrict}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            autoComplete="off"
          />
          {selectedThana && (
            <button
              type="button"
              onClick={clearThana}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        {showThanaDropdown && selectedDistrict && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {thanas.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              thanas.map((thana, idx) => (
                <button
                  key={`${thana.id}-${idx}`}
                  type="button"
                  onClick={(e) => handleThanaSelect(thana.id, e)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-150"
                >
                  <div className="font-medium text-gray-900">
                    {language === 'bn' ? thana.nameBn : thana.name}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {t('no-thanas-found', 'কোন থানা পাওয়া যায়নি', 'No thanas found')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Area */}
      <div className="relative" ref={areaDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('area', 'এলাকা', 'Area')}
        </label>
        <div className="relative">
          <input
            ref={areaInputRef}
            type="text"
            value={selectedAreaData || areaQuery}
            onChange={(e) => {
              setAreaQuery(e.target.value);
              setShowAreaDropdown(true);
            }}
            onFocus={() => setShowAreaDropdown(true)}
            placeholder={t('select-area', 'এলাকা নির্বাচন করুন', 'Select Area')}
            disabled={!selectedThana}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            autoComplete="off"
          />
          {selectedArea && (
            <button
              type="button"
              onClick={clearArea}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        {showAreaDropdown && selectedThana && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {areas.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              areas.map((area, idx) => (
                <button
                  key={`${area}-${idx}`}
                  type="button"
                  onClick={(e) => handleAreaSelect(area, e)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors duration-150"
                >
                  <div className="font-medium text-gray-900">
                    {area}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {t('no-areas-found', 'কোন এলাকা পাওয়া যায়নি', 'No areas found')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BangladeshLocationSearch;