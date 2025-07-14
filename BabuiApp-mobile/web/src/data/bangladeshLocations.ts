// Complete Bangladesh administrative divisions data
export interface Division {
  id: string;
  name: string;
  nameBn: string;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  nameBn: string;
  divisionId: string;
  thanas: Thana[];
}

export interface Thana {
  id: string;
  name: string;
  nameBn: string;
  districtId: string;
  areas: Area[];
}

export interface Area {
  id: string;
  name: string;
  nameBn: string;
  thanaId: string;
  popular?: boolean;
}

export const bangladeshDivisions: Division[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      {
        id: 'dhaka-district',
        name: 'Dhaka',
        nameBn: 'ঢাকা',
        divisionId: 'dhaka',
        thanas: [
          {
            id: 'dhanmondi',
            name: 'Dhanmondi',
            nameBn: 'ধানমন্ডি',
            districtId: 'dhaka-district',
            areas: [
              { id: 'dhanmondi-1', name: 'Dhanmondi 1', nameBn: 'ধানমন্ডি ১', thanaId: 'dhanmondi', popular: true },
              { id: 'dhanmondi-2', name: 'Dhanmondi 2', nameBn: 'ধানমন্ডি ২', thanaId: 'dhanmondi', popular: true },
              { id: 'dhanmondi-3', name: 'Dhanmondi 3', nameBn: 'ধানমন্ডি ৩', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-4', name: 'Dhanmondi 4', nameBn: 'ধানমন্ডি ৪', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-5', name: 'Dhanmondi 5', nameBn: 'ধানমন্ডি ৫', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-6', name: 'Dhanmondi 6', nameBn: 'ধানমন্ডি ৬', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-7', name: 'Dhanmondi 7', nameBn: 'ধানমন্ডি ৭', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-8', name: 'Dhanmondi 8', nameBn: 'ধানমন্ডি ৮', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-9', name: 'Dhanmondi 9', nameBn: 'ধানমন্ডি ৯', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-10', name: 'Dhanmondi 10', nameBn: 'ধানমন্ডি ১০', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-15', name: 'Dhanmondi 15', nameBn: 'ধানমন্ডি ১৫', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-27', name: 'Dhanmondi 27', nameBn: 'ধানমন্ডি ২৭', thanaId: 'dhanmondi' },
              { id: 'dhanmondi-32', name: 'Dhanmondi 32', nameBn: 'ধানমন্ডি ৩২', thanaId: 'dhanmondi' }
            ]
          },
          {
            id: 'gulshan',
            name: 'Gulshan',
            nameBn: 'গুলশান',
            districtId: 'dhaka-district',
            areas: [
              { id: 'gulshan-1', name: 'Gulshan 1', nameBn: 'গুলশান ১', thanaId: 'gulshan', popular: true },
              { id: 'gulshan-2', name: 'Gulshan 2', nameBn: 'গুলশান ২', thanaId: 'gulshan', popular: true },
              { id: 'gulshan-circle-1', name: 'Gulshan Circle 1', nameBn: 'গুলশান সার্কেল ১', thanaId: 'gulshan', popular: true },
              { id: 'gulshan-circle-2', name: 'Gulshan Circle 2', nameBn: 'গুলশান সার্কেল ২', thanaId: 'gulshan' },
              { id: 'gulshan-avenue', name: 'Gulshan Avenue', nameBn: 'গুলশান এভিনিউ', thanaId: 'gulshan' },
              { id: 'gulshan-lake', name: 'Gulshan Lake', nameBn: 'গুলশান লেক', thanaId: 'gulshan' }
            ]
          },
          {
            id: 'uttara',
            name: 'Uttara',
            nameBn: 'উত্তরা',
            districtId: 'dhaka-district',
            areas: [
              { id: 'uttara-sector-1', name: 'Uttara Sector 1', nameBn: 'উত্তরা সেক্টর ১', thanaId: 'uttara', popular: true },
              { id: 'uttara-sector-3', name: 'Uttara Sector 3', nameBn: 'উত্তরা সেক্টর ৩', thanaId: 'uttara', popular: true },
              { id: 'uttara-sector-4', name: 'Uttara Sector 4', nameBn: 'উত্তরা সেক্টর ৪', thanaId: 'uttara', popular: true },
              { id: 'uttara-sector-5', name: 'Uttara Sector 5', nameBn: 'উত্তরা সেক্টর ৫', thanaId: 'uttara' },
              { id: 'uttara-sector-6', name: 'Uttara Sector 6', nameBn: 'উত্তরা সেক্টর ৬', thanaId: 'uttara' },
              { id: 'uttara-sector-7', name: 'Uttara Sector 7', nameBn: 'উত্তরা সেক্টর ৭', thanaId: 'uttara', popular: true },
              { id: 'uttara-sector-8', name: 'Uttara Sector 8', nameBn: 'উত্তরা সেক্টর ৮', thanaId: 'uttara' },
              { id: 'uttara-sector-9', name: 'Uttara Sector 9', nameBn: 'উত্তরা সেক্টর ৯', thanaId: 'uttara' },
              { id: 'uttara-sector-10', name: 'Uttara Sector 10', nameBn: 'উত্তরা সেক্টর ১০', thanaId: 'uttara' },
              { id: 'uttara-sector-11', name: 'Uttara Sector 11', nameBn: 'উত্তরা সেক্টর ১১', thanaId: 'uttara' },
              { id: 'uttara-sector-12', name: 'Uttara Sector 12', nameBn: 'উত্তরা সেক্টর ১২', thanaId: 'uttara' },
              { id: 'uttara-sector-13', name: 'Uttara Sector 13', nameBn: 'উত্তরা সেক্টর ১৩', thanaId: 'uttara' },
              { id: 'uttara-sector-14', name: 'Uttara Sector 14', nameBn: 'উত্তরা সেক্টর ১৪', thanaId: 'uttara' },
              { id: 'uttara-sector-15', name: 'Uttara Sector 15', nameBn: 'উত্তরা সেক্টর ১৫', thanaId: 'uttara' },
              { id: 'uttara-sector-16', name: 'Uttara Sector 16', nameBn: 'উত্তরা সেক্টর ১৬', thanaId: 'uttara' },
              { id: 'uttara-sector-17', name: 'Uttara Sector 17', nameBn: 'উত্তরা সেক্টর ১৭', thanaId: 'uttara' },
              { id: 'uttara-sector-18', name: 'Uttara Sector 18', nameBn: 'উত্তরা সেক্টর ১৮', thanaId: 'uttara' }
            ]
          },
          {
            id: 'mirpur',
            name: 'Mirpur',
            nameBn: 'মিরপুর',
            districtId: 'dhaka-district',
            areas: [
              { id: 'mirpur-1', name: 'Mirpur 1', nameBn: 'মিরপুর ১', thanaId: 'mirpur', popular: true },
              { id: 'mirpur-2', name: 'Mirpur 2', nameBn: 'মিরপুর ২', thanaId: 'mirpur', popular: true },
              { id: 'mirpur-6', name: 'Mirpur 6', nameBn: 'মিরপুর ৬', thanaId: 'mirpur', popular: true },
              { id: 'mirpur-10', name: 'Mirpur 10', nameBn: 'মিরপুর ১০', thanaId: 'mirpur', popular: true },
              { id: 'mirpur-11', name: 'Mirpur 11', nameBn: 'মিরপুর ১১', thanaId: 'mirpur' },
              { id: 'mirpur-12', name: 'Mirpur 12', nameBn: 'মিরপুর ১২', thanaId: 'mirpur' },
              { id: 'mirpur-13', name: 'Mirpur 13', nameBn: 'মিরপুর ১৩', thanaId: 'mirpur' },
              { id: 'mirpur-14', name: 'Mirpur 14', nameBn: 'মিরপুর ১৪', thanaId: 'mirpur' },
              { id: 'pallabi', name: 'Pallabi', nameBn: 'পল্লবী', thanaId: 'mirpur' },
              { id: 'kazipara', name: 'Kazipara', nameBn: 'কাজীপাড়া', thanaId: 'mirpur' },
              { id: 'shyamoli', name: 'Shyamoli', nameBn: 'শ্যামলী', thanaId: 'mirpur' }
            ]
          },
          {
            id: 'banani',
            name: 'Banani',
            nameBn: 'বনানী',
            districtId: 'dhaka-district',
            areas: [
              { id: 'banani-road-11', name: 'Banani Road 11', nameBn: 'বনানী রোড ১১', thanaId: 'banani', popular: true },
              { id: 'banani-road-12', name: 'Banani Road 12', nameBn: 'বনানী রোড ১২', thanaId: 'banani' },
              { id: 'banani-road-13', name: 'Banani Road 13', nameBn: 'বনানী রোড ১৩', thanaId: 'banani' },
              { id: 'banani-road-14', name: 'Banani Road 14', nameBn: 'বনানী রোড ১৪', thanaId: 'banani' },
              { id: 'banani-road-15', name: 'Banani Road 15', nameBn: 'বনানী রোড ১৫', thanaId: 'banani' },
              { id: 'banani-road-16', name: 'Banani Road 16', nameBn: 'বনানী রোড ১৬', thanaId: 'banani' },
              { id: 'banani-road-17', name: 'Banani Road 17', nameBn: 'বনানী রোড ১৭', thanaId: 'banani' },
              { id: 'banani-chairmanbari', name: 'Banani Chairmanbari', nameBn: 'বনানী চেয়ারম্যানবাড়ী', thanaId: 'banani' }
            ]
          },
          {
            id: 'mohammadpur',
            name: 'Mohammadpur',
            nameBn: 'মোহাম্মদপুর',
            districtId: 'dhaka-district',
            areas: [
              { id: 'mohammadpur-housing', name: 'Mohammadpur Housing', nameBn: 'মোহাম্মদপুর হাউজিং', thanaId: 'mohammadpur', popular: true },
              { id: 'mohammadpur-krishi-market', name: 'Mohammadpur Krishi Market', nameBn: 'মোহাম্মদপুর কৃষি মার্কেট', thanaId: 'mohammadpur' },
              { id: 'mohammadpur-town-hall', name: 'Mohammadpur Town Hall', nameBn: 'মোহাম্মদপুর টাউন হল', thanaId: 'mohammadpur' },
              { id: 'mohammadpur-geneva-camp', name: 'Mohammadpur Geneva Camp', nameBn: 'মোহাম্মদপুর জেনেভা ক্যাম্প', thanaId: 'mohammadpur' },
              { id: 'mohammadpur-pc-culture', name: 'Mohammadpur PC Culture', nameBn: 'মোহাম্মদপুর পিসি কালচার', thanaId: 'mohammadpur' },
              { id: 'mohammadpur-tajmahal-road', name: 'Mohammadpur Tajmahal Road', nameBn: 'মোহাম্মদপুর তাজমহল রোড', thanaId: 'mohammadpur' }
            ]
          },
          {
            id: 'bashundhara',
            name: 'Bashundhara',
            nameBn: 'বসুন্ধরা',
            districtId: 'dhaka-district',
            areas: [
              { id: 'bashundhara-ra', name: 'Bashundhara R/A', nameBn: 'বসুন্ধরা আর/এ', thanaId: 'bashundhara', popular: true },
              { id: 'bashundhara-block-a', name: 'Bashundhara Block A', nameBn: 'বসুন্ধরা ব্লক এ', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-b', name: 'Bashundhara Block B', nameBn: 'বসুন্ধরা ব্লক বি', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-c', name: 'Bashundhara Block C', nameBn: 'বসুন্ধরা ব্লক সি', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-d', name: 'Bashundhara Block D', nameBn: 'বসুন্ধরা ব্লক ডি', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-e', name: 'Bashundhara Block E', nameBn: 'বসুন্ধরা ব্লক ই', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-f', name: 'Bashundhara Block F', nameBn: 'বসুন্ধরা ব্লক এফ', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-g', name: 'Bashundhara Block G', nameBn: 'বসুন্ধরা ব্লক জি', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-h', name: 'Bashundhara Block H', nameBn: 'বসুন্ধরা ব্লক এইচ', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-i', name: 'Bashundhara Block I', nameBn: 'বসুন্ধরা ব্লক আই', thanaId: 'bashundhara' },
              { id: 'bashundhara-block-j', name: 'Bashundhara Block J', nameBn: 'বসুন্ধরা ব্লক জে', thanaId: 'bashundhara' }
            ]
          },
          {
            id: 'old-dhaka',
            name: 'Old Dhaka',
            nameBn: 'পুরান ঢাকা',
            districtId: 'dhaka-district',
            areas: [
              { id: 'lalbagh', name: 'Lalbagh', nameBn: 'লালবাগ', thanaId: 'old-dhaka', popular: true },
              { id: 'chawkbazar', name: 'Chawkbazar', nameBn: 'চকবাজার', thanaId: 'old-dhaka', popular: true },
              { id: 'sutrapur', name: 'Sutrapur', nameBn: 'সূত্রাপুর', thanaId: 'old-dhaka' },
              { id: 'kotwali-dhaka', name: 'Kotwali', nameBn: 'কোতোয়ালী', thanaId: 'old-dhaka' },
              { id: 'wari', name: 'Wari', nameBn: 'ওয়ারী', thanaId: 'old-dhaka' },
              { id: 'gandaria', name: 'Gandaria', nameBn: 'গেন্ডারিয়া', thanaId: 'old-dhaka' },
              { id: 'nawabganj', name: 'Nawabganj', nameBn: 'নবাবগঞ্জ', thanaId: 'old-dhaka' }
            ]
          },
          {
            id: 'tejgaon',
            name: 'Tejgaon',
            nameBn: 'তেজগাঁও',
            districtId: 'dhaka-district',
            areas: [
              { id: 'tejgaon-industrial', name: 'Tejgaon Industrial Area', nameBn: 'তেজগাঁও শিল্প এলাকা', thanaId: 'tejgaon', popular: true },
              { id: 'farmgate', name: 'Farmgate', nameBn: 'ফার্মগেট', thanaId: 'tejgaon', popular: true },
              { id: 'karwan-bazar', name: 'Karwan Bazar', nameBn: 'কারওয়ান বাজার', thanaId: 'tejgaon' },
              { id: 'kawran-bazar', name: 'Kawran Bazar', nameBn: 'কাওরান বাজার', thanaId: 'tejgaon' },
              { id: 'panthapath', name: 'Panthapath', nameBn: 'পান্থপথ', thanaId: 'tejgaon' },
              { id: 'indira-road', name: 'Indira Road', nameBn: 'ইন্দিরা রোড', thanaId: 'tejgaon' }
            ]
          }
        ]
      },
      {
        id: 'gazipur',
        name: 'Gazipur',
        nameBn: 'গাজীপুর',
        divisionId: 'dhaka',
        thanas: [
          {
            id: 'gazipur-sadar',
            name: 'Gazipur Sadar',
            nameBn: 'গাজীপুর সদর',
            districtId: 'gazipur',
            areas: [
              { id: 'joydebpur', name: 'Joydebpur', nameBn: 'জয়দেবপুর', thanaId: 'gazipur-sadar', popular: true },
              { id: 'board-bazar', name: 'Board Bazar', nameBn: 'বোর্ড বাজার', thanaId: 'gazipur-sadar' },
              { id: 'chandra', name: 'Chandra', nameBn: 'চন্দ্রা', thanaId: 'gazipur-sadar' }
            ]
          },
          {
            id: 'tongi',
            name: 'Tongi',
            nameBn: 'টঙ্গী',
            districtId: 'gazipur',
            areas: [
              { id: 'tongi-station', name: 'Tongi Station', nameBn: 'টঙ্গী স্টেশন', thanaId: 'tongi', popular: true },
              { id: 'tongi-college-gate', name: 'Tongi College Gate', nameBn: 'টঙ্গী কলেজ গেট', thanaId: 'tongi' },
              { id: 'cherag-ali', name: 'Cherag Ali', nameBn: 'চেরাগ আলী', thanaId: 'tongi' }
            ]
          }
        ]
      },
      {
        id: 'narayanganj',
        name: 'Narayanganj',
        nameBn: 'নারায়ণগঞ্জ',
        divisionId: 'dhaka',
        thanas: [
          {
            id: 'narayanganj-sadar',
            name: 'Narayanganj Sadar',
            nameBn: 'নারায়ণগঞ্জ সদর',
            districtId: 'narayanganj',
            areas: [
              { id: 'chashara', name: 'Chashara', nameBn: 'চাষাড়া', thanaId: 'narayanganj-sadar', popular: true },
              { id: 'bandar-narayanganj', name: 'Bandar', nameBn: 'বন্দর', thanaId: 'narayanganj-sadar' },
              { id: 'kadam-rasul', name: 'Kadam Rasul', nameBn: 'কদম রসুল', thanaId: 'narayanganj-sadar' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'chittagong',
    name: 'Chittagong',
    nameBn: 'চট্টগ্রাম',
    districts: [
      {
        id: 'chittagong-district',
        name: 'Chittagong',
        nameBn: 'চট্টগ্রাম',
        divisionId: 'chittagong',
        thanas: [
          {
            id: 'kotwali-ctg',
            name: 'Kotwali',
            nameBn: 'কোতোয়ালী',
            districtId: 'chittagong-district',
            areas: [
              { id: 'agrabad', name: 'Agrabad', nameBn: 'আগ্রাবাদ', thanaId: 'kotwali-ctg', popular: true },
              { id: 'new-market-ctg', name: 'New Market', nameBn: 'নিউ মার্কেট', thanaId: 'kotwali-ctg' },
              { id: 'anderkilla', name: 'Anderkilla', nameBn: 'আন্দরকিল্লা', thanaId: 'kotwali-ctg' }
            ]
          },
          {
            id: 'panchlaish',
            name: 'Panchlaish',
            nameBn: 'পাঁচলাইশ',
            districtId: 'chittagong-district',
            areas: [
              { id: 'cda-avenue', name: 'CDA Avenue', nameBn: 'সিডিএ এভিনিউ', thanaId: 'panchlaish', popular: true },
              { id: 'khulshi', name: 'Khulshi', nameBn: 'খুলশী', thanaId: 'panchlaish', popular: true },
              { id: 'nasirabad', name: 'Nasirabad', nameBn: 'নাসিরাবাদ', thanaId: 'panchlaish', popular: true },
              { id: 'o-r-nizam-road', name: 'O R Nizam Road', nameBn: 'ও আর নিজাম রোড', thanaId: 'panchlaish' },
              { id: 'mehedibagh', name: 'Mehedibagh', nameBn: 'মেহেদীবাগ', thanaId: 'panchlaish' }
            ]
          },
          {
            id: 'halishahar',
            name: 'Halishahar',
            nameBn: 'হালিশহর',
            districtId: 'chittagong-district',
            areas: [
              { id: 'halishahar-housing', name: 'Halishahar Housing Estate', nameBn: 'হালিশহর হাউজিং এস্টেট', thanaId: 'halishahar', popular: true },
              { id: 'port-connecting-road', name: 'Port Connecting Road', nameBn: 'পোর্ট কানেক্টিং রোড', thanaId: 'halishahar' },
              { id: 'bandar-ctg', name: 'Bandar', nameBn: 'বন্দর', thanaId: 'halishahar' }
            ]
          },
          {
            id: 'chandgaon',
            name: 'Chandgaon',
            nameBn: 'চাঁদগাঁও',
            districtId: 'chittagong-district',
            areas: [
              { id: 'chandgaon-residential', name: 'Chandgaon Residential Area', nameBn: 'চাঁদগাঁও আবাসিক এলাকা', thanaId: 'chandgaon', popular: true },
              { id: 'oxygen-more', name: 'Oxygen More', nameBn: 'অক্সিজেন মোড়', thanaId: 'chandgaon' },
              { id: 'muradpur', name: 'Muradpur', nameBn: 'মুরাদপুর', thanaId: 'chandgaon' }
            ]
          },
          {
            id: 'bayazid',
            name: 'Bayazid',
            nameBn: 'বায়েজিদ',
            districtId: 'chittagong-district',
            areas: [
              { id: 'bayazid-bostami', name: 'Bayazid Bostami', nameBn: 'বায়েজিদ বোস্তামী', thanaId: 'bayazid', popular: true },
              { id: 'nasirabad-bayazid', name: 'Nasirabad', nameBn: 'নাসিরাবাদ', thanaId: 'bayazid' },
              { id: 'sholoshahar', name: 'Sholoshahar', nameBn: 'ষোলশহর', thanaId: 'bayazid' }
            ]
          }
        ]
      },
      {
        id: 'coxs-bazar',
        name: "Cox's Bazar",
        nameBn: 'কক্সবাজার',
        divisionId: 'chittagong',
        thanas: [
          {
            id: 'coxs-bazar-sadar',
            name: "Cox's Bazar Sadar",
            nameBn: 'কক্সবাজার সদর',
            districtId: 'coxs-bazar',
            areas: [
              { id: 'kolatoli', name: 'Kolatoli', nameBn: 'কলাতলী', thanaId: 'coxs-bazar-sadar', popular: true },
              { id: 'laboni-beach', name: 'Laboni Beach', nameBn: 'লাবনী বিচ', thanaId: 'coxs-bazar-sadar', popular: true },
              { id: 'sugandha-beach', name: 'Sugandha Beach', nameBn: 'সুগন্ধা বিচ', thanaId: 'coxs-bazar-sadar' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      {
        id: 'sylhet-district',
        name: 'Sylhet',
        nameBn: 'সিলেট',
        divisionId: 'sylhet',
        thanas: [
          {
            id: 'sylhet-sadar',
            name: 'Sylhet Sadar',
            nameBn: 'সিলেট সদর',
            districtId: 'sylhet-district',
            areas: [
              { id: 'zindabazar', name: 'Zindabazar', nameBn: 'জিন্দাবাজার', thanaId: 'sylhet-sadar', popular: true },
              { id: 'ambarkhana', name: 'Ambarkhana', nameBn: 'আম্বরখানা', thanaId: 'sylhet-sadar', popular: true },
              { id: 'bandarbazar', name: 'Bandarbazar', nameBn: 'বন্দরবাজার', thanaId: 'sylhet-sadar', popular: true },
              { id: 'uposhohor-sylhet', name: 'Uposhohor', nameBn: 'উপশহর', thanaId: 'sylhet-sadar' },
              { id: 'tilagor', name: 'Tilagor', nameBn: 'তিলাগড়', thanaId: 'sylhet-sadar' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      {
        id: 'rajshahi-district',
        name: 'Rajshahi',
        nameBn: 'রাজশাহী',
        divisionId: 'rajshahi',
        thanas: [
          {
            id: 'boalia',
            name: 'Boalia',
            nameBn: 'বোয়ালিয়া',
            districtId: 'rajshahi-district',
            areas: [
              { id: 'shaheb-bazar', name: 'Shaheb Bazar', nameBn: 'সাহেব বাজার', thanaId: 'boalia', popular: true },
              { id: 'new-market-rajshahi', name: 'New Market', nameBn: 'নিউ মার্কেট', thanaId: 'boalia' },
              { id: 'kazla', name: 'Kazla', nameBn: 'কাজলা', thanaId: 'boalia' }
            ]
          },
          {
            id: 'motihar',
            name: 'Motihar',
            nameBn: 'মতিহার',
            districtId: 'rajshahi-district',
            areas: [
              { id: 'uposhohor-rajshahi', name: 'Uposhohor', nameBn: 'উপশহর', thanaId: 'motihar', popular: true },
              { id: 'padma-residential', name: 'Padma Residential Area', nameBn: 'পদ্মা আবাসিক এলাকা', thanaId: 'motihar' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'khulna',
    name: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      {
        id: 'khulna-district',
        name: 'Khulna',
        nameBn: 'খুলনা',
        divisionId: 'khulna',
        thanas: [
          {
            id: 'khulna-sadar',
            name: 'Khulna Sadar',
            nameBn: 'খুলনা সদর',
            districtId: 'khulna-district',
            areas: [
              { id: 'sonadanga', name: 'Sonadanga', nameBn: 'সোনাডাঙ্গা', thanaId: 'khulna-sadar', popular: true },
              { id: 'khalishpur', name: 'Khalishpur', nameBn: 'খালিশপুর', thanaId: 'khulna-sadar' },
              { id: 'doulatpur', name: 'Doulatpur', nameBn: 'দৌলতপুর', thanaId: 'khulna-sadar' }
            ]
          }
        ]
      },
      {
        id: 'jessore',
        name: 'Jessore',
        nameBn: 'যশোর',
        divisionId: 'khulna',
        thanas: [
          {
            id: 'jessore-sadar',
            name: 'Jessore Sadar',
            nameBn: 'যশোর সদর',
            districtId: 'jessore',
            areas: [
              { id: 'jessore-town', name: 'Jessore Town', nameBn: 'যশোর শহর', thanaId: 'jessore-sadar', popular: true },
              { id: 'kotwali-jessore', name: 'Kotwali', nameBn: 'কোতোয়ালী', thanaId: 'jessore-sadar' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'barisal',
    name: 'Barisal',
    nameBn: 'বরিশাল',
    districts: [
      {
        id: 'barisal-district',
        name: 'Barisal',
        nameBn: 'বরিশাল',
        divisionId: 'barisal',
        thanas: [
          {
            id: 'barisal-sadar',
            name: 'Barisal Sadar',
            nameBn: 'বরিশাল সদর',
            districtId: 'barisal-district',
            areas: [
              { id: 'band-road', name: 'Band Road', nameBn: 'ব্যান্ড রোড', thanaId: 'barisal-sadar', popular: true },
              { id: 'natullabad', name: 'Natullabad', nameBn: 'নাতুল্লাবাদ', thanaId: 'barisal-sadar' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      {
        id: 'rangpur-district',
        name: 'Rangpur',
        nameBn: 'রংপুর',
        divisionId: 'rangpur',
        thanas: [
          {
            id: 'rangpur-sadar',
            name: 'Rangpur Sadar',
            nameBn: 'রংপুর সদর',
            districtId: 'rangpur-district',
            areas: [
              { id: 'modern-mor', name: 'Modern Mor', nameBn: 'মডার্ন মোড়', thanaId: 'rangpur-sadar', popular: true },
              { id: 'station-road-rangpur', name: 'Station Road', nameBn: 'স্টেশন রোড', thanaId: 'rangpur-sadar' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      {
        id: 'mymensingh-district',
        name: 'Mymensingh',
        nameBn: 'ময়মনসিংহ',
        divisionId: 'mymensingh',
        thanas: [
          {
            id: 'mymensingh-sadar',
            name: 'Mymensingh Sadar',
            nameBn: 'ময়মনসিংহ সদর',
            districtId: 'mymensingh-district',
            areas: [
              { id: 'charpara', name: 'Charpara', nameBn: 'চরপাড়া', thanaId: 'mymensingh-sadar', popular: true },
              { id: 'kewatkhali', name: 'Kewatkhali', nameBn: 'কেওয়াতখালী', thanaId: 'mymensingh-sadar' }
            ]
          }
        ]
      }
    ]
  }
];

// Helper functions
export const getDivisions = (): Division[] => {
  return bangladeshDivisions;
};

export const getDistrictsForDivision = (divisionId: string): District[] => {
  const division = bangladeshDivisions.find(d => d.id === divisionId);
  return division ? division.districts : [];
};

export const getThanasForDistrict = (districtId: string): Thana[] => {
  for (const division of bangladeshDivisions) {
    const district = division.districts.find(d => d.id === districtId);
    if (district) {
      return district.thanas;
    }
  }
  return [];
};

export const getAreasForThana = (thanaId: string): Area[] => {
  for (const division of bangladeshDivisions) {
    for (const district of division.districts) {
      const thana = district.thanas.find(t => t.id === thanaId);
      if (thana) {
        return thana.areas;
      }
    }
  }
  return [];
};

export const searchDivisions = (query: string): Division[] => {
  if (!query) return bangladeshDivisions;
  
  const lowerQuery = query.toLowerCase();
  return bangladeshDivisions.filter(division => 
    division.name.toLowerCase().includes(lowerQuery) ||
    division.nameBn.includes(query)
  );
};

export const searchDistricts = (divisionId: string, query: string): District[] => {
  const districts = getDistrictsForDivision(divisionId);
  if (!query) return districts;
  
  const lowerQuery = query.toLowerCase();
  return districts.filter(district => 
    district.name.toLowerCase().includes(lowerQuery) ||
    district.nameBn.includes(query)
  );
};

export const searchThanas = (districtId: string, query: string): Thana[] => {
  const thanas = getThanasForDistrict(districtId);
  if (!query) return thanas;
  
  const lowerQuery = query.toLowerCase();
  return thanas.filter(thana => 
    thana.name.toLowerCase().includes(lowerQuery) ||
    thana.nameBn.includes(query)
  );
};

export const searchAreas = (thanaId: string, query: string): Area[] => {
  const areas = getAreasForThana(thanaId);
  if (!query) return areas;
  
  const lowerQuery = query.toLowerCase();
  return areas.filter(area => 
    area.name.toLowerCase().includes(lowerQuery) ||
    area.nameBn.includes(query)
  );
};

// Legacy compatibility functions
export const bangladeshCities = bangladeshDivisions.map(division => ({
  id: division.id,
  name: division.name,
  nameBn: division.nameBn,
  division: division.name + ' Division',
  divisionBn: division.nameBn + ' বিভাগ',
  areas: division.districts.flatMap(district => 
    district.thanas.flatMap(thana => 
      thana.areas.map(area => ({
        id: area.id,
        name: area.name,
        nameBn: area.nameBn,
        cityId: division.id,
        popular: area.popular
      }))
    )
  )
}));

export const getAreasForCity = (cityId: string) => {
  const city = bangladeshCities.find(c => c.id === cityId);
  return city ? city.areas : [];
};

export const searchCities = (query: string) => {
  if (!query) return bangladeshCities;
  
  const lowerQuery = query.toLowerCase();
  return bangladeshCities.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.nameBn.includes(query)
  );
};