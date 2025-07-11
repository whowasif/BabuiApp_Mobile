import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

const initialState = {
  properties: [],
};

export const usePropertyStore = create((set, get) => ({
  ...initialState,

  fetchProperties: async () => {
    const { data, error } = await supabase.from('properties').select('*');
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
        return {
          id: item.id,
          title: item.property_details || '',
          price: item.price || 0,
          images: Array.isArray(item.pictures) ? item.pictures.map((src, idx) => ({ id: `${item.id}-img${idx}`, src })) : [],
          location: {
            area: item.address_area || '',
            city: item.address_district || '',
            coordinates: (locationFromMap && locationFromMap.lat && locationFromMap.lng)
              ? { lat: parseFloat(locationFromMap.lat), lng: parseFloat(locationFromMap.lng) }
              : { lat: 0, lng: 0 },
          },
        };
      });
      set({ properties: mapped });
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
})); 