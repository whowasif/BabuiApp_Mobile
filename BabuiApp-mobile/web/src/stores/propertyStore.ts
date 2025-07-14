import { create } from 'zustand';
import { Property } from '../types';
import { mockProperties } from '../data/mockProperties';
import { supabase } from '../utils/supabaseClient';

interface PropertyStore {
  properties: Property[];
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  removeProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;
  getPropertiesByLocation: (lat: number, lng: number, radius: number) => Property[];
}

export const usePropertyStore = create<PropertyStore & { fetchProperties: () => Promise<void> }>((set, get) => ({
  properties: [],
  
  fetchProperties: async () => {
    const { data, error } = await supabase.from('properties').select('*');
    if (!error && data) {
      // Map DB fields to frontend Property type
      const mapped = data.map((item: any) => {
        let locationFromMap = item.location_from_map;
        if (typeof locationFromMap === 'string') {
          try {
            locationFromMap = JSON.parse(locationFromMap);
          } catch {
            locationFromMap = null;
          }
        }
        return {
          id: item.id,
          title: item.property_details || '',
          titleBn: '',
          description: item.location_details || '',
          descriptionBn: '',
          price: item.price || 0,
          currency: 'BDT' as const,
          type: (item.property_type || item.type || 'apartment'),
          bedrooms: item.bedroom || 0,
          bathrooms: item.bathroom || 0,
          area: item.area_sqft || 0,
          images: Array.isArray(item.pictures) ? item.pictures.map((src: string, idx: number) => ({ id: `${item.id}-img${idx}`, src, alt: '', altBn: '', priority: idx === 0 })) : [],
          location: {
            address: '',
            addressBn: '',
            division: item.address_division || '',
            district: item.address_district || '',
            thana: item.address_thana || '',
            city: item.address_district || '',
            area: item.address_area || '',
            areaBn: '',
            coordinates: (locationFromMap &&
              (typeof locationFromMap.lat === 'number' || typeof locationFromMap.lat === 'string') &&
              (typeof locationFromMap.lng === 'number' || typeof locationFromMap.lng === 'string'))
              ? {
                  lat: parseFloat(locationFromMap.lat),
                  lng: parseFloat(locationFromMap.lng)
                }
              : { lat: 0, lng: 0 },
            nearbyPlaces: [],
            nearbyPlacesBn: [],
          },
          amenities: item.amenities || [],
          amenitiesBn: item.amenities_bn || [],
          landlord: {
            id: item.owner_id || item.contact_user_id || item.id || '', // Use property ID as fallback
            name: item.contact_name || 'Property Owner',
            nameBn: 'সম্পত্তির মালিক',
            phone: item.contact_phone || '',
            email: item.contact_email || '',
            rating: 0,
            verified: false,
          },
          available: item.availability === 'immediate' ? true : false,
          availableFrom: item.created_at ? new Date(item.created_at) : new Date(),
          createdAt: item.created_at ? new Date(item.created_at) : new Date(),
          updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
          genderPreference: item.gender_preference || 'any',
          furnishing: item.furnish || 'unfurnished',
          parking: item.amenities ? item.amenities.includes('parking') : false,
        };
      });
      console.log('Mapped properties for map:', mapped.map(p => ({ id: p.id, coordinates: p.location.coordinates })));
      set({ properties: mapped });
    }
  },
  
  addProperty: (property: Property) => {
    set((state) => ({
      properties: [...state.properties, property]
    }));
  },
  
  updateProperty: (id: string, updates: Partial<Property>) => {
    set((state) => ({
      properties: state.properties.map(prop => 
        prop.id === id ? { ...prop, ...updates } : prop
      )
    }));
  },
  
  removeProperty: (id: string) => {
    set((state) => ({
      properties: state.properties.filter(prop => prop.id !== id)
    }));
  },
  
  getProperty: (id: string) => {
    return get().properties.find(prop => prop.id === id);
  },
  
  getPropertiesByLocation: (lat: number, lng: number, radius: number = 5) => {
    const properties = get().properties;
    return properties.filter(property => {
      if (!property.location?.coordinates) return false;
      
      const distance = calculateDistance(
        lat, lng,
        property.location.coordinates.lat,
        property.location.coordinates.lng
      );
      
      return distance <= radius;
    });
  }
}));

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 