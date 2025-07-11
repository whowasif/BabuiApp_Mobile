import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

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

const amenitiesList = [
  { value: 'ac', label: 'AC' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'security', label: 'Security' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'generator', label: 'Generator' },
  { value: 'gas', label: 'Gas' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'parking', label: 'Parking' },
];

export default function SearchFilters({ filters, onFiltersChange, onSearch }) {
  const handleAmenityChange = (amenity, checked) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = checked
      ? [...currentAmenities, amenity]
      : currentAmenities.filter(a => a !== amenity);
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Area</Text>
      <TextInput
        style={styles.input}
        placeholder="Area"
        value={filters.area || ''}
        onChangeText={text => onFiltersChange({ ...filters, area: text })}
      />
      <Text style={styles.label}>Max Price</Text>
      <TextInput
        style={styles.input}
        placeholder="Max Price"
        keyboardType="numeric"
        value={filters.maxPrice ? String(filters.maxPrice) : ''}
        onChangeText={text => onFiltersChange({ ...filters, maxPrice: text ? Number(text) : undefined })}
      />
      <Text style={styles.label}>Property Type</Text>
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
      </View>
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
      <Text style={styles.label}>Amenities</Text>
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
      <Text style={styles.placeholder}>[More Filters Coming Soon]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  label: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    overflow: 'hidden',
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
  },
  amenityLabel: {
    marginLeft: 4,
    color: '#757575',
    fontSize: 13,
  },
  placeholder: {
    color: '#BDBDBD',
    fontStyle: 'italic',
    marginVertical: 8,
  },
}); 