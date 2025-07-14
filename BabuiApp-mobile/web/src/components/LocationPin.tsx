import React, { useState } from 'react';
// import { MapPin } from 'lucide-react';

interface LocationPinProps {
  city: 'dhaka' | 'chittagong';
  coordinates: {
    lat: number;
    lng: number;
  };
  isCluster?: boolean;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  price?: number;
  title?: string;
  showDetails?: boolean;
}

const LocationPin: React.FC<LocationPinProps> = ({
  city,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  coordinates,
  isCluster = false,
  count = 1,
  isActive = false,
  onClick,
  price,
  title,
  showDetails = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cityColors = {
    dhaka: {
      bg: 'bg-amber-500',
      border: 'border-amber-600',
      text: 'text-white',
      hover: 'hover:bg-amber-600'
    },
    chittagong: {
      bg: 'bg-blue-500',
      border: 'border-blue-600',
      text: 'text-white',
      hover: 'hover:bg-blue-600'
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const colors = cityColors[city];

  // Airbnb/Foodpanda style cluster
  if (isCluster) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative flex items-center justify-center
          w-12 h-12 rounded-full
          bg-white border-2 border-gray-300 shadow-lg
          hover:shadow-xl transition-all duration-200
          transform hover:scale-110
          ${isActive ? 'scale-110 ring-4 ring-amber-400 ring-opacity-50 border-amber-500' : ''}
        `}
      >
        <span className="text-sm font-bold text-gray-800">{count}</span>
        
        {/* Cluster background circles (Airbnb style) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 animate-pulse"></div>
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 opacity-30"></div>
        
        {/* Hover tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {count} properties
          </div>
        )}
      </button>
    );
  }

  // Airbnb style single property pin
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group
        ${isActive ? 'scale-110 z-50' : 'hover:scale-105'}
        transition-all duration-200
      `}
    >
      {/* Price Tag (Airbnb style) */}
      <div className={`
        px-3 py-2 rounded-full text-sm font-semibold
        shadow-lg border-2 transition-all duration-200
        ${isActive
          ? 'bg-gray-900 text-white border-gray-900 scale-110'
          : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
        }
        ${isHovered ? 'shadow-xl' : ''}
      `}>
        {price ? `৳${(price / 1000).toFixed(0)}k` : count > 1 ? count : '৳'}
      </div>
      
      {/* Pin Tail (Google Maps style) */}
      <div className={`
        absolute top-full left-1/2 transform -translate-x-1/2
        w-0 h-0 border-l-4 border-r-4 border-t-6
        border-l-transparent border-r-transparent
        transition-all duration-200
        ${isActive
          ? 'border-t-gray-900'
          : 'border-t-white group-hover:border-t-gray-100'
        }
      `} />
      
      {/* Hover Info Card (Airbnb style) */}
      {(isHovered || showDetails) && title && (
        <div className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px]
          opacity-100 transition-all duration-200
          pointer-events-none z-50
        `}>
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {title.length > 30 ? title.substring(0, 30) + '...' : title}
          </div>
          {price && (
            <div className="text-sm font-bold text-amber-600">
              ৳{price.toLocaleString()}/month
            </div>
          )}
          
          {/* Arrow pointing down (Google Maps style) */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      )}

      {/* Ripple effect on click (Google Maps style) */}
      {isActive && (
        <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-75"></div>
      )}
    </button>
  );
};

export default LocationPin;