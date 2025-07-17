import React, { useRef, useState } from 'react';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { View, StyleSheet, Dimensions, TextInput, TouchableOpacity, Text, Platform, FlatList } from 'react-native';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window');

// Add travel mode icons
const travelModes = [
  { key: 'driving-car', icon: '🚗', label: 'Car' },
  { key: 'cycling-regular', icon: '🚲', label: 'Bike' },
  { key: 'foot-walking', icon: '🚶', label: 'Walk' },
  { key: 'driving-hgv', icon: '🚌', label: 'Transit' }, // OpenRouteService doesn't have transit, but we can use HGV as a placeholder
];

// Debounce utility
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default function NativePropertiesMap({ properties, onSelect, selectedPropertyId, initialRegion, setViewMode }) {
  const mapRef = useRef(null);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  // Directions feature state
  const [origin, setOrigin] = useState(null); // { latitude, longitude }
  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  // Autocomplete state
  const [originQuery, setOriginQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [travelMode, setTravelMode] = useState('driving-car');
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }
  const [showDirections, setShowDirections] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const originDebounceRef = useRef();
  const destinationDebounceRef = useRef();

  // Search for a place using Nominatim
  const handleSearch = async () => {
    if (!search) return;
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BabuiApp/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      } else {
        alert('Place not found!');
      }
    } catch (e) {
      console.error('Search error:', e);
      alert('Search error: ' + e.message);
    }
    setSearching(false);
  };

  // Go to current location
  const goToCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    mapRef.current.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  // Debounced fetchSuggestions (increase delay to 1200ms)
  const debouncedFetchOrigin = debounce((text) => {
    console.log('[Origin] fetchSuggestions called with:', text);
    fetchSuggestions(text, setOriginSuggestions, true);
  }, 1200);
  const debouncedFetchDestination = debounce((text) => {
    console.log('[Destination] fetchSuggestions called with:', text);
    fetchSuggestions(text, setDestinationSuggestions, false);
  }, 1200);

  // Debounced fetch for search bar autocomplete
  const searchDebounceRef = useRef();
  const debouncedFetchSearchSuggestions = (query) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`, {
          headers: { 'User-Agent': 'BabuiApp/1.0' },
        });
        const data = await res.json();
        setSearchSuggestions(data);
      } catch (e) {
        setSearchSuggestions([]);
      }
      setSearchLoading(false);
    }, 800);
  };

  // Center map on selected suggestion
  const handleSearchSuggestionPress = (item) => {
    if (mapRef.current && item && item.lat && item.lon) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
    setSearch(item.display_name);
    setSearchSuggestions([]);
  };

  // Fetch suggestions from Nominatim, with 'Your location' as first option
  const fetchSuggestions = async (query, setSuggestions, isOrigin) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    console.log('[fetchSuggestions] Query:', query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'BabuiApp/1.0 (your@email.com)',
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      console.log('[fetchSuggestions] Data:', data);
      // Add 'Your location' as the first suggestion
      setSuggestions([
        { place_id: 'your-location', display_name: 'Your location', isCurrentLocation: true },
        ...data
      ]);
      console.log('[fetchSuggestions] Suggestions set:', [
        { place_id: 'your-location', display_name: 'Your location', isCurrentLocation: true },
        ...data
      ]);
    } catch (e) {
      console.log('[fetchSuggestions] Error:', e);
      setSuggestions([]);
    }
  };

  // Fetch directions from OpenRouteService
  const fetchDirections = async () => {
    if (!origin || !destination) return;
    const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjBlZjRhNmZjYWU4YjQ2ODg5MjE0ZDJmODMwOTY3NjdhIiwiaCI6Im11cm11cjY0In0=';
    const url = `https://api.openrouteservice.org/v2/directions/${travelMode}?api_key=${apiKey}&start=${origin.longitude},${origin.latitude}&end=${destination.longitude},${destination.latitude}`;
    console.log('[fetchDirections] origin:', origin);
    console.log('[fetchDirections] destination:', destination);
    console.log('[fetchDirections] travelMode:', travelMode);
    console.log('[fetchDirections] url:', url);
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log('[fetchDirections] response:', data);
      if (data && data.features && data.features.length > 0) {
        const route = data.features[0].geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(route);
        // Extract distance (meters) and duration (seconds)
        const summary = data.features[0].properties.summary;
        setRouteInfo({
          distance: summary.distance, // meters
          duration: summary.duration, // seconds
        });
        if (mapRef.current && route.length > 1) {
          mapRef.current.fitToCoordinates(route, { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true });
        }
      } else {
        setRouteInfo(null);
        let errorMsg = 'No route found!';
        if (data && data.error && data.error.message) {
          errorMsg = data.error.message;
        }
        alert(errorMsg);
      }
    } catch (e) {
      setRouteInfo(null);
      alert('Directions error: ' + e.message);
    }
  };

  // Swap origin and destination
  const swapPoints = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setOriginQuery(destinationQuery);
    setDestinationQuery(originQuery);
    setRouteCoords([]);
  };

  return (
    <View style={styles.container}>
      {/* Toggle between search bar and directions card */}
      {!showDirections ? (
        <View style={{ margin: 8, marginTop: 32, backgroundColor: '#fff', borderRadius: 16, padding: 12, zIndex: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
          <View style={{ flex: 1, position: 'relative' }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, backgroundColor: '#f7f7f7', fontSize: 16 }}
              placeholder="Search place..."
              value={search}
              onChangeText={text => {
                setSearch(text);
                debouncedFetchSearchSuggestions(text);
              }}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity style={{ position: 'absolute', right: 12, top: 0, padding: 8 }} onPress={() => { setSearch(''); setSearchSuggestions([]); }}>
                <Text style={{ fontSize: 22, color: '#888' }}>✕</Text>
              </TouchableOpacity>
            )}
            {searchSuggestions.length > 0 && (
              <FlatList
                data={searchSuggestions}
                keyExtractor={item => item.place_id.toString()}
                style={{ maxHeight: 120, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginTop: 2, position: 'absolute', width: '100%', zIndex: 30 }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSearchSuggestionPress(item)} style={{ padding: 10 }}>
                    <Text>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
          <TouchableOpacity style={{ marginLeft: 8, padding: 8 }} onPress={() => setShowDirections(true)}>
            <Text style={{ fontSize: 22 }}>🧭</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ margin: 8, marginTop: 32, backgroundColor: '#fff', borderRadius: 16, padding: 12, zIndex: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}>
          {/* Top right toggle button */}
          <TouchableOpacity style={{ position: 'absolute', right: 12, top: 60, zIndex: 21, padding: 8 }} onPress={() => setShowDirections(false)}>
            <Text style={{ fontSize: 22 }}>🔍</Text>
          </TouchableOpacity>
          {/* Inputs and swap */}
          <View style={{ marginBottom: 8 }}>
            {/* Origin input */}
            <View style={{ marginBottom: 8 }}>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, backgroundColor: '#f7f7f7', fontSize: 16 }}
                placeholder="Your location"
                value={originQuery}
                onChangeText={text => {
                  setOriginQuery(text);
                  debouncedFetchOrigin(text);
                }}
              />
              {/* Use my location button */}
              <TouchableOpacity
                style={{ position: 'absolute', right: 40, top: 0, zIndex: 11, padding: 8 }}
                onPress={async () => {
                  setOriginLoading(true);
                  let { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    alert('Permission to access location was denied');
                    setOriginLoading(false);
                    return;
                  }
                  let location = await Location.getCurrentPositionAsync({});
                  setOrigin({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                  setOriginQuery('Your location');
                  setOriginSuggestions([]);
                  setOriginLoading(false);
                }}
              >
                <Text style={{ fontSize: 22 }}>📍</Text>
              </TouchableOpacity>
              {originQuery.length > 0 && (
                <TouchableOpacity style={{ position: 'absolute', right: 12, top: 0, padding: 8 }} onPress={() => { setOriginQuery(''); setOrigin(null); setOriginSuggestions([]); }}>
                  <Text style={{ fontSize: 22, color: '#888' }}>✕</Text>
                </TouchableOpacity>
              )}
              {originSuggestions.length > 0 && (
                <FlatList
                  data={originSuggestions}
                  keyExtractor={item => item.place_id.toString()}
                  style={{ maxHeight: 120, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginTop: 2, position: 'absolute', width: '100%', zIndex: 10 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={async () => {
                        if (item.isCurrentLocation) {
                          setOriginLoading(true);
                          let { status } = await Location.requestForegroundPermissionsAsync();
                          if (status !== 'granted') {
                            alert('Permission to access location was denied');
                            setOriginLoading(false);
                            return;
                          }
                          let location = await Location.getCurrentPositionAsync({});
                          setOrigin({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                          setOriginQuery('Your location');
                          setOriginSuggestions([]);
                          setOriginLoading(false);
                        } else {
                          const coords = {
                            latitude: parseFloat(item.lat),
                            longitude: parseFloat(item.lon),
                          };
                          setOrigin(coords);
                          setOriginQuery(item.display_name);
                          setOriginSuggestions([]);
                        }
                      }}
                      style={{ padding: 10 }}
                    >
                      <Text>{item.display_name}{item.isCurrentLocation && originLoading ? ' (Loading...)' : ''}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
            {/* Swap button centered */}
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity onPress={swapPoints} style={{ padding: 8, backgroundColor: '#f7f7f7', borderRadius: 24 }}>
                <Text style={{ fontSize: 20 }}>⇅</Text>
              </TouchableOpacity>
            </View>
            {/* Destination input */}
            <View>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, backgroundColor: '#f7f7f7', fontSize: 16 }}
                placeholder="Choose destination"
                value={destinationQuery}
                onChangeText={text => {
                  setDestinationQuery(text);
                  debouncedFetchDestination(text);
                }}
              />
              {/* Use my location button for destination */}
              <TouchableOpacity
                style={{ position: 'absolute', right: 40, top: 0, zIndex: 11, padding: 8 }}
                onPress={async () => {
                  setDestinationLoading(true);
                  let { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    alert('Permission to access location was denied');
                    setDestinationLoading(false);
                    return;
                  }
                  let location = await Location.getCurrentPositionAsync({});
                  setDestination({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                  setDestinationQuery('Your location');
                  setDestinationSuggestions([]);
                  setDestinationLoading(false);
                }}
              >
                <Text style={{ fontSize: 22 }}>📍</Text>
              </TouchableOpacity>
              {destinationQuery.length > 0 && (
                <TouchableOpacity style={{ position: 'absolute', right: 12, top: 0, padding: 8 }} onPress={() => { setDestinationQuery(''); setDestination(null); setDestinationSuggestions([]); }}>
                  <Text style={{ fontSize: 22, color: '#888' }}>✕</Text>
                </TouchableOpacity>
              )}
              {destinationSuggestions.length > 0 && (
                <FlatList
                  data={destinationSuggestions}
                  keyExtractor={item => item.place_id.toString()}
                  style={{ maxHeight: 120, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginTop: 2, position: 'absolute', width: '100%', zIndex: 10 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={async () => {
                        if (item.isCurrentLocation) {
                          setDestinationLoading(true);
                          let { status } = await Location.requestForegroundPermissionsAsync();
                          if (status !== 'granted') {
                            alert('Permission to access location was denied');
                            setDestinationLoading(false);
                            return;
                          }
                          let location = await Location.getCurrentPositionAsync({});
                          setDestination({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                          setDestinationQuery('Your location');
                          setDestinationSuggestions([]);
                          setDestinationLoading(false);
                        } else {
                          const coords = {
                            latitude: parseFloat(item.lat),
                            longitude: parseFloat(item.lon),
                          };
                          setDestination(coords);
                          setDestinationQuery(item.display_name);
                          setDestinationSuggestions([]);
                        }
                      }}
                      style={{ padding: 10 }}
                    >
                      <Text>{item.display_name}{item.isCurrentLocation && destinationLoading ? ' (Loading...)' : ''}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
          {/* Travel mode selector */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
            {travelModes.map(mode => (
              <TouchableOpacity
                key={mode.key}
                style={{
                  backgroundColor: travelMode === mode.key ? '#FF9800' : '#f7f7f7',
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginHorizontal: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setTravelMode(mode.key)}
              >
                <Text style={{ fontSize: 18 }}>{mode.icon}</Text>
                <Text style={{ marginLeft: 6, color: travelMode === mode.key ? '#fff' : '#888', fontWeight: 'bold' }}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={{ backgroundColor: '#4CAF50', borderRadius: 8, padding: 12, alignSelf: 'center', marginTop: 4 }} onPress={fetchDirections} disabled={!origin || !destination}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Route</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        loadingEnabled={true}
        mapType="standard"
      >
        {properties.map(property => (
          property.location?.coordinates ? (
            <Marker
              key={property.id}
              coordinate={{
                latitude: property.location.coordinates.lat,
                longitude: property.location.coordinates.lng,
              }}
              pinColor={selectedPropertyId === property.id ? '#FF9800' : '#4CAF50'}
              onPress={() => onSelect && onSelect(property.id)}
              title={property.title}
              description={property.location?.address || ''}
            />
          ) : null
        ))}
        {/* Directions Markers */}
        {origin ? <Marker coordinate={origin} pinColor="#2196F3" title="Origin" /> : null}
        {destination ? <Marker coordinate={destination} pinColor="#E91E63" title="Destination" /> : null}
        {/* Directions Polyline */}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#2196F3" />
        )}
      </MapView>
      {/* Grid View Button (move to grid view) */}
      {setViewMode && (
        <TouchableOpacity style={styles.gridViewBtn} onPress={() => setViewMode('grid')}>
          <Text style={styles.gridViewIcon}>▦</Text>
        </TouchableOpacity>
      )}
      {/* Current Location Button */}
      <TouchableOpacity style={styles.currentLocationBtn} onPress={goToCurrentLocation}>
        <Text style={styles.currentLocationIcon}>📍</Text>
      </TouchableOpacity>
      {/* In render, show route info card below the directions card */}
      {routeInfo && (
        <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}>
          {/* Travel mode icon */}
          <Text style={{ fontSize: 22, marginRight: 10 }}>
            {travelModes.find(m => m.key === travelMode)?.icon || '🚗'}
          </Text>
          {/* Distance and duration */}
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 12 }}>
            {routeInfo.distance >= 1000
              ? `${(routeInfo.distance / 1000).toFixed(1)} km`
              : `${Math.round(routeInfo.distance)} m`}
          </Text>
          <Text style={{ fontSize: 16, color: '#666' }}>
            {routeInfo.duration >= 3600
              ? `${Math.floor(routeInfo.duration / 3600)}h ${Math.round((routeInfo.duration % 3600) / 60)}m`
              : `${Math.round(routeInfo.duration / 60)} min`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  map: {
    flex: 1,
    width: '100%',
    height: height * 0.5,
  },
  searchBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60, // moved lower
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  gridViewBtn: {
    position: 'absolute',
    bottom: 88, // 48px button + 16px gap above current location button
    right: 24,
    zIndex: 11,
    backgroundColor: '#FF9800',
    borderRadius: 12, // rectangle with slightly rounded corners
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  gridViewIcon: {
    fontSize: 24,
    color: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#FFF3E0',
    marginRight: 8,
  },
  searchBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  currentLocationBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  currentLocationIcon: {
    fontSize: 26,
    color: '#FF9800',
  },
}); 