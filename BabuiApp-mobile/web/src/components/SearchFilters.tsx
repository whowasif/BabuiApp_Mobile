import React from 'react';
import { Search, Filter, Users, Home as HomeIcon } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
// import BangladeshLocationSearch from './BangladeshLocationSearch';
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict } from '../data/bd-geocode/locationUtils';
import areaData from '../data/bd-geocode/area.json';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch: () => void;
  showMainSearch?: boolean;
  showAdvancedFilters?: boolean;
  onToggleAdvancedFilters?: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  showMainSearch = false,
  showAdvancedFilters = false,
  onToggleAdvancedFilters
}) => {
  const { language, t } = useLanguage();

  const propertyTypes = [
    { value: 'apartment', labelBn: 'অ্যাপার্টমেন্ট', labelEn: 'Apartment' },
    { value: 'room', labelBn: 'রুম', labelEn: 'Room' },
    { value: 'office', labelBn: 'অফিস', labelEn: 'Office' },
    { value: 'shop', labelBn: 'দোকান', labelEn: 'Shop' },
    { value: 'parking', labelBn: 'পার্কিং', labelEn: 'Parking' }
  ];

  const genderPreferences = [
    { value: 'any', labelBn: 'যেকোনো', labelEn: 'Any' },
    { value: 'male', labelBn: 'পুরুষ', labelEn: 'Male Only' },
    { value: 'female', labelBn: 'মহিলা', labelEn: 'Female Only' }
  ];

  const furnishingOptions = [
    { value: 'any', labelBn: 'যেকোনো', labelEn: 'Any' },
    { value: 'furnished', labelBn: 'সাজানো', labelEn: 'Furnished' },
    { value: 'semi-furnished', labelBn: 'আংশিক সাজানো', labelEn: 'Semi-Furnished' },
    { value: 'unfurnished', labelBn: 'সাজানো নয়', labelEn: 'Unfurnished' }
  ];

  const availabilityOptions = [
    { value: 'any', labelBn: 'যেকোনো', labelEn: 'Any' },
    { value: 'immediate', labelBn: 'তাৎক্ষণিক', labelEn: 'Immediate' },
    { value: 'within-week', labelBn: 'এক সপ্তাহের মধ্যে', labelEn: 'Within a Week' },
    { value: 'within-month', labelBn: 'এক মাসের মধ্যে', labelEn: 'Within a Month' }
  ];

  const priorityOptions = [
    { value: '', labelBn: 'যেকোনো', labelEn: 'Any' },
    { value: 'family', labelBn: 'পরিবার', labelEn: 'Family' },
    { value: 'bachelor', labelBn: 'ব্যাচেলর', labelEn: 'Bachelor' },
    { value: 'sublet', labelBn: 'সাবলেট', labelEn: 'Sublet' },
  ];

  if (showMainSearch) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Hierarchical Location Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Division Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('division', 'বিভাগ', 'Division')}
            </label>
            <div className="relative">
              <select
                value={filters.division || ''}
                onChange={(e) => onFiltersChange({ ...filters, division: e.target.value, district: '', thana: '', area: '' })}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">{t('select-division', 'বিভাগ নির্বাচন করুন', 'Select Division')}</option>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {getDivisions().map((division: any) => (
                  <option key={division.id} value={division.id} className="text-gray-900">
                    {language === 'bn' ? division.bn_name : division.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* District Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('district', 'জেলা', 'District')}
            </label>
            <div className="relative">
              <select
                value={filters.district || ''}
                onChange={(e) => onFiltersChange({ ...filters, district: e.target.value, thana: '', area: '' })}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-gray-900 bg-white"
                disabled={!filters.division}
              >
                <option value="" className="text-gray-500">{t('select-district', 'জেলা নির্বাচন করুন', 'Select District')}</option>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filters.division && getDistrictsByDivision(filters.division).map((district: any) => (
                  <option key={district.id} value={district.id} className="text-gray-900">
                    {language === 'bn' ? district.bn_name : district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Thana/Area Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('thana', 'থানা', 'Thana/Area')}
            </label>
            <div className="relative">
              <select
                value={filters.thana || ''}
                onChange={(e) => onFiltersChange({ ...filters, thana: e.target.value, area: '' })}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-gray-900 bg-white"
                disabled={!filters.district}
              >
                <option value="" className="text-gray-500">{t('select-thana', 'থানা নির্বাচন করুন', 'Select Thana/Area')}</option>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filters.district && getUpazilasByDistrict(filters.district).map((thana: any) => (
                  <option key={thana.id} value={thana.id} className="text-gray-900">
                    {language === 'bn' ? thana.bn_name : thana.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Sub Area Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('area', 'এলাকা', 'Sub Area')}
            </label>
            <div className="relative">
              <select
                value={filters.area || ''}
                onChange={(e) => onFiltersChange({ ...filters, area: e.target.value })}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-gray-900 bg-white"
                disabled={!filters.thana}
              >
                <option value="" className="text-gray-500">{t('select-area', 'এলাকা নির্বাচন করুন', 'Select Sub Area')}</option>
                {filters.thana && (() => {
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  const areaObj = areaData.find((item: any) => item.upazila_id === Number(filters.thana));
                  if (!areaObj) return null;
                                      const areas = areaObj.areas || [];
                    const bn_areas = areaObj.bn_areas || [];
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    return areas.map((area: any, idx: number) => (
                    <option key={area} value={area} className="text-gray-900">
                      {language === 'bn' ? bn_areas[idx] || area : area}
                    </option>
                  ));
                })()}
              </select>
            </div>
          </div>
        </div>
        {/* Property Type and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('property-type', 'সম্পত্তির ধরন', 'Property Type')}
            </label>
            <div className="relative">
              <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={filters.type || ''}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e) => onFiltersChange({ ...filters, type: e.target.value as any || undefined })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none text-gray-900 bg-white"
              >
                <option value="" className="text-gray-500">{t('any-type', 'যেকোনো ধরন', 'Any Type')}</option>
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value} className="text-gray-900">
                    {language === 'bn' ? type.labelBn : type.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(filters.type === 'apartment' || filters.type === 'room') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('priority', 'অগ্রাধিকার', 'Priority (Family/Bachelor/Sublet)')}
              </label>
              <select
                value={filters.priority || ''}
                onChange={e => onFiltersChange({
                  ...filters,
                  priority: (e.target.value === '' ? undefined : e.target.value as 'family' | 'bachelor' | 'sublet')
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value} className="text-gray-900">
                    {language === 'bn' ? option.labelBn : option.labelEn}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('max-price', 'সর্বোচ্চ মূল্য', 'Max Price')}
            </label>
            <input
              type="number"
              placeholder={t('max-price-placeholder', 'সর্বোচ্চ মূল্য', 'Max Price')}
              value={filters.maxPrice || ''}
              onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>
        </div>

        {/* Search and Show Advanced Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onSearch}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Search size={16} />
            {t('search', 'খুঁজুন', 'Search')}
          </button>
          {typeof onToggleAdvancedFilters === 'function' && (
            <button
              onClick={onToggleAdvancedFilters}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm bg-amber-50 px-6 py-3 rounded-lg border border-amber-200 hover:border-amber-300 transition-all duration-300 flex items-center gap-2"
            >
              {showAdvancedFilters
                ? t('hide-advanced', 'উন্নত ফিল্টার লুকান', 'Hide Advanced')
                : t('show-advanced', 'উন্নত ফিল্টার দেখান', 'Show Advanced')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Advanced filters (existing functionality)
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Filter size={20} />
        {t('advanced-filters', 'উন্নত ফিল্টার', 'Advanced Filters')}
      </h3>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('bedrooms', 'শোবার ঘর', 'Bedrooms')}
          </label>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) => onFiltersChange({ ...filters, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="" className="text-gray-500">{t('any', 'যেকোনো', 'Any')}</option>
            {[1, 2, 3, 4, 5].map(num => (
              <option key={num} value={num} className="text-gray-900">{num}+</option>
            ))}
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('bathrooms', 'বাথরুম', 'Bathrooms')}
          </label>
          <select
            value={filters.bathrooms || ''}
            onChange={(e) => onFiltersChange({ ...filters, bathrooms: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="" className="text-gray-500">{t('any', 'যেকোনো', 'Any')}</option>
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num} className="text-gray-900">{num}+</option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('min-price', 'সর্বনিম্ন মূল্য', 'Min Price')}
          </label>
          <input
            type="number"
            placeholder="৫,০০০"
            value={filters.minPrice || ''}
            onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>

        {/* Min Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('min-area', 'সর্বনিম্ন এলাকা (বর্গফুট)', 'Min Area (sqft)')}
          </label>
          <input
            type="number"
            placeholder="500"
            value={filters.minArea || ''}
            onChange={(e) => onFiltersChange({ ...filters, minArea: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users size={16} className="inline mr-1" />
            {t('gender-preference', 'লিঙ্গ পছন্দ', 'Gender Preference')}
          </label>
                      <select
              value={filters.genderPreference || 'any'}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => onFiltersChange({ ...filters, genderPreference: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            {genderPreferences.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {language === 'bn' ? option.labelBn : option.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Furnishing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('furnishing', 'আসবাবপত্র', 'Furnishing')}
          </label>
                      <select
              value={filters.furnishing || 'any'}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => onFiltersChange({ ...filters, furnishing: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            {furnishingOptions.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {language === 'bn' ? option.labelBn : option.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('availability', 'উপলব্ধতা', 'Availability')}
          </label>
                      <select
              value={filters.availability || 'any'}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => onFiltersChange({ ...filters, availability: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            {availabilityOptions.map(option => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {language === 'bn' ? option.labelBn : option.labelEn}
              </option>
            ))}
          </select>
        </div>

        {/* Amenities Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('amenities', 'সুবিধাসমূহ', 'Amenities')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { value: 'ac', labelBn: 'এয়ার কন্ডিশনার', labelEn: 'AC' },
              { value: 'wifi', labelBn: 'ওয়াইফাই', labelEn: 'WiFi' },
              { value: 'security', labelBn: 'নিরাপত্তা', labelEn: 'Security' },
              { value: 'elevator', labelBn: 'লিফট', labelEn: 'Elevator' },
              { value: 'generator', labelBn: 'জেনারেটর', labelEn: 'Generator' },
              { value: 'gas', labelBn: 'গ্যাস', labelEn: 'Gas' },
              { value: 'balcony', labelBn: 'বারান্দা', labelEn: 'Balcony' },
              { value: 'parking', labelBn: 'পার্কিং', labelEn: 'Parking' }
            ].map((amenity) => (
              <label key={amenity.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.amenities?.includes(amenity.value) || false}
                  onChange={(e) => {
                    const currentAmenities = filters.amenities || [];
                    const newAmenities = e.target.checked
                      ? [...currentAmenities, amenity.value]
                      : currentAmenities.filter(a => a !== amenity.value);
                    onFiltersChange({ ...filters, amenities: newAmenities });
                  }}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">
                  {language === 'bn' ? amenity.labelBn : amenity.labelEn}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="flex justify-end">
        <button
          onClick={onSearch}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          {t('apply-filters', 'ফিল্টার প্রয়োগ করুন', 'Apply Filters')}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;