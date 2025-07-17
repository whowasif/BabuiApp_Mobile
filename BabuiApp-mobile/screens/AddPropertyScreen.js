import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Image, ActivityIndicator, Animated, RefreshControl } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import divisionsData from '../data/bd-geocode/divisions.json';
import districtsRaw from '../data/bd-geocode/districts.json';
import upazilasData from '../data/bd-geocode/upazilas.json';
import areasData from '../data/bd-geocode/area.json';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict, getAreasByUpazilaId, extractData } from '../utils/bangladeshLocationUtils';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../utils/supabaseClient';

const propertyTypes = ['Apartment', 'Room', 'Office', 'Shop', 'Parking'];
const amenitiesList = ['Air Conditioning', 'Parking', 'Security', 'Elevator', 'Gas Connection', 'Generator', 'CCTV', 'Gym'];

export default function AddPropertyScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const [propertyType, setPropertyType] = useState('Apartment');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [floor, setFloor] = useState('Ground');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [area, setArea] = useState('');
  const [genderPreference, setGenderPreference] = useState('Any');
  const [priority, setPriority] = useState('');
  const [furnish, setFurnish] = useState(false);
  const [availability, setAvailability] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [areaName, setAreaName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [balcony, setBalcony] = useState('0');
  const [balconyYesNo, setBalconyYesNo] = useState('No');
  const [roomQuantity, setRoomQuantity] = useState('1');
  const [bathroomYesNo, setBathroomYesNo] = useState('No');
  const [parkingType, setParkingType] = useState('Bike');
  const [quantity, setQuantity] = useState('1');
  const [mapLocation, setMapLocation] = useState(null);
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const mapRef = useRef(null);
  const searchDebounceRef = useRef();
  const [refreshing, setRefreshing] = useState(false);

  const user = useAuthStore(state => state.user);
  const addMyProperty = useAuthStore(state => state.addMyProperty);
  const guestMode = useAuthStore(state => state.guestMode);
  
  useEffect(() => {
    if (!user && !guestMode) {
      navigation.replace('SignIn');
    }
  }, [user, guestMode, navigation]);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (step === 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [step]);

  const handlePropertyTypePress = (type) => {
    setPropertyType(type);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Filtered options
  const divisionOptions = extractData(divisionsData) || [];
  console.log('divisionOptions:', divisionOptions);
  const districts = extractData(districtsRaw) || [];
  console.log('DEBUG districtsRaw:', districtsRaw);
  console.log('DEBUG extractData(districtsRaw):', extractData(districtsRaw));
  const districtOptions = division ? getDistrictsByDivision(division, districts) : [];
  const upazilas = extractData(upazilasData) || [];
  const thanaOptions = district ? getUpazilasByDistrict(district, upazilas) : [];
  const areaOptions = thana ? getAreasByUpazilaId(thana) : [];
  console.log('DEBUG upazilas:', upazilas);
  console.log('DEBUG thanaOptions:', thanaOptions);

  // Debug logs
  console.log('Selected division:', division);
  console.log('District options:', districtOptions);

  const floorOptions = [
    'Ground',
    '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '19th'
  ];

  const handleAmenityToggle = (amenity) => {
    setAmenities((prev) => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
  };

  const handleImagePick = async () => {
    if (images.length >= 10) {
      alert('You can upload a maximum of 10 images.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7 });
    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      const total = images.length + newUris.length;
      if (total > 10) {
        alert('You can upload a maximum of 10 images.');
        setImages([...images, ...newUris.slice(0, 10 - images.length)]);
      } else {
        setImages([...images, ...newUris]);
      }
    }
  };

  const handleCameraPick = async () => {
    if (images.length >= 10) {
      alert('You can upload a maximum of 10 images.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map(a => a.uri)].slice(0, 10));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!price || !contactName || !contactNumber) {
        alert('Please fill in all required fields (Price, Contact Name, Contact Number)');
        return;
      }

      // Prepare property data
      const propertyData = {
        property_type: propertyType,
        address_division: division,
        address_district: district,
        address_thana: thana,
        address_area: areaName,
        location_details: location,
        price: parseFloat(price),
        price_negotiability: negotiable,
        type: propertyType.toLowerCase(),
        floor: floor === 'Ground' ? 0 : parseInt(floor),
        room_quantity: parseInt(roomQuantity),
        bedroom: parseInt(bedrooms),
        balcony: balcony,
        bathroom: bathroomYesNo,
        gender_preference: genderPreference,
        priority: priority,
        area_sqft: parseFloat(area),
        furnish: furnish ? 'furnished' : 'unfurnished',
        availability: availability || 'immediate',
        amenities: amenities,
        property_details: description,
        pictures: images,
        contact_name: contactName,
        contact_phone: contactNumber,
        contact_email: email,
        location_from_map: mapLocation,
        owner_id: user.id,
      };

      // Insert property into database
      const { data: property, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting property:', error);
        alert('Failed to submit property. Please try again.');
        return;
      }

      // Add property to user's myproperties
      const success = await addMyProperty(property.id);
      if (!success) {
        console.error('Failed to add property to myproperties');
      }

      alert('Property submitted successfully!');
      navigation.goBack();
      
    } catch (error) {
      console.error('Error submitting property:', error);
      alert('Failed to submit property. Please try again.');
    }
  };

  const debouncedFetchSearchSuggestions = (query) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setSearchLoading(false);
      setSearchError('');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    console.log('[Autocomplete] Fetching suggestions for:', query);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
          {
            headers: {
              'User-Agent': 'BabuiApp/1.0 (your@email.com)',
              'Accept': 'application/json',
            },
          }
        );
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          console.log('[Autocomplete] API response:', data);
          setSearchSuggestions(data);
          if (!Array.isArray(data) || data.length === 0) {
            setSearchError('No results found.');
          }
        } catch (jsonErr) {
          setSearchSuggestions([]);
          setSearchError('Error: Received invalid response from server.');
          console.error('[Autocomplete] JSON parse error:', jsonErr, text);
        }
      } catch (e) {
        setSearchSuggestions([]);
        setSearchError('Error fetching suggestions: ' + e.message);
        console.error('[Autocomplete] Error:', e);
      }
      setSearchLoading(false);
    }, 600);
  };

  const handleSearchSuggestionPress = (item) => {
    if (mapRef.current && item && item.lat && item.lon) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
      setMapLocation({ latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
    }
    setSearch(item.display_name);
    setSearchSuggestions([]);
  };

  const goToCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
      setMapLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    }
  };

  const propertyTypeFields = {
    Apartment: [
      'address', 'price', 'negotiable', 'floor', 'bedrooms', 'balcony', 'bathrooms', 'genderPreference', 'priority', 'area', 'furnish', 'availability', 'amenities', 'details', 'images', 'contactName', 'contactNumber', 'email', 'mapLocation'
    ],
    Room: [
      'address', 'price', 'negotiable', 'floor', 'roomQuantity', 'balconyYesNo', 'bathroomYesNo', 'genderPreference', 'priority', 'area', 'furnish', 'availability', 'amenities', 'details', 'images', 'contactName', 'contactNumber', 'email', 'mapLocation'
    ],
    Office: [
      'address', 'price', 'negotiable', 'floor', 'roomQuantity', 'bathroomYesNo', 'area', 'furnish', 'availability', 'amenities', 'details', 'images', 'contactName', 'contactNumber', 'email', 'mapLocation'
    ],
    Shop: [
      'address', 'price', 'negotiable', 'floor', 'bathroomYesNo', 'area', 'furnish', 'availability', 'amenities', 'details', 'images', 'contactName', 'contactNumber', 'email', 'mapLocation'
    ],
    Parking: [
      'address', 'price', 'negotiable', 'parkingType', 'quantity', 'furnish', 'availability', 'amenities', 'details', 'images', 'contactName', 'contactNumber', 'email', 'mapLocation'
    ]
  };
  const amenitiesOptions = {
    Apartment: amenitiesList,
    Room: amenitiesList,
    Office: amenitiesList,
    Shop: amenitiesList.filter(a => a !== 'Gym'),
    Parking: ['Security', 'CCTV']
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset form to initial state
      setPropertyType('Apartment');
      setLocation('');
      setPrice('');
      setNegotiable(false);
      setFloor('Ground');
      setBedrooms('1');
      setBathrooms('1');
      setArea('');
      setGenderPreference('Any');
      setPriority('');
      setFurnish(false);
      setAvailability('');
      setAmenities([]);
      setDescription('');
      setImages([]);
      setContactName('');
      setContactNumber('');
      setEmail('');
      setDivision('');
      setDistrict('');
      setThana('');
      setAreaName('');
      setBalcony('0');
      setRoomQuantity('1');
      setBathroomYesNo('No');
      setParkingType('Bike');
      setQuantity('1');
      setMapLocation(null);
      setSearch('');
      setSearchSuggestions([]);
      setSearchLoading(false);
      setSearchError('');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={["#FFF3E0", "#FFE0B2", "#FFCC80"]} 
        style={styles.backgroundGradient}
      >
        <LinearGradient 
          colors={["#FF9800", "#FFB300"]} 
          style={styles.heroSection}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.header}>
              Add New Property{propertyType ? ` - ${propertyType}` : ''}
            </Text>
            <View style={styles.placeholder} />
          </View>
          <MaterialIcons
            name={
              propertyType === 'Apartment' ? 'apartment' :
              propertyType === 'Room' ? 'hotel' :
              propertyType === 'Office' ? 'business-center' :
              propertyType === 'Shop' ? 'storefront' :
              propertyType === 'Parking' ? 'local-parking' :
              'home'
            }
            size={48}
            color="#fff"
            style={{ marginTop: 8, marginBottom: 8 }}
          />
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '50%'],
            }) }]} />
          </View>
          <Text style={styles.stepText}>Step {step} of {totalSteps}</Text>
        </LinearGradient>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF9800"]}
              tintColor="#FF9800"
            />
          }
        >
          {step === 1 && (
            <Animated.View style={[styles.cardModern, { opacity: fadeAnim }]}>
              <Text style={styles.sectionTitleModern}>Basic Information</Text>
              <Text style={styles.labelModern}>Property Type</Text>
              <View style={styles.typeRowModern}>
                {propertyTypes.map(type => (
                  <Animated.View key={type} style={{ transform: [{ scale: propertyType === type ? scaleAnim : 1 }] }}>
                    <TouchableOpacity
                      style={[styles.typeBtnModern, propertyType === type && styles.typeBtnModernActive]}
                      onPress={() => handlePropertyTypePress(type)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons
                        name={
                          type === 'Apartment' ? 'apartment' :
                          type === 'Room' ? 'hotel' :
                          type === 'Office' ? 'business-center' :
                          type === 'Shop' ? 'storefront' :
                          'local-parking'
                        }
                        size={22}
                        color={propertyType === type ? '#fff' : '#FF9800'}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.typeBtnModernText, propertyType === type && styles.typeBtnModernTextActive]}>{type}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              <View style={styles.buttonRowModern}>
                <TouchableOpacity style={[styles.navBtnModern, styles.navBtnModernGhost]} disabled={step === 1}>
                  <Text style={[styles.navBtnModernText, styles.navBtnModernTextGhost]}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtnModern} onPress={() => setStep(2)}>
                  <LinearGradient colors={["#FF9800", "#FFB300"]} style={styles.navBtnModernGradient}>
                    <Text style={styles.navBtnModernText}>Next</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              {/* Address fields (always shown) */}
              <Text style={styles.label}>Division</Text>
              {console.log('RENDER Division Picker. Current division value:', division)}
              {console.log('Division options (length):', divisionOptions.length)}
              {console.log('Division options (full):', divisionOptions)}
              {console.log('Current step:', step)}
              <Picker
                selectedValue={division}
                onValueChange={value => {
                  console.log('Division Picker onValueChange fired. New value:', value);
                  setDivision(value);
                  setDistrict('');
                  setThana('');
                  setAreaName('');
                }}
                style={styles.input}
              >
                <Picker.Item key="select-division" label="Select Division" value="" />
                {divisionOptions.map((div, idx) => (
                  <Picker.Item key={`${div.id}-${idx}`} label={div.name} value={div.id} />
                ))}
              </Picker>
              <Text style={styles.label}>District</Text>
              <Picker
                selectedValue={district}
                onValueChange={value => {
                  setDistrict(value);
                  setThana('');
                  setAreaName('');
                }}
                style={styles.input}
                enabled={!!division}
              >
                <Picker.Item key="select-district" label="Select District" value="" />
                {districtOptions.filter(dist => dist && dist.id && dist.name).map((dist, idx) => (
                  <Picker.Item key={`${dist.id}-${idx}`} label={dist.name} value={dist.id} />
                ))}
              </Picker>
              <Text style={styles.label}>Thana/Upazila</Text>
              <Picker
                selectedValue={thana}
                onValueChange={value => {
                  setThana(value);
                  setAreaName('');
                }}
                style={styles.input}
                enabled={!!district}
              >
                <Picker.Item key="select-thana" label="Select Thana" value="" />
                {thanaOptions.filter(t => t && t.upazila_id && t.name).map((t, idx) => (
                  <Picker.Item key={`${t.upazila_id}-${idx}`} label={t.name} value={t.upazila_id} />
                ))}
              </Picker>
              <Text style={styles.label}>Area</Text>
              <Picker
                selectedValue={areaName}
                onValueChange={setAreaName}
                style={styles.input}
                enabled={!!thana}
              >
                <Picker.Item key="select-area" label="Select Area" value="" />
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
              <Text style={styles.label}>More Details about Location</Text>
              <TextInput style={styles.input} placeholder="E.g. Near main gate, beside mosque, 3rd floor, etc. (optional)" value={location} onChangeText={setLocation} />
              {/* Price */}
              {propertyTypeFields[propertyType].includes('price') && (
                <>
                  <Text style={styles.label}>Price (BDT)</Text>
                  <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={price} onChangeText={setPrice} />
                </>
              )}
              {/* Price Negotiable */}
              {propertyTypeFields[propertyType].includes('negotiable') && (
                <View style={styles.row}><Text style={styles.label}>Price Negotiable?</Text><Switch value={negotiable} onValueChange={setNegotiable} /></View>
              )}
              {/* Floor */}
              {propertyTypeFields[propertyType].includes('floor') && (
                <>
                  <Text style={styles.label}>Floor</Text>
                  <Picker selectedValue={floor} onValueChange={setFloor} style={styles.input}>
                    {floorOptions.map((opt, idx) => (<Picker.Item key={`${opt}-${idx}`} label={opt} value={opt} />))}
                  </Picker>
                </>
              )}
              {/* Bedrooms */}
              {propertyTypeFields[propertyType].includes('bedrooms') && (
                <>
                  <Text style={styles.label}>Bedrooms</Text>
                  <TextInput style={styles.input} placeholder="1" keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />
                </>
              )}
              {/* Balcony */}
              {propertyTypeFields[propertyType].includes('balcony') && (
                <>
                  <Text style={styles.label}>Balcony</Text>
                  <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={balcony} onChangeText={setBalcony} />
                </>
              )}
              {/* Bathrooms */}
              {propertyTypeFields[propertyType].includes('bathrooms') && (
                <>
                  <Text style={styles.label}>Bathrooms</Text>
                  <TextInput style={styles.input} placeholder="1" keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} />
                </>
              )}
              {/* Room Quantity */}
              {propertyTypeFields[propertyType].includes('roomQuantity') && (
                <>
                  <Text style={styles.label}>Room Quantity</Text>
                  <TextInput style={styles.input} placeholder="1" keyboardType="numeric" value={roomQuantity} onChangeText={setRoomQuantity} />
                </>
              )}
              {/* Balcony Yes/No */}
              {propertyTypeFields[propertyType].includes('balconyYesNo') && (
                <>
                  <Text style={styles.label}>Balcony</Text>
                  <Picker selectedValue={balconyYesNo} onValueChange={setBalconyYesNo} style={styles.input}>
                    <Picker.Item key="balcony-yes" label="Yes" value="Yes" />
                    <Picker.Item key="balcony-no" label="No" value="No" />
                  </Picker>
                </>
              )}
              {/* Bathrooms Yes/No */}
              {propertyTypeFields[propertyType].includes('bathroomYesNo') && (
                <>
                  <Text style={styles.label}>Bathrooms</Text>
                  <Picker selectedValue={bathroomYesNo} onValueChange={setBathroomYesNo} style={styles.input}>
                    <Picker.Item key="bathroom-yes" label="Yes" value="Yes" />
                    <Picker.Item key="bathroom-no" label="No" value="No" />
                  </Picker>
                </>
              )}
              {/* Parking Type */}
              {propertyTypeFields[propertyType].includes('parkingType') && (
                <>
                  <Text style={styles.label}>Type</Text>
                  <Picker selectedValue={parkingType} onValueChange={setParkingType} style={styles.input}>
                    <Picker.Item key="parking-bike" label="Bike" value="Bike" />
                    <Picker.Item key="parking-car" label="Car" value="Car" />
                    <Picker.Item key="parking-both" label="Both" value="Both" />
                  </Picker>
                </>
              )}
              {/* Quantity */}
              {propertyTypeFields[propertyType].includes('quantity') && (
                <>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput style={styles.input} placeholder="1" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
                </>
              )}
              {/* Gender Preference */}
              {propertyTypeFields[propertyType].includes('genderPreference') && (
                <>
                  <Text style={styles.label}>Gender Preference</Text>
                  <Picker selectedValue={genderPreference} onValueChange={setGenderPreference} style={styles.input}>
                    <Picker.Item key="gender-any" label="Any" value="Any" />
                    <Picker.Item key="gender-male" label="Male" value="Male" />
                    <Picker.Item key="gender-female" label="Female" value="Female" />
                    <Picker.Item key="gender-family" label="Family" value="Family" />
                  </Picker>
                </>
              )}
              {/* Priority */}
              {propertyTypeFields[propertyType].includes('priority') && (
                <>
                  <Text style={styles.label}>Priority (Family/Bachelor/Sublet)</Text>
                  <Picker selectedValue={priority} onValueChange={setPriority} style={styles.input}>
                    <Picker.Item key="priority-select" label="Select" value="" />
                    <Picker.Item key="priority-family" label="Family" value="Family" />
                    <Picker.Item key="priority-bachelor" label="Bachelor" value="Bachelor" />
                    <Picker.Item key="priority-sublet" label="Sublet" value="Sublet" />
                  </Picker>
                </>
              )}
              {/* Area */}
              {propertyTypeFields[propertyType].includes('area') && (
                <>
                  <Text style={styles.label}>Area (sqft)</Text>
                  <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={area} onChangeText={setArea} />
                </>
              )}
              {/* Furnish */}
              {propertyTypeFields[propertyType].includes('furnish') && (
                <>
                  <Text style={styles.label}>Furnish?</Text>
                  <Picker selectedValue={furnish ? 'Furnished' : 'Unfurnished'} onValueChange={val => setFurnish(val === 'Furnished')} style={styles.input}>
                    <Picker.Item key="furnish-furnished" label="Furnished" value="Furnished" />
                    <Picker.Item key="furnish-unfurnished" label="Unfurnished" value="Unfurnished" />
                  </Picker>
                </>
              )}
              {/* Availability */}
              {propertyTypeFields[propertyType].includes('availability') && (
                <>
                  <Text style={styles.label}>Availability (Date)</Text>
                  <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => setShowDatePicker(true)}>
                    <Text>{availability ? new Date(availability).toLocaleDateString() : 'Select Date'}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={availability ? new Date(availability) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setAvailability(date.toISOString());
                      }}
                    />
                  )}
                </>
              )}
              {/* Amenities */}
              {propertyTypeFields[propertyType].includes('amenities') && (
                <>
                  <Text style={styles.label}>Amenities</Text>
                  <View style={styles.amenitiesRow}>
                    {amenitiesOptions[propertyType].map(amenity => (
                      <TouchableOpacity
                        key={amenity}
                        style={[styles.amenityBtn, amenities.includes(amenity) && styles.amenityBtnActive]}
                        onPress={() => handleAmenityToggle(amenity)}
                      >
                        <Text style={amenities.includes(amenity) ? styles.amenityTextActive : styles.amenityText}>{amenity}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              {/* More Details about property */}
              {propertyTypeFields[propertyType].includes('details') && (
                <>
                  <Text style={styles.label}>More Details about property</Text>
                  <TextInput style={[styles.input, { height: 60 }]} placeholder="Describe your property..." value={description} onChangeText={setDescription} multiline />
                </>
              )}
              {/* Upload Images */}
              {propertyTypeFields[propertyType].includes('images') && (
                <>
                  <Text style={styles.label}>Upload Images (Max 10)</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    <TouchableOpacity style={styles.imageUploadBtn} onPress={handleImagePick}>
                      <Text style={styles.imageUploadBtnText}>Choose Images</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imageUploadBtn} onPress={handleCameraPick}>
                      <MaterialIcons name="photo-camera" size={20} color="#FF9800" />
                      <Text style={styles.imageUploadBtnText}>Camera</Text>
                    </TouchableOpacity>
                  </View>
                  {images.length > 0 && (
                    <ScrollView horizontal style={{ marginBottom: 16 }}>
                      {images.map((uri, idx) => (
                        <View key={uri} style={{ position: 'relative', marginRight: 8 }}>
                          <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                          <TouchableOpacity
                            style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12, padding: 2, elevation: 2 }}
                            onPress={() => setImages(images.filter((_, i) => i !== idx))}
                          >
                            <MaterialIcons name="close" size={18} color="#FF9800" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  <Text style={styles.selectedImages}>{images.length} image(s) selected</Text>
                </>
              )}
              {/* Contact Name */}
              {propertyTypeFields[propertyType].includes('contactName') && (
                <>
                  <Text style={styles.label}>Contact Name</Text>
                  <TextInput style={styles.input} placeholder="John Doe" value={contactName} onChangeText={setContactName} />
                </>
              )}
              {/* Contact Number */}
              {propertyTypeFields[propertyType].includes('contactNumber') && (
                <>
                  <Text style={styles.label}>Contact Number</Text>
                  <TextInput style={styles.input} placeholder="+880..." value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
                </>
              )}
              {/* Email Address */}
              {propertyTypeFields[propertyType].includes('email') && (
                <>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput style={styles.input} placeholder="email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
                </>
              )}
              {/* Property Location (Input from Map) */}
              {propertyTypeFields[propertyType].includes('mapLocation') && (
                <>
                  <Text style={styles.label}>Property Location (Pick on Map)</Text>
                  <View style={{ height: 500, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                    {/* Floating Search Bar */}
                    <View style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10 }}>
                      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }}>
                        <TextInput
                          style={{ flex: 1, fontSize: 16, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4, backgroundColor: '#FFF3E0', marginRight: 8 }}
                          placeholder="Search place..."
                          value={search}
                          onChangeText={text => {
                            setSearch(text);
                            debouncedFetchSearchSuggestions(text);
                          }}
                          onSubmitEditing={() => debouncedFetchSearchSuggestions(search)}
                        />
                        {search.length > 0 && (
                          <TouchableOpacity onPress={() => { setSearch(''); setSearchSuggestions([]); setMapLocation(null); }} style={{ marginLeft: 4 }}>
                            <Text style={{ fontSize: 18, color: '#FF9800' }}>✕</Text>
                          </TouchableOpacity>
                        )}
                        {searchLoading && <ActivityIndicator size="small" color="#FF9800" style={{ marginLeft: 8 }} />}
                      </View>
                      {searchError ? (
                        <Text style={{ color: 'red', marginTop: 4 }}>{searchError}</Text>
                      ) : null}
                      {searchSuggestions.length > 0 && (
                        <View style={{ backgroundColor: '#fff', borderRadius: 8, marginTop: 2, maxHeight: 180, elevation: 6 }}>
                          {searchSuggestions.map((item, idx) => (
                            <TouchableOpacity key={item.place_id || idx} onPress={() => handleSearchSuggestionPress(item)} style={{ padding: 10 }}>
                              <Text>{item.display_name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    <MapView
                      ref={mapRef}
                      style={{ flex: 1 }}
                      initialRegion={{
                        latitude: mapLocation?.latitude || 23.685,
                        longitude: mapLocation?.longitude || 90.3563,
                        latitudeDelta: 0.2,
                        longitudeDelta: 0.2,
                      }}
                      onPress={e => setMapLocation(e.nativeEvent.coordinate)}
                    >
                      {mapLocation && (
                        <Marker
                          coordinate={mapLocation}
                          draggable
                          onDragEnd={e => setMapLocation(e.nativeEvent.coordinate)}
                        />
                      )}
                    </MapView>
                    {/* Current Location Button */}
                    <TouchableOpacity style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 10, backgroundColor: '#fff', borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FF9800', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, elevation: 8 }} onPress={goToCurrentLocation}>
                      <Text style={{ fontSize: 26, color: '#FF9800' }}>📍</Text>
                    </TouchableOpacity>
                  </View>
                  {mapLocation && (
                    <Text style={{ color: '#757575', marginBottom: 8 }}>
                      Selected: {mapLocation.latitude.toFixed(5)}, {mapLocation.longitude.toFixed(5)}
                    </Text>
                  )}
                </>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.navBtnText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={handleSubmit}
                >
                  <Text style={styles.navBtnText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
        {user && <BottomNav navigation={navigation} active="AddProperty" />}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#FFE0B2',
    borderRadius: 10,
    marginHorizontal: 32,
    marginBottom: 18,
    overflow: 'hidden',
  },
  progressBar: {
    height: 20,
    backgroundColor: 'linear-gradient(90deg, #FF9800 60%, #FFB300 100%)',
    borderRadius: 10,
  },
  stepText: {
    color: '#FFF8E1',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 16,
  },
  label: {
    color: '#757575',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  typeBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  typeBtnActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  typeBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FFECB3',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  navBtnDisabled: {
    backgroundColor: '#FFE0B2',
  },
  navBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  navBtnTextDisabled: {
    color: '#BDBDBD',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  amenityBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  amenityBtnActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  amenityText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  amenityTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageUploadBtn: {
    backgroundColor: '#FFECB3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  imageUploadBtnText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  selectedImages: {
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Modern styles:
  cardModern: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 32,
    margin: 16,
    padding: 40,
    shadowColor: '#FF9800',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
  },
  sectionTitleModern: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  labelModern: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 20,
    alignSelf: 'flex-start',
  },
  typeRowModern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 48,
    justifyContent: 'center',
  },
  typeBtnModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 32,
    margin: 10,
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    minWidth: 140,
  },
  typeBtnModernActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
    shadowOpacity: 0.22,
  },
  typeBtnModernText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 20,
  },
  typeBtnModernTextActive: {
    color: '#fff',
  },
  buttonRowModern: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 48,
    gap: 24,
  },
  navBtnModern: {
    borderRadius: 32,
    overflow: 'hidden',
    minWidth: 150,
    marginHorizontal: 12,
  },
  navBtnModernGradient: {
    paddingVertical: 18,
    paddingHorizontal: 0,
    alignItems: 'center',
    borderRadius: 32,
  },
  navBtnModernText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  navBtnModernGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  navBtnModernTextGhost: {
    color: '#FF9800',
  },
  heroSection: {
    paddingTop: 32,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
}); 