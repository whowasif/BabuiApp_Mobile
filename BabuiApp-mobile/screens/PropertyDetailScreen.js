import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { usePropertyStore } from '../stores/propertyStore';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

export default function PropertyDetailScreen({ navigation, route }) {
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { propertyId } = route.params || {};
  const getProperty = usePropertyStore(state => state.getProperty);
  const createChat = useChatStore(state => state.createChat);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (propertyId) {
      const propertyData = getProperty(propertyId);
      setProperty(propertyData);
    }
  }, [propertyId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (propertyId) {
        const propertyData = getProperty(propertyId);
        setProperty(propertyData);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleContactOwner = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to contact the property owner.');
      return;
    }

    try {
      const chatId = await createChat(propertyId, property?.landlord?.id || propertyId);
      navigation.navigate('Message', { chatId });
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  const handleCallOwner = () => {
    if (property?.landlord?.phone) {
      Alert.alert(
        'Call Owner',
        `Call ${property.landlord.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => console.log('Call:', property.landlord.phone) }
        ]
      );
    } else {
      Alert.alert('No Phone Number', 'Phone number not available for this property.');
    }
  };

  const handleShare = () => {
    Alert.alert('Share Property', 'Share functionality coming soon!');
  };

  const formatPrice = (price) => {
    if (!price) return '৳0';
    return `৳${price.toLocaleString()}`;
  };

  const formatArea = (area) => {
    if (!area) return '';
    return `${area} sq ft`;
  };

  if (!property) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
        <BottomNav navigation={navigation} active={null} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={["#FF9800", "#FFB300"]} 
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Details</Text>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <MaterialIcons 
            name={isFavorite ? "favorite" : "favorite-border"} 
            size={24} 
            color={isFavorite ? "#E91E63" : "#fff"} 
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9800"]}
            tintColor="#FF9800"
          />
        }
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: property.images?.[currentImageIndex]?.src || 
                   'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' 
            }} 
            style={styles.mainImage} 
          />
          {property.images && property.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {property.images.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.indicator, 
                    index === currentImageIndex && styles.activeIndicator
                  ]} 
                />
              ))}
            </View>
          )}
        </View>

        {/* Property Info */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(property.type) }]}>
              <Text style={styles.typeText}>{property.type}</Text>
            </View>
          </View>

          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <Text style={styles.location}>
            {property.location?.area}, {property.location?.city}
          </Text>

          {/* Property Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.detailsGrid}>
              {property.bedrooms > 0 && (
                <View style={styles.detailItem}>
                  <MaterialIcons name="bed" size={20} color="#757575" />
                  <Text style={styles.detailText}>{property.bedrooms} Bedrooms</Text>
                </View>
              )}
              {property.bathrooms > 0 && (
                <View style={styles.detailItem}>
                  <MaterialIcons name="bathroom" size={20} color="#757575" />
                  <Text style={styles.detailText}>{property.bathrooms} Bathrooms</Text>
                </View>
              )}
              {property.area > 0 && (
                <View style={styles.detailItem}>
                  <MaterialIcons name="square-foot" size={20} color="#757575" />
                  <Text style={styles.detailText}>{formatArea(property.area)}</Text>
                </View>
              )}
              {property.furnishing && (
                <View style={styles.detailItem}>
                  <MaterialIcons name="chair" size={20} color="#757575" />
                  <Text style={styles.detailText}>{property.furnishing}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {property.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Owner Info */}
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Property Owner</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{property.landlord?.name}</Text>
                {property.landlord?.verified && (
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="verified" size={16} color="#4CAF50" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              {property.landlord?.phone && (
                <Text style={styles.ownerPhone}>{property.landlord.phone}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleContactOwner}
          >
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Contact Owner</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleCallOwner}
          >
            <MaterialIcons name="phone" size={20} color="#FF9800" />
            <Text style={styles.secondaryButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleShare}
          >
            <MaterialIcons name="share" size={20} color="#FF9800" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {user && <BottomNav navigation={navigation} active="PropertyDetail" />}
    </View>
  );
}

const getTypeColor = (type) => {
  const colors = {
    apartment: '#FF9800',
    house: '#4CAF50',
    room: '#2196F3',
    studio: '#E91E63',
    family: '#9C27B0',
    bachelor: '#FF5722',
    office: '#607D8B',
    sublet: '#795548',
    hostel: '#FFC107',
    shop: '#00BCD4',
    parking: '#8BC34A',
  };
  return colors[type] || '#FF9800';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#eee',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  price: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 20,
    marginBottom: 12,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
    minWidth: '45%',
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  amenitiesSection: {
    marginBottom: 16,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#757575',
  },
  ownerSection: {
    marginBottom: 16,
  },
  ownerCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  ownerPhone: {
    fontSize: 14,
    color: '#757575',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#FF9800',
    flex: 2,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
  },
}); 