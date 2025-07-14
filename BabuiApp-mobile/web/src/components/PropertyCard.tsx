import React from 'react';
import { Heart, MapPin, Bed, Bath, Square, Star } from 'lucide-react';
import { Property } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import PropertyImage from './PropertyImage';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  onClick?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavorite,
  isFavorite = false,
  onClick
}) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return language === 'bn' 
      ? num.toLocaleString('bn-BD')
      : num.toLocaleString('en-BD');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on favorite button
    if ((e.target as HTMLElement).closest('button[data-favorite]')) {
      return;
    }
    
    if (onClick) {
      onClick();
    } else {
      // Navigate to property detail page
      navigate(`/property/${property.id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(property.id);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden border border-amber-100 hover:border-amber-300 transform hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="relative h-56 overflow-hidden">
        <PropertyImage
          src={property.images[0]?.src || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={language === 'bn' ? property.images[0]?.altBn : property.images[0]?.alt}
          className="h-full transform group-hover:scale-110 transition-transform duration-700"
          priority={false}
          webpSrc={property.images[0]?.webpSrc}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Favorite button with nest-like design */}
        <button
          data-favorite="true"
          onClick={handleFavoriteClick}
          className={`
            absolute top-4 right-4 p-3 rounded-full
            backdrop-blur-md transition-all duration-300 transform hover:scale-110
            ${isFavorite 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/20 text-white hover:bg-white/30'
            }
          `}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          {/* Subtle weaving pattern around heart */}
          <div className="absolute inset-0 rounded-full opacity-30">
            <svg className="w-full h-full" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="0.3" fill="none" strokeDasharray="2,2"/>
            </svg>
          </div>
        </button>

        {/* Property type badge with organic design */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-full font-medium shadow-lg backdrop-blur-sm">
            {t(`type-${property.type}`, 
              property.type === 'apartment' ? 'অ্যাপার্টমেন্ট' :
              property.type === 'house' ? 'বাড়ি' :
              property.type === 'room' ? 'রুম' : 'স্টুডিও',
              property.type.charAt(0).toUpperCase() + property.type.slice(1)
            )}
          </span>
        </div>

        {/* Gender preference badge */}
        {property.genderPreference && property.genderPreference !== 'any' && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium shadow-lg backdrop-blur-sm">
              {t(`gender-${property.genderPreference}`, 
                property.genderPreference === 'male' ? 'পুরুষ' :
                property.genderPreference === 'female' ? 'মহিলা' : 'পরিবার',
                property.genderPreference === 'male' ? 'Male' :
                property.genderPreference === 'female' ? 'Female' : 'Family'
              )}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-amber-900 text-xl leading-tight flex-1 mr-4">
            {language === 'bn' ? property.titleBn : property.title}
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">
              {formatPrice(property.price)}
            </div>
            <div className="text-xs text-amber-500 font-medium">
              {t('per-month', '/মাস', '/month')}
            </div>
          </div>
        </div>

        <div className="flex items-center text-amber-700 mb-4">
          <MapPin size={16} className="mr-2 text-amber-500" />
          <span className="text-sm font-medium">
            {language === 'bn' ? property.location.areaBn : property.location.area},
            {' '}
            {property.location.city === 'dhaka' 
              ? t('dhaka', 'ঢাকা', 'Dhaka')
              : t('chittagong', 'চট্টগ্রাম', 'Chittagong')
            }
          </span>
        </div>

        {/* Property details with nest-inspired icons */}
        <div className="flex items-center justify-between text-sm text-amber-700 mb-4 bg-amber-50 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center">
              <Bed size={12} className="text-amber-700" />
            </div>
            <span className="font-medium">{formatNumber(property.bedrooms)} {t('bed', 'বেড', 'Bed')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center">
              <Bath size={12} className="text-amber-700" />
            </div>
            <span className="font-medium">{formatNumber(property.bathrooms)} {t('bath', 'বাথ', 'Bath')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center">
              <Square size={12} className="text-amber-700" />
            </div>
            <span className="font-medium">{formatNumber(property.area)} {t('sqft', 'বর্গফুট', 'sqft')}</span>
          </div>
        </div>

        {/* Owner info and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-yellow-500">
              <Star size={16} fill="currentColor" />
              <span className="text-sm ml-1 font-medium text-amber-700">{property.landlord.rating}</span>
            </div>
            <span className="text-sm text-amber-600 font-medium">
              {language === 'bn' ? property.landlord.nameBn : property.landlord.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {property.landlord.verified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200">
                {t('verified', 'যাচাইকৃত', 'Verified')}
              </span>
            )}
            {property.available && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-200">
                {t('available', 'উপলব্ধ', 'Available')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subtle weaving pattern at bottom */}
      <div className="h-1 bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0,5 Q25,0 50,5 T100,5" stroke="rgba(245,158,11,0.5)" strokeWidth="0.5" fill="none"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;