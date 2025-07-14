// Bangladesh-specific utility functions

export const formatBangladeshiPhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Bangladesh phone format: +880-1XXX-XXXXXX
  if (digits.startsWith('880')) {
    const number = digits.slice(3);
    return `+880-${number.slice(0, 4)}-${number.slice(4)}`;
  } else if (digits.startsWith('01')) {
    return `+880-${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  
  return phone;
};

export const validateBangladeshiPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a valid Bangladesh mobile number
  return /^(880)?01[3-9]\d{8}$/.test(digits);
};

export const formatBangladeshiAddress = (
  address: string,
  area: string,
  city: 'dhaka' | 'chittagong'
): string => {
  const cityName = city === 'dhaka' ? 'Dhaka' : 'Chittagong';
  return `${address}, ${area}, ${cityName}, Bangladesh`;
};

export const getBangladeshiDivision = (city: 'dhaka' | 'chittagong'): string => {
  const divisions = {
    dhaka: 'Dhaka Division',
    chittagong: 'Chittagong Division'
  };
  return divisions[city];
};

// Bengali number conversion
export const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
};

export const fromBengaliNumber = (bengaliNum: string): number => {
  const englishDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let englishNum = bengaliNum;
  
  englishDigits.forEach((bengali, index) => {
    englishNum = englishNum.replace(new RegExp(bengali, 'g'), index.toString());
  });
  
  return parseInt(englishNum) || 0;
};

// Currency formatting for Bangladesh
export const formatBDT = (amount: number, language: 'bn' | 'en' = 'en'): string => {
  if (language === 'bn') {
    return `৳${toBengaliNumber(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
  
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0
  }).format(amount);
};

// Payment gateway detection
export const getPaymentGatewayInfo = (type: 'bkash' | 'nagad' | 'rocket' | 'bank') => {
  const gateways = {
    bkash: {
      name: 'bKash',
      nameBn: 'বিকাশ',
      color: '#E2136E',
      pattern: /^01[0-9]{9}$/
    },
    nagad: {
      name: 'Nagad',
      nameBn: 'নগদ',
      color: '#EB6C2C',
      pattern: /^01[0-9]{9}$/
    },
    rocket: {
      name: 'Rocket',
      nameBn: 'রকেট',
      color: '#8E44AD',
      pattern: /^01[0-9]{9}$/
    },
    bank: {
      name: 'Bank Transfer',
      nameBn: 'ব্যাংক ট্রান্সফার',
      color: '#2C3E50',
      pattern: /^[0-9]{10,20}$/
    }
  };
  
  return gateways[type];
};

// Area mapping for major cities
export const getDhakaAreas = () => [
  { en: 'Gulshan', bn: 'গুলশান' },
  { en: 'Dhanmondi', bn: 'ধানমন্ডি' },
  { en: 'Uttara', bn: 'উত্তরা' },
  { en: 'Mirpur', bn: 'মিরপুর' },
  { en: 'Mohammadpur', bn: 'মোহাম্মদপুর' },
  { en: 'Wari', bn: 'ওয়ারী' },
  { en: 'Old Dhaka', bn: 'পুরান ঢাকা' },
  { en: 'Tejgaon', bn: 'তেজগাঁও' }
];

export const getChittagongAreas = () => [
  { en: 'CDA Avenue', bn: 'সিডিএ এভিনিউ' },
  { en: 'Agrabad', bn: 'আগ্রাবাদ' },
  { en: 'Nasirabad', bn: 'নাসিরাবাদ' },
  { en: 'Halishahar', bn: 'হালিশহর' },
  { en: 'Khulshi', bn: 'খুলশী' },
  { en: 'Port Area', bn: 'বন্দর এলাকা' }
];