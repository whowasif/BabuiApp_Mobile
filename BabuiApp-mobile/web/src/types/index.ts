export interface Property {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  price: number;
  currency: 'BDT';
  type: 'apartment' | 'house' | 'room' | 'studio' | 'family' | 'bachelor' | 'office' | 'sublet' | 'hostel' | 'shop' | 'parking';
  bedrooms: number;
  bathrooms: number;
  area: number; // in square feet
  images: PropertyImage[];
  location: PropertyLocation;
  amenities: string[];
  amenitiesBn: string[];
  landlord: Landlord;
  available: boolean;
  availableFrom: Date;
  createdAt: Date;
  updatedAt: Date;
  genderPreference?: 'male' | 'female' | 'family' | 'any';
  furnishing?: 'furnished' | 'semi-furnished' | 'unfurnished';
  parking?: boolean;
}

export interface PropertyImage {
  id: string;
  src: string;
  alt: string;
  altBn: string;
  priority: boolean;
  webpSrc?: string;
}

export interface PropertyLocation {
  address: string;
  addressBn: string;
  city: string;
  area: string;
  areaBn: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  nearbyPlaces: string[];
  nearbyPlacesBn: string[];
  division?: string;
  district?: string;
  thana?: string;
}

export interface Landlord {
  id: string;
  name: string;
  nameBn: string;
  phone: string;
  email?: string;
  rating: number;
  verified: boolean;
}

export interface SearchFilters {
  propertyId?: string;
  division?: string;
  district?: string;
  thana?: string;
  area?: string;
  city?: string; // Legacy compatibility
  type?: Property['type'];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  genderPreference?: 'male' | 'female' | 'family' | 'any';
  furnishing?: 'furnished' | 'semi-furnished' | 'unfurnished' | 'any';
  availability?: 'immediate' | 'within-week' | 'within-month' | 'any';
  parking?: 'required' | 'not-required' | 'any';
  priority?: 'family' | 'bachelor' | 'sublet';
}

export interface User {
  id: string;
  name: string;
  nameBn: string;
  email: string;
  phone: string;
  preferredLanguage: 'bn' | 'en';
  favorites: string[];
}

export type Language = 'bn' | 'en';

export interface PaymentMethod {
  type: 'bkash' | 'nagad' | 'rocket' | 'bank';
  accountNumber: string;
  accountName: string;
}