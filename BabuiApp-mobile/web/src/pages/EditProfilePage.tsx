import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from '../stores/authStore';

interface ProfileData {
  name: string;
  nameBn: string;
  email: string;
  phone: string;
  location: string;
  locationBn: string;
  bio: string;
  bioBn: string;
  avatar: string;
}

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'John Doe',
    nameBn: 'জন ডো',
    email: 'john.doe@example.com',
    phone: '+880 1712-345678',
    location: 'Dhaka, Bangladesh',
    locationBn: 'ঢাকা, বাংলাদেশ',
    bio: 'Looking for a comfortable place to stay in Dhaka.',
    bioBn: 'ঢাকায় থাকার জন্য একটি আরামদায়ক জায়গা খুঁজছি।',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150&h=150&fit=crop&crop=face'
  });

  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const currentUser = useAuthStore((state) => state.user);

  // Debug: Log current user before upload
  React.useEffect(() => {
    import('../utils/supabaseClient').then(({ supabase }) => {
      supabase.auth.getUser().then((user) => {
        console.log('Current Supabase user:', user);
      });
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.id) return;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      if (data) setProfileData({
        name: data.name_en || '',
        nameBn: data.name_bn || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location_en || '',
        locationBn: data.location_bn || '',
        bio: data.bio_en || '',
        bioBn: data.bio_bn || '',
        avatar: data.profile_picture_url || '',
      });
    };
    fetchProfile();
  }, [currentUser]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }
    let avatarUrl = profileData.avatar;
    // Upload avatar if a new file is selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `public/${currentUser.id}/avatar.${fileExt}`;
      // Debug: Log file and path
      console.log('Uploading avatar file:', avatarFile, 'to path:', filePath);
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures') // changed from 'avatars'
        .upload(filePath, avatarFile, { upsert: true });
      // Debug: Log upload error if any
      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        alert('Avatar upload failed: ' + uploadError.message);
      } else {
        const { data: urlData } = supabase.storage
          .from('profile-pictures') // changed from 'avatars'
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      }
    }
    const updates = {
      name_en: profileData.name,
      name_bn: profileData.nameBn,
      location_en: profileData.location,
      location_bn: profileData.locationBn,
      bio_en: profileData.bio,
      bio_bn: profileData.bioBn,
      profile_picture_url: avatarUrl,
    };
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', currentUser.id);
    setIsLoading(false);
    if (!error) navigate('/profile');
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>{t('back', 'ফিরে যান', 'Back')}</span>
            </button>
            
            <h1 className="text-xl font-bold text-gray-900">
              {t('edit-profile', 'প্রোফাইল সম্পাদনা', 'Edit Profile')}
            </h1>
            
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profile-picture', 'প্রোফাইল ছবি', 'Profile Picture')}
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={avatarPreview || profileData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div>
                <label className="cursor-pointer">
                  <span className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors inline-flex items-center gap-2">
                    <Camera size={16} />
                    {t('change-photo', 'ছবি পরিবর্তন করুন', 'Change Photo')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  {t('photo-requirements', 'JPG, PNG (সর্বোচ্চ 2MB)', 'JPG, PNG (Max 2MB)')}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('personal-information', 'ব্যক্তিগত তথ্য', 'Personal Information')}
            </h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('name-english', 'নাম (ইংরেজি)', 'Name (English)')} *
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('name-bengali', 'নাম (বাংলা)', 'Name (Bengali)')} *
                  </label>
                  <input
                    type="text"
                    value={profileData.nameBn}
                    onChange={(e) => handleInputChange('nameBn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email-address', 'ইমেইল ঠিকানা', 'Email Address')} *
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone-number', 'ফোন নম্বর', 'Phone Number')} *
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('location-english', 'অবস্থান (ইংরেজি)', 'Location (English)')}
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('location-bengali', 'অবস্থান (বাংলা)', 'Location (Bengali)')}
                  </label>
                  <input
                    type="text"
                    value={profileData.locationBn}
                    onChange={(e) => handleInputChange('locationBn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="ঢাকা, বাংলাদেশ"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('bio-english', 'বায়ো (ইংরেজি)', 'Bio (English)')}
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('bio-bengali', 'বায়ো (বাংলা)', 'Bio (Bengali)')}
                  </label>
                  <textarea
                    value={profileData.bioBn}
                    onChange={(e) => handleInputChange('bioBn', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="নিজের সম্পর্কে বলুন..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
                ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600'
                } text-white
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {t('saving', 'সংরক্ষণ করা হচ্ছে...', 'Saving...')}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {t('save-changes', 'পরিবর্তন সংরক্ষণ করুন', 'Save Changes')}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProfilePage;