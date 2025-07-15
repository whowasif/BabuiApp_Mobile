import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Image } from 'react-native';
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

  const user = useAuthStore(state => state.user);
  useEffect(() => {
    if (!user) {
      navigation.replace('SignIn');
    }
  }, [user]);

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

  const handleSubmit = () => {
    // Placeholder for submit logic
    alert('Property submitted!');
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

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <LinearGradient colors={["#FF9800", "#FFB300"]} style={{ paddingTop: 48, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <Text style={styles.header}>Add New Property</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>Step {step} of {totalSteps}</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.typeRow}>
              {propertyTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, propertyType === type && styles.typeBtnActive]}
                  onPress={() => setPropertyType(type)}
                >
                  <Text style={propertyType === type ? styles.typeBtnTextActive : styles.typeBtnText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.navBtn, step === 1 && styles.navBtnDisabled]}
                onPress={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <Text style={step === 1 ? styles.navBtnTextDisabled : styles.navBtnText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => setStep(2)}
              >
                <Text style={styles.navBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
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
                <Text style={styles.label}>Property Location (Input from Map)</Text>
                <View style={[styles.input, { height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }]}> 
                  <Text style={{ color: '#757575' }}>[Map Picker Placeholder]</Text>
                </View>
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
    height: 8,
    backgroundColor: '#FFE0B2',
    borderRadius: 4,
    marginHorizontal: 32,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  stepText: {
    color: '#FFF8E1',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
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
}); 