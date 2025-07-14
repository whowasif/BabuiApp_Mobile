import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Square, 
  Star, Phone, MessageCircle, Calendar, CheckCircle, 
  Wifi, Car, Shield, Zap, Home, Users, ChevronLeft, ChevronRight,
  Eye, Clock, Verified, Mail, Award, TrendingUp
} from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import { useLanguage } from '../hooks/useLanguage';
import PropertyImage from '../components/PropertyImage';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const property = usePropertyStore((state) => state.properties.find(p => p.id === id));

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-amber-200">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-amber-800 mb-2">
            {t('property-not-found', 'সম্পত্তি পাওয়া যায়নি', 'Property Not Found')}
          </h2>
          <p className="text-amber-600 mb-4">
            {t('property-not-found-desc', 'এই সম্পত্তিটি আর উপলব্ধ নেই বা সরানো হয়েছে', 'This property is no longer available or has been removed')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
          >
            {t('back-to-home', 'হোমে ফিরে যান', 'Back to Home')}
          </button>
        </div>
      </div>
    );
  }

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

  const handleChatWithOwner = () => {
    // If landlord ID is not available, use property ID as fallback
    const ownerId = property.landlord.id || property.id;
    if (!ownerId) {
      console.error('No owner ID available for chat');
      return;
    }
    navigate(`/chat?owner=${ownerId}&property=${property.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'bn' ? property.titleBn : property.title,
          text: language === 'bn' ? property.descriptionBn : property.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const amenityIcons: Record<string, any> = {
    'Air Conditioning': Zap,
    'Parking': Car,
    'Security': Shield,
    'Internet': Wifi,
    'Elevator': Home,
    'Kitchen': Home,
    'Balcony': Home,
    'Furnished': Home
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const getPropertyStatus = () => {
    if (!property.available) {
      return { text: t('not-available', 'উপলব্ধ নয়', 'Not Available'), color: 'bg-red-100 text-red-700 border-red-200' };
    }
    
    const availableDate = new Date(property.availableFrom);
    const today = new Date();
    
    if (availableDate <= today) {
      return { text: t('available-now', 'এখনই উপলব্ধ', 'Available Now'), color: 'bg-green-100 text-green-700 border-green-200' };
    } else {
      return { text: t('available-soon', 'শীঘ্রই উপলব্ধ', 'Available Soon'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }
  };

  const status = getPropertyStatus();

  return (
    <div className="pb-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-amber-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-800 bg-amber-50 px-4 py-2 rounded-lg hover:bg-amber-100 transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">{t('back', 'ফিরে যান', 'Back')}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isFavorite 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-300'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button 
                onClick={handleShare}
                className="p-3 rounded-full bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 transform hover:scale-110"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Enhanced Image Gallery */}
        <div className="relative mb-8">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <PropertyImage
              src={property.images[currentImageIndex]?.src || property.images[0]?.src}
              alt={language === 'bn' 
                ? property.images[currentImageIndex]?.altBn || property.images[0]?.altBn
                : property.images[currentImageIndex]?.alt || property.images[0]?.alt
              }
              className="h-full"
              priority={true}
            />
            
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            
            {/* Image navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <ChevronRight size={24} />
                </button>
                
                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Property status badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${status.color} backdrop-blur-sm`}>
                {status.text}
              </span>
            </div>

            {/* Property type badge */}
            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
                {t(`type-${property.type}`, 
                  property.type === 'apartment' ? 'অ্যাপার্টমেন্ট' :
                  property.type === 'house' ? 'বাড়ি' :
                  property.type === 'room' ? 'রুম' : 'স্টুডিও',
                  property.type.charAt(0).toUpperCase() + property.type.slice(1)
                )}
              </span>
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </div>

          {/* Thumbnail strip for larger screens */}
          {property.images.length > 1 && (
            <div className="hidden md:flex gap-2 mt-4 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'border-amber-500 scale-105' 
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <PropertyImage
                    src={image.src}
                    alt={language === 'bn' ? image.altBn : image.alt}
                    className="h-full"
                    priority={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Property Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-amber-900 mb-3 leading-tight">
                    {language === 'bn' ? property.titleBn : property.title}
                  </h1>
                  <div className="flex items-center text-amber-700 mb-4">
                    <MapPin size={18} className="mr-2 text-amber-500" />
                    <span className="text-lg font-medium">
                      {language === 'bn' ? property.location.areaBn : property.location.area},
                      {' '}
                      {property.location.city === 'dhaka' 
                        ? t('dhaka', 'ঢাকা', 'Dhaka')
                        : t('chittagong', 'চট্টগ্রাম', 'Chittagong')
                      }
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-4xl font-bold text-amber-600 mb-1">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-amber-500 font-medium">
                    {t('per-month', '/মাস', '/month')}
                  </div>
                </div>
              </div>

              {/* Enhanced Property Details Grid */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-amber-100">
                <div className="text-center bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                      <Bed size={24} className="text-amber-700" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {formatNumber(property.bedrooms)}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">
                    {t('bedrooms', 'শোবার ঘর', 'Bedrooms')}
                  </div>
                </div>
                
                <div className="text-center bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                      <Bath size={24} className="text-amber-700" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {formatNumber(property.bathrooms)}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">
                    {t('bathrooms', 'বাথরুম', 'Bathrooms')}
                  </div>
                </div>
                
                <div className="text-center bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                      <Square size={24} className="text-amber-700" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {formatNumber(property.area)}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">
                    {t('sqft', 'বর্গফুট', 'sqft')}
                  </div>
                </div>
              </div>

              {/* Additional property features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-amber-100">
                {property.genderPreference && property.genderPreference !== 'any' && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-amber-500" />
                    <span className="text-sm text-amber-700 font-medium">
                      {t(`gender-${property.genderPreference}`, 
                        property.genderPreference === 'male' ? 'পুরুষ' :
                        property.genderPreference === 'female' ? 'মহিলা' : 'পরিবার',
                        property.genderPreference === 'male' ? 'Male Only' :
                        property.genderPreference === 'female' ? 'Female Only' : 'Family'
                      )}
                    </span>
                  </div>
                )}
                
                {property.furnishing && (
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-amber-500" />
                    <span className="text-sm text-amber-700 font-medium">
                      {t(`furnishing-${property.furnishing}`, 
                        property.furnishing === 'furnished' ? 'সাজানো' :
                        property.furnishing === 'semi-furnished' ? 'আংশিক সাজানো' : 'সাজানো নয়',
                        property.furnishing === 'furnished' ? 'Furnished' :
                        property.furnishing === 'semi-furnished' ? 'Semi-Furnished' : 'Unfurnished'
                      )}
                    </span>
                  </div>
                )}
                
                {property.parking && (
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-amber-500" />
                    <span className="text-sm text-amber-700 font-medium">
                      {t('parking-available', 'পার্কিং উপলব্ধ', 'Parking Available')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-amber-500" />
                  <span className="text-sm text-amber-700 font-medium">
                    {t('available-from', 'থেকে উপলব্ধ', 'Available from')} {property.availableFrom.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                  <Eye size={18} className="text-amber-700" />
                </div>
                {t('description', 'বিবরণ', 'Description')}
              </h2>
              <div className="prose prose-amber max-w-none">
                <p className="text-amber-800 leading-relaxed text-lg">
                  {showFullDescription 
                    ? (language === 'bn' ? property.descriptionBn : property.description)
                    : (language === 'bn' ? property.descriptionBn : property.description).substring(0, 200) + '...'
                  }
                </p>
                {(language === 'bn' ? property.descriptionBn : property.description).length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300"
                  >
                    {showFullDescription 
                      ? t('show-less', 'কম দেখান', 'Show Less')
                      : t('show-more', 'আরো দেখান', 'Show More')
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Amenities */}
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                  <CheckCircle size={18} className="text-amber-700" />
                </div>
                {t('amenities', 'সুবিধাসমূহ', 'Amenities')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => {
                  const Icon = amenityIcons[amenity] || CheckCircle;
                  const amenityBn = property.amenitiesBn[index];
                  
                  return (
                    <div key={amenity} className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors duration-300">
                      <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                        <Icon size={20} className="text-amber-700" />
                      </div>
                      <span className="text-amber-800 font-medium">
                        {language === 'bn' ? amenityBn : amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Location */}
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                  <MapPin size={18} className="text-amber-700" />
                </div>
                {t('location', 'অবস্থান', 'Location')}
              </h2>
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <h3 className="font-semibold text-amber-900 mb-3 text-lg">
                    {t('address', 'ঠিকানা', 'Address')}
                  </h3>
                  <p className="text-amber-800 leading-relaxed">
                    {language === 'bn' ? property.location.addressBn : property.location.address}
                  </p>
                </div>
                
                {property.location.nearbyPlaces.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-4 text-lg">
                      {t('nearby-places', 'কাছাকাছি স্থান', 'Nearby Places')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.location.nearbyPlaces.map((place, index) => (
                        <div
                          key={place}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-100"
                        >
                          <MapPin size={14} className="text-amber-500" />
                          <span className="text-amber-700 text-sm font-medium">
                            {language === 'bn' ? property.location.nearbyPlacesBn[index] : place}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Owner Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                  <Users size={18} className="text-amber-700" />
                </div>
                {t('property-owner', 'সম্পত্তির মালিক', 'Property Owner')}
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {(language === 'bn' ? property.landlord.nameBn : property.landlord.name).charAt(0)}
                  </div>
                  {property.landlord.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white">
                      <Verified size={12} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 text-lg">
                    {language === 'bn' ? property.landlord.nameBn : property.landlord.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm ml-1 font-medium text-amber-700">{property.landlord.rating}</span>
                    </div>
                    {property.landlord.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium border border-green-200">
                        {t('verified', 'যাচাইকৃত', 'Verified')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp size={16} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold text-amber-900">95%</div>
                  <div className="text-xs text-amber-600">{t('response-rate', 'সাড়া হার', 'Response Rate')}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock size={16} className="text-amber-500" />
                  </div>
                  <div className="text-lg font-bold text-amber-900">2h</div>
                  <div className="text-xs text-amber-600">{t('avg-response', 'গড় সাড়া', 'Avg Response')}</div>
                </div>
              </div>

              {/* Contact buttons */}
              <div className="space-y-3">
                {/* Prominent Chat Button */}
                <button
                  onClick={handleChatWithOwner}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold text-lg"
                >
                  <MessageCircle size={20} />
                  {t('chat-with-owner', 'মালিকের সাথে চ্যাট করুন', 'Chat with Owner')}
                </button>
                
                <a
                  href={`tel:${property.landlord.phone}`}
                  className="w-full flex items-center justify-center gap-3 bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition-all duration-300 font-medium"
                >
                  <Phone size={18} />
                  {t('call-now', 'এখনই কল করুন', 'Call Now')}
                </a>

                {property.landlord.email && (
                  <a
                    href={`mailto:${property.landlord.email}`}
                    className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium"
                  >
                    <Mail size={18} />
                    {t('send-email', 'ইমেইল পাঠান', 'Send Email')}
                  </a>
                )}
              </div>

              {/* Professional credentials */}
              <div className="mt-6 pt-6 border-t border-amber-100">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  {t('credentials', 'পরিচয়পত্র', 'Credentials')}
                </h4>
                <div className="space-y-2 text-sm text-amber-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>{t('identity-verified', 'পরিচয় যাচাইকৃত', 'Identity Verified')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>{t('phone-verified', 'ফোন যাচাইকৃত', 'Phone Verified')}</span>
                  </div>
                  {property.landlord.email && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span>{t('email-verified', 'ইমেইল যাচাইকৃত', 'Email Verified')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Property Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-6">
                {t('quick-info', 'দ্রুত তথ্য', 'Quick Info')}
              </h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-600 font-medium">{t('property-id', 'সম্পত্তি আইডি', 'Property ID')}:</span>
                  <span className="font-semibold text-amber-900">#{property.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-600 font-medium">{t('posted-on', 'পোস্ট করা হয়েছে', 'Posted on')}:</span>
                  <span className="font-semibold text-amber-900">
                    {property.createdAt.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-600 font-medium">{t('last-updated', 'সর্বশেষ আপডেট', 'Last updated')}:</span>
                  <span className="font-semibold text-amber-900">
                    {property.updatedAt.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-amber-600 font-medium">{t('views', 'দেখা হয়েছে', 'Views')}:</span>
                  <span className="font-semibold text-amber-900">247</span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                {t('safety-tips', 'নিরাপত্তা টিপস', 'Safety Tips')}
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('tip-1', 'সম্পত্তি দেখার আগে মালিকের পরিচয় যাচাই করুন', 'Verify owner identity before visiting')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('tip-2', 'অগ্রিম অর্থ প্রদানের ব্যাপারে সতর্ক থাকুন', 'Be cautious about advance payments')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{t('tip-3', 'সব কাগজপত্র যাচাই করুন', 'Verify all documents')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetailPage;