import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

const initialState = {
  properties: [],
  myProperties: [], // Add separate state for users properties
};

export const usePropertyStore = create((set, get) => ({
  ...initialState,

  fetchProperties: async (filters = {}) => {
    let query = supabase.from('properties').select('*');

    if (filters.division) query = query.eq('address_division', filters.division);
    if (filters.district) query = query.eq('address_district', filters.district);
    if (filters.area) query = query.ilike('address_area', `%${filters.area}%`);
    if (filters.type) query = query.eq('property_type', filters.type);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.ownerId) query = query.eq('owner_id', filters.ownerId); // Add owner filtering
    // Add more filters as needed

    const { data, error } = await query;
    if (!error && data) {
      // Map DB fields to frontend Property type
      const mapped = data.map((item) => {
        let locationFromMap = item.location_from_map;
        if (typeof locationFromMap === 'string') {
          try {
            locationFromMap = JSON.parse(locationFromMap);
          } catch {
            locationFromMap = null;
          }
        }
        console.log('locationFromMap:', locationFromMap);
        // Ensure coordinates are always mapped if lat/lng are present
        let coordinates = null;
        if (locationFromMap && typeof locationFromMap.lat === 'number' && typeof locationFromMap.lng === 'number') {
          coordinates = { lat: locationFromMap.lat, lng: locationFromMap.lng };
        }
        return {
          id: item.id,
          title: item.property_details || '',
          titleBn: '',
          description: item.location_details || '',
          descriptionBn: '',
          price: item.price || 0,
          currency: 'BDT',
          type: (item.property_type || item.type || 'apartment'),
          bedrooms: item.bedroom || 0,
          bathrooms: item.bathroom || 0,
          area: item.area_sqft || 0,
          images: Array.isArray(item.pictures) ? item.pictures.map((src, idx) => ({ 
            id: `${item.id}-img${idx}`, 
            src, 
            alt: '', 
            altBn: '', 
            priority: idx === 0 
          })) : [],
          location: {
            address: '',
            addressBn: '',
            division: item.address_division || '',
            district: item.address_district || '',
            thana: item.address_thana || '',
            city: item.address_district || '',
            area: item.address_area || '',
            areaBn: '',
            coordinates: coordinates
          },
          amenities: item.amenities || [],
          amenitiesBn: item.amenities_bn || [],
          landlord: {
            id: item.owner_id || item.contact_user_id || item.id || '',
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
      set({ properties: mapped });
    }
  },

  // New function to fetch user's properties specifically
  fetchMyProperties: async (userId) => {
    if (!userId) {
      set({ myProperties: [] });
      return;
    }

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((item) => {
        let locationFromMap = item.location_from_map;
        if (typeof locationFromMap === 'string') {
          try {
            locationFromMap = JSON.parse(locationFromMap);
          } catch {
            locationFromMap = null;
          }
        }
        
        let coordinates = null;
        if (locationFromMap && typeof locationFromMap.lat === 'number' && typeof locationFromMap.lng === 'number') {
          coordinates = { lat: locationFromMap.lat, lng: locationFromMap.lng };
        }
        
        return {
          id: item.id,
          title: item.property_details || '',
          titleBn: '',
          description: item.location_details || '',
          descriptionBn: '',
          price: item.price || 0,
          currency: 'BDT',
          type: (item.property_type || item.type || 'apartment'),
          bedrooms: item.bedroom || 0,
          bathrooms: item.bathroom || 0,
          area: item.area_sqft || 0,
          images: Array.isArray(item.pictures) ? item.pictures.map((src, idx) => ({ 
            id: `${item.id}-img${idx}`, 
            src, 
            alt: '', 
            altBn: '', 
            priority: idx === 0 
          })) : [],
          location: {
            address: '',
            addressBn: '',
            division: item.address_division || '',
            district: item.address_district || '',
            thana: item.address_thana || '',
            city: item.address_district || '',
            area: item.address_area || '',
            areaBn: '',
            coordinates: coordinates
          },
          amenities: item.amenities || [],
          amenitiesBn: item.amenities_bn || [],
          landlord: {
            id: item.owner_id || item.contact_user_id || item.id || '',
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
      set({ myProperties: mapped });
    } else {
      set({ myProperties: [] });
    }
  },

  addProperty: (property) => {
    set((state) => ({
      properties: [...state.properties, property],
    }));
  },

  updateProperty: (id, updates) => {
    set((state) => ({
      properties: state.properties.map((prop) =>
        prop.id === id ? { ...prop, ...updates } : prop
      ),
    }));
  },

  removeProperty: (id) => {
    set((state) => ({
      properties: state.properties.filter((prop) => prop.id !== id),
    }));
  },

  getProperty: (id) => {
    return get().properties.find((prop) => prop.id === id);
  },

  getPropertiesByLocation: (lat, lng, radius = 5) => {
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
  },
}));

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
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