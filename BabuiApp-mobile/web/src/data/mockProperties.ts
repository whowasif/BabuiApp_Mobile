import { Property } from '../types';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern 3BHK Apartment in Gulshan',
    titleBn: 'গুলশানে আধুনিক ৩ বেডরুমের অ্যাপার্টমেন্ট',
    description: 'Spacious and well-furnished apartment with modern amenities',
    descriptionBn: 'আধুনিক সুবিধা সহ প্রশস্ত এবং সুসজ্জিত অ্যাপার্টমেন্ট',
    price: 45000,
    currency: 'BDT',
    type: 'apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: 1200,
    images: [
      {
        id: '1-1',
        src: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        alt: 'Modern apartment living room',
        altBn: 'আধুনিক অ্যাপার্টমেন্টের বসার ঘর',
        priority: true
      }
    ],
    location: {
      address: 'Road 12, Block C, Gulshan-1',
      addressBn: 'রোড ১২, ব্লক সি, গুলশান-১',
      city: 'dhaka',
      area: 'Gulshan',
      areaBn: 'গুলশান',
      coordinates: { lat: 23.7937, lng: 90.4066 },
      nearbyPlaces: ['Gulshan Circle 1', 'Gulshan Lake'],
      nearbyPlacesBn: ['গুলশান সার্কেল ১', 'গুলশান লেক']
    },
    amenities: ['Air Conditioning', 'Parking', 'Security', 'Elevator'],
    amenitiesBn: ['এয়ার কন্ডিশনার', 'পার্কিং', 'নিরাপত্তা', 'লিফট'],
    landlord: {
      id: 'l1',
      name: 'Rahman Ahmed',
      nameBn: 'রহমান আহমেদ',
      phone: '+8801712345678',
      email: 'rahman@example.com',
      rating: 4.5,
      verified: true
    },
    available: true,
    availableFrom: new Date('2024-02-01'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Cozy 2BHK in Dhanmondi',
    titleBn: 'ধানমন্ডিতে আরামদায়ক ২ বেডরুমের ফ্ল্যাট',
    description: 'Perfect for small families with all necessary amenities',
    descriptionBn: 'সব প্রয়োজনীয় সুবিধা সহ ছোট পরিবারের জন্য উপযুক্ত',
    price: 28000,
    currency: 'BDT',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 850,
    images: [
      {
        id: '2-1',
        src: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
        alt: 'Cozy apartment bedroom',
        altBn: 'আরামদায়ক অ্যাপার্টমেন্টের শোবার ঘর',
        priority: false
      }
    ],
    location: {
      address: 'Road 5, Dhanmondi',
      addressBn: 'রোড ৫, ধানমন্ডি',
      city: 'dhaka',
      area: 'Dhanmondi',
      areaBn: 'ধানমন্ডি',
      coordinates: { lat: 23.7465, lng: 90.3760 },
      nearbyPlaces: ['Dhanmondi Lake', 'TSC'],
      nearbyPlacesBn: ['ধানমন্ডি লেক', 'টিএসসি']
    },
    amenities: ['Air Conditioning', 'Internet', 'Kitchen'],
    amenitiesBn: ['এয়ার কন্ডিশনার', 'ইন্টারনেট', 'রান্নাঘর'],
    landlord: {
      id: 'l2',
      name: 'Fatima Khatun',
      nameBn: 'ফাতিমা খাতুন',
      phone: '+8801987654321',
      rating: 4.2,
      verified: true
    },
    available: true,
    availableFrom: new Date('2024-02-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Sea View Apartment in Chittagong',
    titleBn: 'চট্টগ্রামে সমুদ্র দৃশ্য সহ অ্যাপার্টমেন্ট',
    description: 'Beautiful apartment with stunning sea views',
    descriptionBn: 'অসাধারণ সমুদ্র দৃশ্য সহ সুন্দর অ্যাপার্টমেন্ট',
    price: 35000,
    currency: 'BDT',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1000,
    images: [
      {
        id: '3-1',
        src: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg',
        alt: 'Sea view apartment',
        altBn: 'সমুদ্র দৃশ্য সহ অ্যাপার্টমেন্ট',
        priority: false
      }
    ],
    location: {
      address: 'CDA Avenue, Chittagong',
      addressBn: 'সিডিএ এভিনিউ, চট্টগ্রাম',
      city: 'chittagong',
      area: 'CDA Avenue',
      areaBn: 'সিডিএ এভিনিউ',
      coordinates: { lat: 22.3419, lng: 91.8132 },
      nearbyPlaces: ['Port City', 'Beach'],
      nearbyPlacesBn: ['বন্দর শহর', 'সৈকত']
    },
    amenities: ['Sea View', 'Balcony', 'Security'],
    amenitiesBn: ['সমুদ্র দৃশ্য', 'বারান্দা', 'নিরাপত্তা'],
    landlord: {
      id: 'l3',
      name: 'Karim Uddin',
      nameBn: 'করিম উদ্দিন',
      phone: '+8801555666777',
      rating: 4.7,
      verified: true
    },
    available: true,
    availableFrom: new Date('2024-01-25'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '4',
    title: 'Student Friendly Room in Uttara',
    titleBn: 'উত্তরায় ছাত্র বান্ধব রুম',
    description: 'Affordable room perfect for students',
    descriptionBn: 'ছাত্রদের জন্য উপযুক্ত সাশ্রয়ী রুম',
    price: 12000,
    currency: 'BDT',
    type: 'room',
    bedrooms: 1,
    bathrooms: 1,
    area: 300,
    images: [
      {
        id: '4-1',
        src: 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg',
        alt: 'Student room',
        altBn: 'ছাত্র রুম',
        priority: false
      }
    ],
    location: {
      address: 'Sector 7, Uttara',
      addressBn: 'সেক্টর ৭, উত্তরা',
      city: 'dhaka',
      area: 'Uttara',
      areaBn: 'উত্তরা',
      coordinates: { lat: 23.8709, lng: 90.3695 },
      nearbyPlaces: ['Uttara University', 'Shopping Mall'],
      nearbyPlacesBn: ['উত্তরা বিশ্ববিদ্যালয়', 'শপিং মল']
    },
    amenities: ['WiFi', 'Study Table', 'Shared Kitchen'],
    amenitiesBn: ['ওয়াইফাই', 'পড়ার টেবিল', 'শেয়ার রান্নাঘর'],
    landlord: {
      id: 'l4',
      name: 'Nasir Hossain',
      nameBn: 'নাসির হোসেন',
      phone: '+8801333444555',
      rating: 4.0,
      verified: false
    },
    available: true,
    availableFrom: new Date('2024-02-10'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '5',
    title: 'Modern Office Space in Banani',
    titleBn: 'বনানীতে আধুনিক অফিস স্পেস',
    description: 'Professional office space with modern amenities',
    descriptionBn: 'আধুনিক সুবিধা সহ পেশাদার অফিস স্পেস',
    price: 80000,
    currency: 'BDT',
    type: 'office',
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    images: [
      {
        id: '5-1',
        src: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
        alt: 'Modern office space',
        altBn: 'আধুনিক অফিস স্পেস',
        priority: false
      }
    ],
    location: {
      address: 'Road 11, Banani',
      addressBn: 'রোড ১১, বনানী',
      city: 'dhaka',
      area: 'Banani',
      areaBn: 'বনানী',
      coordinates: { lat: 23.7941, lng: 90.4065 },
      nearbyPlaces: ['Banani Club', 'Gulshan 2'],
      nearbyPlacesBn: ['বনানী ক্লাব', 'গুলশান ২']
    },
    amenities: ['Air Conditioning', 'Security', 'CCTV', 'Parking'],
    amenitiesBn: ['এয়ার কন্ডিশনার', 'নিরাপত্তা', 'সিসিটিভি', 'পার্কিং'],
    landlord: {
      id: 'l5',
      name: 'Ahmed Khan',
      nameBn: 'আহমেদ খান',
      phone: '+8801777888999',
      rating: 4.8,
      verified: true
    },
    available: true,
    availableFrom: new Date('2024-02-01'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '6',
    title: 'Shop Space in Mirpur',
    titleBn: 'মিরপুরে দোকানের জায়গা',
    description: 'Prime location shop space for business',
    descriptionBn: 'ব্যবসার জন্য প্রধান অবস্থানের দোকানের জায়গা',
    price: 35000,
    currency: 'BDT',
    type: 'shop',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    images: [
      {
        id: '6-1',
        src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        alt: 'Shop space',
        altBn: 'দোকানের জায়গা',
        priority: false
      }
    ],
    location: {
      address: 'Mirpur 10, Dhaka',
      addressBn: 'মিরপুর ১০, ঢাকা',
      city: 'dhaka',
      area: 'Mirpur',
      areaBn: 'মিরপুর',
      coordinates: { lat: 23.8067, lng: 90.3683 },
      nearbyPlaces: ['Mirpur Stadium', 'Shopping Complex'],
      nearbyPlacesBn: ['মিরপুর স্টেডিয়াম', 'শপিং কমপ্লেক্স']
    },
    amenities: ['Security', 'Parking', 'CCTV'],
    amenitiesBn: ['নিরাপত্তা', 'পার্কিং', 'সিসিটিভি'],
    landlord: {
      id: 'l6',
      name: 'Rashid Ali',
      nameBn: 'রশিদ আলী',
      phone: '+8801666777888',
      rating: 4.3,
      verified: true
    },
    available: true,
    availableFrom: new Date('2024-02-15'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];