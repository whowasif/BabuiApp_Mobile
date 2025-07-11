import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const typeColors = {
  Apartment: '#FF9800',
  Room: '#4CAF50',
  Office: '#2196F3',
  Shop: '#E91E63',
  Parking: '#FFC107',
};

export default function PropertyCard({ property, onPress, onFavorite, isFavorite }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: property?.images?.[0]?.src || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{property?.title || 'Property Title'}</Text>
          <View style={[styles.badge, { backgroundColor: typeColors[property?.type] || '#FF9800' }] }>
            <Text style={styles.badgeText}>{property?.type || 'Type'}</Text>
          </View>
        </View>
        <Text style={styles.price}>{property?.price ? `৳${property.price}` : '৳0'}</Text>
        <Text style={styles.location}>{property?.location?.area || 'Area'}, {property?.location?.city || 'City'}</Text>
        <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite}>
          <MaterialIcons name={isFavorite ? 'favorite' : 'favorite-border'} size={22} color={isFavorite ? '#E91E63' : '#BDBDBD'} />
        </TouchableOpacity>
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
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  info: {
    padding: 16,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
}); 