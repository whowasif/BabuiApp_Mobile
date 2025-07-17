import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import divisionsData from '../data/bd-geocode/divisions.json';
import districtsData from '../data/bd-geocode/districts.json';
import upazilasData from '../data/bd-geocode/upazilas.json';
import areasData from '../data/bd-geocode/area.json';
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict, getAreasByUpazilaId, extractData } from '../utils/bangladeshLocationUtils';
import { MaterialIcons } from '@expo/vector-icons';

const propertyTypes = [
  { value: '', label: 'Any Type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'parking', label: 'Parking' },
];

const bedroomOptions = [
  { value: '', label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

const bathroomOptions = [
  { value: '', label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
];

const furnishingOptions = [
  { value: '', label: 'Any' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const genderOptions = [
  { value: '', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'family', label: 'Family' },
  { value: 'any', label: 'Any' },
];

const availabilityOptions = [
  { value: '', label: 'Any' },
  { value: 'immediate', label: 'Immediate' },
  { value: 'within-week', label: 'Within Week' },
  { value: 'within-month', label: 'Within Month' },
];

const amenitiesList = [
  { value: 'ac', label: 'AC' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'security', label: 'Security' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'generator', label: 'Generator' },
  { value: 'gas', label: 'Gas' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'parking', label: 'Parking' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'laundry', label: 'Laundry' },
];

export function BasicSearchFilters({ filters, onFiltersChange, onSearch, onShowAdvanced, showAdvanced }) {
  const divisionOptions = getDivisions();
  const districts = extractData(districtsData);
  const upazilas = extractData(upazilasData);
  const districtOptions = filters.division ? getDistrictsByDivision(filters.division, districts) : [];
  const thanaOptions = filters.district ? getUpazilasByDistrict(filters.district, upazilas) : [];
  const areaOptions = filters.thana ? getAreasByUpazilaId(filters.thana) : [];

  // Handlers to reset child fields
  const handleDivisionChange = (value) => {
    onFiltersChange({ ...filters, division: value, district: '', thana: '', subArea: '' });
  };
  const handleDistrictChange = (value) => {
    onFiltersChange({ ...filters, district: value, thana: '', subArea: '' });
  };
  const handleThanaChange = (value) => {
    onFiltersChange({ ...filters, thana: value, subArea: '' });
  };
  const handleSubAreaChange = (value) => {
    onFiltersChange({ ...filters, subArea: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Location</Text>
      <Text style={styles.label}>Division</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filters.division || ''}
          style={styles.input}
          onValueChange={handleDivisionChange}
        >
          <Picker.Item label="Select Division" value="" />
          {divisionOptions.filter(div => div && div.id && div.name).map(div => (
            <Picker.Item key={div.id} label={div.name} value={div.id} />
          ))}
        </Picker>
        {filters.division && (
          <TouchableOpacity 
            style={styles.clearFieldBtn} 
            onPress={() => onFiltersChange({ ...filters, division: '', district: '', thana: '', subArea: '' })}
          >
            <MaterialIcons name="clear" size={16} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.label}>District</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filters.district || ''}
          style={styles.input}
          onValueChange={handleDistrictChange}
          enabled={!!filters.division}
        >
          <Picker.Item label="Select District" value="" />
          {districtOptions.filter(dist => dist && dist.id && dist.name).map(dist => (
            <Picker.Item key={dist.id} label={dist.name} value={dist.id} />
          ))}
        </Picker>
        {filters.district && (
          <TouchableOpacity 
            style={styles.clearFieldBtn} 
            onPress={() => onFiltersChange({ ...filters, district: '', thana: '', subArea: '' })}
          >
            <MaterialIcons name="clear" size={16} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.label}>Thana/Area</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filters.thana || ''}
          style={styles.input}
          onValueChange={handleThanaChange}
          enabled={!!filters.district}
        >
          <Picker.Item label="Select Thana/Area" value="" />
          {thanaOptions.filter(t => t && t.upazila_id && t.name).map(t => (
            <Picker.Item key={t.upazila_id} label={t.name} value={t.upazila_id} />
          ))}
        </Picker>
        {filters.thana && (
          <TouchableOpacity 
            style={styles.clearFieldBtn} 
            onPress={() => onFiltersChange({ ...filters, thana: '', subArea: '' })}
          >
            <MaterialIcons name="clear" size={16} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.label}>Sub Area</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filters.subArea || ''}
          style={styles.input}
          onValueChange={handleSubAreaChange}
          enabled={!!filters.thana}
        >
          <Picker.Item label="Select Sub Area" value="" />
          {areaOptions
            .flatMap(a => (a.areas || []).map((areaName, idx) => ({
              key: `${a.upazila_id}-${idx}`,
              label: areaName,
              value: areaName
            })))
            .map(opt => (
              <Picker.Item key={opt.key} label={opt.label} value={opt.value} />
            ))}
        </Picker>
        {filters.subArea && (
          <TouchableOpacity 
            style={styles.clearFieldBtn} 
            onPress={() => onFiltersChange({ ...filters, subArea: '' })}
          >
            <MaterialIcons name="clear" size={16} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.sectionTitle}>Property Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filters.type || ''}
          style={styles.input}
          onValueChange={value => onFiltersChange({ ...filters, type: value })}
        >
          {propertyTypes.map(option => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
        {filters.type && (
          <TouchableOpacity 
            style={styles.clearFieldBtn} 
            onPress={() => onFiltersChange({ ...filters, type: '' })}
          >
            <MaterialIcons name="clear" size={16} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      {(filters.type === 'apartment' || filters.type === 'room') && (
        <>
          <Text style={styles.label}>Priority (Family/Bachelor/Sublet)</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.priority || ''}
              style={styles.input}
              onValueChange={value => onFiltersChange({ ...filters, priority: value })}
            >
              <Picker.Item label="Any" value="" />
              <Picker.Item label="Family" value="Family" />
              <Picker.Item label="Bachelor" value="Bachelor" />
              <Picker.Item label="Sublet" value="Sublet" />
            </Picker>
            {filters.priority && (
              <TouchableOpacity 
                style={styles.clearFieldBtn} 
                onPress={() => onFiltersChange({ ...filters, priority: '' })}
              >
                <MaterialIcons name="clear" size={16} color="#FF9800" />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
      <Text style={styles.label}>Max Price</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Max Price"
          keyboardType="numeric"
          value={filters.maxPrice ? String(filters.maxPrice) : ''}
          onChangeText={text => onFiltersChange({ ...filters, maxPrice: text ? Number(text) : undefined })}
        />
        {filters.maxPrice && (
          <TouchableOpacity 
            style={styles.clearFieldBtn} 
            onPress={() => onFiltersChange({ ...filters, maxPrice: undefined })}
          >
            <MaterialIcons name="clear" size={16} color="#FF9800" />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
        {!showAdvanced && (
          <TouchableOpacity style={styles.advancedButton} onPress={onShowAdvanced}>
            <Text style={styles.advancedButtonText}>Show Advanced</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function AdvancedSearchFilters({ filters, onFiltersChange, onApply, onHideAdvanced }) {
  const handleAmenityChange = (amenity, checked) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = checked
      ? [...currentAmenities, amenity]
      : currentAmenities.filter(a => a !== amenity);
    onFiltersChange({ ...filters, amenities: newAmenities });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Advanced Filters</Text>
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Bedrooms</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.bedrooms || ''}
              style={styles.input}
              onValueChange={value => onFiltersChange({ ...filters, bedrooms: value })}
            >
              {bedroomOptions.map(option => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Bathrooms</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.bathrooms || ''}
              style={styles.input}
              onValueChange={value => onFiltersChange({ ...filters, bathrooms: value })}
            >
              {bathroomOptions.map(option => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      {/* Thana field removed from advanced filters */}
      <Text style={styles.label}>Min Price</Text>
      <TextInput
        style={styles.input}
        placeholder="Min Price"
        keyboardType="numeric"
        value={filters.minPrice ? String(filters.minPrice) : ''}
        onChangeText={text => onFiltersChange({ ...filters, minPrice: text ? Number(text) : undefined })}
      />
      <Text style={styles.label}>Min Area (sqft)</Text>
      <TextInput
        style={styles.input}
        placeholder="Min Area (sqft)"
        keyboardType="numeric"
        value={filters.minArea ? String(filters.minArea) : ''}
        onChangeText={text => onFiltersChange({ ...filters, minArea: text ? Number(text) : undefined })}
      />
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Gender Preference</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.genderPreference || ''}
              style={styles.input}
              onValueChange={value => onFiltersChange({ ...filters, genderPreference: value })}
            >
              {genderOptions.map(option => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Furnishing</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filters.furnishing || ''}
              style={styles.input}
              onValueChange={value => onFiltersChange({ ...filters, furnishing: value })}
            >
              {furnishingOptions.map(option => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      <Text style={styles.label}>Availability</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={filters.availability || ''}
          style={styles.input}
          onValueChange={value => onFiltersChange({ ...filters, availability: value })}
        >
          {availabilityOptions.map(option => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesRow}>
        {amenitiesList.map(amenity => (
          <View key={amenity.value} style={styles.amenityItem}>
            <Checkbox
              value={filters.amenities?.includes(amenity.value) || false}
              onValueChange={checked => handleAmenityChange(amenity.value, checked)}
              color="#FF9800"
            />
            <Text style={styles.amenityLabel}>{amenity.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <TouchableOpacity style={styles.advancedButton} onPress={onHideAdvanced}>
          <Text style={styles.advancedButtonText}>Hide Advanced</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={onApply}>
          <Text style={styles.searchBtnText}>Apply Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={onApply}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    overflow: 'hidden',
    position: 'relative',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  clearFieldBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    width: '48%',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
    width: '45%',
  },
  amenityLabel: {
    marginLeft: 4,
    color: '#757575',
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: '#00B894',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  advancedButton: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  advancedButtonText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 