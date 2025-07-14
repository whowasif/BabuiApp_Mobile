# Map-Based Location Selection and Property Display

## Overview

This feature allows users to:
1. **Select property locations on a map** when adding new properties
2. **View all properties on the homepage map** with interactive markers
3. **Click on map markers** to view property details
4. **Hover over markers** to see property information tooltips

## How It Works

### 1. Adding Properties with Map Location Selection

When adding a new property:

1. **Navigate to Add Property page** (`/add-property`)
2. **Fill in basic property details** (title, type, price, etc.)
3. **Use the Location Picker** - A map component that allows you to:
   - Click anywhere on the map to select a location
   - Search for specific addresses using the search bar
   - Get reverse geocoded address information
   - See the selected location marked with a red circle
4. **Complete the form** and submit
5. **The property is automatically added** to the property store and will appear on the homepage map

### 2. Viewing Properties on Homepage Map

On the homepage:

1. **Switch to Map View** using the toggle button
2. **See all properties** displayed as colored markers:
   - **Blue**: Apartments
   - **Amber**: Rooms  
   - **Red**: Offices
   - **Orange**: Shops
   - **Gray**: Parking
3. **Hover over markers** to see property tooltips with:
   - Property image
   - Title and location
   - Price
   - Bedrooms, bathrooms, and area
4. **Click on markers** to select properties (highlights in grid view)
5. **View property legend** showing marker color meanings

## Technical Implementation

### Components

- **`LocationPicker.tsx`**: Map component for selecting property locations
- **`PropertiesMap.tsx`**: Map component for displaying all properties
- **`propertyStore.ts`**: Zustand store for managing property data

### Data Flow

1. **Location Selection**: User clicks on map → coordinates captured → reverse geocoding → address retrieved
2. **Property Creation**: Form data + location data → Property object → Added to store
3. **Map Display**: Store properties → Filtered by search criteria → Displayed as markers

### Key Features

- **Real-time location search** using OpenStreetMap Nominatim API
- **Reverse geocoding** to get addresses from coordinates
- **Interactive markers** with hover effects and click handlers
- **Property type color coding** for easy identification
- **Responsive design** that works on mobile and desktop
- **Bilingual support** for Bengali and English

## Usage Examples

### Adding a New Property

```typescript
// 1. User fills form and selects location on map
const location = { lat: 23.7937, lng: 90.4066, address: "Gulshan-1, Dhaka" };

// 2. Property is created with location data
const newProperty = {
  id: "property-123",
  title: "Modern Apartment",
  location: {
    coordinates: { lat: 23.7937, lng: 90.4066 },
    address: "Gulshan-1, Dhaka",
    // ... other location data
  },
  // ... other property data
};

// 3. Property is added to store
addProperty(newProperty);
```

### Displaying Properties on Map

```typescript
// Properties are automatically displayed on homepage map
<PropertiesMap 
  properties={filteredProperties}
  onPropertyClick={handlePropertySelect}
  selectedPropertyId={selectedProperty}
/>
```

## Benefits

- **Accurate location data**: Users can precisely select property locations
- **Visual property discovery**: Users can see properties geographically
- **Interactive experience**: Click and hover interactions make exploration easy
- **Real-time updates**: New properties appear on map immediately
- **Mobile-friendly**: Works well on touch devices

## Future Enhancements

- **Cluster markers** for areas with many properties
- **Distance-based filtering** (show properties within X km)
- **Route planning** to properties
- **Street view integration**
- **Property photos in map popups**
- **Advanced filtering** by property type on map 