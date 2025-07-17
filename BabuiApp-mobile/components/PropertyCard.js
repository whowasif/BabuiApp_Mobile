import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const typeColors = {
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

export default function PropertyCard({ property, onPress, onFavorite, isFavorite }) {
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const formatPrice = (price) => {
    if (!price) return '৳0';
    return `৳${price.toLocaleString()}`;
  };

  const formatArea = (area) => {
    if (!area) return '';
    return `${area} sq ft`;
  };

  const handleFavoritePress = async () => {
    if (favoriteLoading) return; // Prevent multiple clicks
    
    setFavoriteLoading(true);
    try {
      if (onFavorite) {
        await onFavorite();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property?.images?.[0]?.src || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' }}
          style={styles.image}
        />
        <TouchableOpacity 
          style={styles.favoriteBtn} 
          onPress={handleFavoritePress}
          disabled={favoriteLoading}
        >
          {favoriteLoading ? (
            <ActivityIndicator size="small" color="#E91E63" />
          ) : (
            <MaterialIcons 
              name={isFavorite ? 'favorite' : 'favorite-border'} 
              size={22} 
              color={isFavorite ? '#E91E63' : '#BDBDBD'} 
            />
          )}
        </TouchableOpacity>
        {property?.available === false && (
          <View style={styles.rentedBadge}>
            <Text style={styles.rentedText}>Rented</Text>
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {property?.title || 'Property Title'}
          </Text>
          <View style={[styles.badge, { backgroundColor: typeColors[property?.type] || '#FF9800' }]}>
            <Text style={styles.badgeText}>{property?.type || 'Type'}</Text>
          </View>
        </View>
        
        <Text style={styles.price}>{formatPrice(property?.price)}</Text>
        
        <Text style={styles.location}>
          {property?.location?.area || 'Area'}, {property?.location?.city || 'City'}
        </Text>
        
        <View style={styles.detailsRow}>
          {property?.bedrooms > 0 && (
            <View style={styles.detailItem}>
              <MaterialIcons name="bed" size={16} color="#757575" />
              <Text style={styles.detailText}>{property.bedrooms}</Text>
            </View>
          )}
          
          {property?.bathrooms > 0 && (
            <View style={styles.detailItem}>
              <MaterialIcons name="bathroom" size={16} color="#757575" />
              <Text style={styles.detailText}>{property.bathrooms}</Text>
            </View>
          )}
          
          {property?.area > 0 && (
            <View style={styles.detailItem}>
              <MaterialIcons name="square-foot" size={16} color="#757575" />
              <Text style={styles.detailText}>{formatArea(property.area)}</Text>
            </View>
          )}
        </View>
        
        {property?.amenities && property.amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
            {property.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{property.amenities.length - 3} more</Text>
            )}
          </View>
        )}
        
        {property?.landlord?.verified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={14} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified Owner</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  rentedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rentedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  price: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  amenityTag: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 10,
    color: '#757575',
  },
  moreAmenities: {
    fontSize: 10,
    color: '#757575',
    fontStyle: 'italic',
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
}); 