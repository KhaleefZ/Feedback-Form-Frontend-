'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FiGrid,
  FiUser,
  FiKey,
  FiPlayCircle,
  FiBriefcase,
  FiPackage,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiCalendar,
  FiShare2,
  FiLinkedin,
  FiGlobe,
  FiInstagram,
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SupportModal from '@/components/SupportModal';
import { api } from '@/lib/api';

interface User {
  id: string;
  user_id: string;
  email: string;
  createdAt: string;
}

interface ProfileData {
  name: string;
  email: string;
  dob: string;
  gender: string;
  phone: string;
  about: string;
  linkedin: string;
  website: string;
  instagram: string;
  youtube: string;
  profilePhoto: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    dob: '',
    gender: '',
    phone: '',
    about: '',
    linkedin: '',
    website: '',
    instagram: '',
    youtube: '',
    profilePhoto: '',
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Fetch user data from backend
        try {
          const authResponse = await api.getMe(parsedUser.id);
          const backendUser = authResponse.user;
          
          // Update user state with backend data
          setUser({
            id: parsedUser.id,
            user_id: backendUser.user_id,
            email: backendUser.email,
            createdAt: parsedUser.createdAt || '',
          });
          
          // Fetch profile data
          try {
            const profileResponse = await api.getUserProfile(backendUser.user_id);
            const profileData = profileResponse.data;
            
            // Profile exists - set flag to show "Update" button
            setProfileExists(true);
            
            // Set form data from profile
            setFormData({
              name: profileData.name || backendUser.email.split('@')[0],
              email: backendUser.email,
              dob: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
              gender: profileData.gender || '',
              phone: profileData.phoneNumber || '',
              about: profileData.about || '',
              linkedin: profileData.socialMedia?.linkedin || '',
              website: profileData.socialMedia?.website || '',
              instagram: profileData.socialMedia?.instagram || '',
              youtube: profileData.socialMedia?.youtube || '',
              profilePhoto: profileData.profilePhoto || '',
            });
          } catch (profileError) {
            console.log('Profile not found, using defaults');
            // Profile doesn't exist - show "Save" button
            setProfileExists(false);
            // Set default form data if profile doesn't exist
            setFormData({
              name: backendUser.email.split('@')[0],
              email: backendUser.email,
              dob: '',
              gender: '',
              phone: '',
              about: '',
              linkedin: '',
              website: '',
              instagram: '',
              youtube: '',
              profilePhoto: '',
            });
          }
          
          setIsLoading(false);
        } catch (apiError) {
          console.error('Failed to fetch user from backend:', apiError);
          // Fallback to localStorage user
          setUser({
            id: parsedUser.id,
            user_id: parsedUser.user_id || '',
            email: parsedUser.email,
            createdAt: parsedUser.createdAt || '',
          });
          setFormData({
            name: parsedUser.email?.split('@')[0] || '',
            email: parsedUser.email || '',
            dob: '',
            gender: '',
            phone: '',
            about: '',
            linkedin: '',
            website: '',
            instagram: '',
            youtube: '',
            profilePhoto: '',
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      }
    };

    loadUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and GIF images are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Upload file to backend
      const uploadResponse = await api.uploadFile(file);
      const photoUrl = uploadResponse.url;

      // Update profile photo in backend
      if (user?.user_id) {
        await api.uploadProfilePhoto(user.user_id, photoUrl);
        
        // Update local state
        setFormData({ ...formData, profilePhoto: photoUrl });
        
        // Store in localStorage for persistence
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.profilePhoto = photoUrl;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }

        alert('Profile photo updated successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      alert(error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      if (user?.user_id) {
        await api.deleteProfilePhoto(user.user_id);
        
        // Update local state
        setFormData({ ...formData, profilePhoto: '' });
        
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.profilePhoto = '';
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }

        alert('Profile photo removed successfully!');
      }
    } catch (error: any) {
      console.error('Error removing photo:', error);
      alert(error.message || 'Failed to remove photo. Please try again.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setFormData({ ...formData, [name]: digitsOnly });
        // Clear error when user types
        if (validationErrors[name]) {
          setValidationErrors({ ...validationErrors, [name]: '' });
        }
      }
      return;
    }
    
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    // Name validation
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    // Gender validation (compulsory)
    if (!formData.gender || formData.gender.trim() === '') {
      errors.gender = 'Gender is required';
    }
    
    // Phone number validation (compulsory)
    if (!formData.phone || formData.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // About validation (compulsory)
    if (!formData.about || formData.about.trim() === '') {
      errors.about = 'About section is required';
    } else if (formData.about.length > 500) {
      errors.about = 'About section cannot exceed 500 characters';
    }
    
    // LinkedIn validation
    if (formData.linkedin) {
      if (formData.linkedin.includes('linkedin.com')) {
        const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/;
        if (!linkedinRegex.test(formData.linkedin)) {
          errors.linkedin = 'Invalid LinkedIn URL format';
        }
      }
    }
    
    // Website validation
    if (formData.website) {
      const websiteRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      if (!websiteRegex.test(formData.website)) {
        errors.website = 'Invalid website URL format (must start with http:// or https://)';
      }
    }
    
    // Instagram validation
    if (formData.instagram) {
      if (formData.instagram.includes('instagram.com')) {
        const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/[\w.-]+\/?$/;
        if (!instagramRegex.test(formData.instagram)) {
          errors.instagram = 'Invalid Instagram URL format';
        }
      } else {
        const usernameRegex = /^[\w.-]+$/;
        if (!usernameRegex.test(formData.instagram)) {
          errors.instagram = 'Invalid Instagram username format';
        }
      }
    }
    
    // YouTube validation
    if (formData.youtube) {
      if (formData.youtube.includes('youtube.com')) {
        const youtubeRegex = /^https?:\/\/(www\.)?youtube\.com\/(c|channel|@)[\w-]+\/?$/;
        if (!youtubeRegex.test(formData.youtube)) {
          errors.youtube = 'Invalid YouTube URL format';
        }
      } else if (formData.youtube.startsWith('@')) {
        const handleRegex = /^@[\w-]+$/;
        if (!handleRegex.test(formData.youtube)) {
          errors.youtube = 'Invalid YouTube handle format';
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      alert('Please fix the validation errors before saving');
      return;
    }
    
    setIsSaving(true);
    try {
      if (user?.user_id) {
        // Prepare profile data
        const profileData = {
          name: formData.name,
          email: formData.email,
          profilePhoto: formData.profilePhoto || null,
          dateOfBirth: formData.dob || null,
          gender: formData.gender,
          phoneNumber: formData.phone,
          countryCode: '+91',
          about: formData.about,
          socialMedia: {
            linkedin: formData.linkedin,
            website: formData.website,
            instagram: formData.instagram,
            youtube: formData.youtube,
          },
        };

        // Save to backend
        const response = await api.updateUserProfile(user.user_id, profileData);
        
        // Update profile exists flag
        setProfileExists(true);
        
        alert(profileExists ? 'Profile updated successfully!' : 'Profile saved successfully!');
        console.log('Profile saved:', response);
      } else {
        alert('User ID not found. Please login again.');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      
      // Check if error has validation messages
      if (error.message && error.message.includes('[')) {
        try {
          const messages = JSON.parse(error.message.replace('Bad Request: ', ''));
          if (Array.isArray(messages)) {
            alert('Validation errors:\n' + messages.join('\n'));
          } else {
            alert(error.message || 'Failed to save profile. Please try again.');
          }
        } catch {
          alert(error.message || 'Failed to save profile. Please try again.');
        }
      } else {
        alert(error.message || 'Failed to save profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      if (user?.user_id) {
        const response = await api.shareProfile(user.user_id);
        const shareUrl = response.shareUrl;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Profile link copied to clipboard!');
        console.log('Share URL:', shareUrl);
      } else {
        alert('User ID not found. Please login again.');
      }
    } catch (error: any) {
      console.error('Error sharing profile:', error);
      alert(error.message || 'Failed to generate share link. Please try again.');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { icon: FiGrid, label: 'Dashboard', active: true },
    { icon: FiUser, label: 'Profile', active: false },
    { icon: FiKey, label: 'Skill Repository', active: false },
    { icon: FiPlayCircle, label: 'Learnings', active: false },
    {
      icon: FiBriefcase,
      label: 'Jobs',
      active: false,
      submenu: ['Offers', 'Applied'],
    },
    {
      icon: FiPackage,
      label: 'Tools',
      active: false,
      submenu: ['YouTube to Course', 'One Click Resume', 'AI Assessment'],
    },
  ];

  const profileSections = [
    'Basic Profile',
    'Education',
    'Work Experiences',
    'Licenses & Certifications',
    'Projects',
    'Other Activities',
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="px-6 py-6 flex items-start justify-between border-b">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                <Image 
                  src="/logo.svg" 
                  alt="Record Logo" 
                  width={48} 
                  height={48}
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 leading-none">
                  Record
                </h1>
                <p className="text-sm text-gray-500 mt-1">v1.0.1</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-600"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition text-sm font-medium
                    ${
                      item.active
                        ? 'text-orange-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
                {item.submenu && (
                  <div className="relative ml-9 mt-1 space-y-1 pl-3">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                    {item.submenu.map((sub, idx) => (
                      <div
                        key={idx}
                        className="relative text-sm text-gray-600 px-3 py-1 cursor-pointer hover:text-gray-900"
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Support Section */}
          <div className="p-4 space-y-2 text-sm text-gray-600 border-t">
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-gray-900"
              onClick={() => setIsSupportModalOpen(true)}
            >
              <FiCalendar size={16} />
              <span>Support</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
              <FiShare2 size={16} />
              <span>Feedback</span>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Privacy Policy | Terms & Conditions
              <br />© 2025 Record Innovation and
              <br />
              Enterprises Pvt. Ltd.
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-semibold">Profile</h1>
            <span className="text-gray-400 hidden sm:inline">›</span>
            <span className="text-sm text-gray-600 hidden sm:inline">
              Basic Info
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:flex gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-purple-600"
              >
                <path d="M12 2L9 9L2 9L7.5 13.5L5.5 21L12 16L18.5 21L16.5 13.5L22 9L15 9L12 2Z" />
              </svg>
              <span>Premium</span>
            </Button>
            <Button size="icon" variant="orange" className="rounded">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Button>
            <Button size="icon" variant="ghost">
              <FiBell size={20} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={formData.profilePhoto} alt={formData.name} />
                    <AvatarFallback>
                      {formData.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {formData.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {formData.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <FiLogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex gap-6 p-4 sm:p-6 md:p-8 overflow-hidden">
          {/* Left Sidebar - Profile Sections */}
          <div className="hidden lg:block w-64 flex-shrink-0 overflow-y-auto">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="text-center mb-8">
                  <div className="relative w-24 h-24 mx-auto mb-3 group">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={formData.profilePhoto} alt={formData.name} />
                      <AvatarFallback className="text-2xl">
                        {formData.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer">
                      <input
                        type="file"
                        id="sidebar-photo-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={isUploadingPhoto}
                      />
                      <label
                        htmlFor="sidebar-photo-upload"
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center gap-1"
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-xs text-white font-medium">
                          {isUploadingPhoto ? 'Uploading...' : 'Change'}
                        </span>
                      </label>
                    </div>
                  </div>
                  {formData.profilePhoto && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove Photo
                    </Button>
                  )}
                  <h2 className="text-lg font-semibold mt-2">{formData.name}</h2>
                </div>

                <div className="space-y-6">
                  {profileSections.map((section, index) => (
                    <div
                      key={index}
                      className={`
                      text-sm cursor-pointer text-left
                      ${
                        index === 0
                          ? 'text-orange-500 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                    >
                      {section}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="flex-1 overflow-y-auto">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Basic Profile</CardTitle>
                    <CardDescription>
                      Information about your profile, including all your personal
                      details. You can also add your social media links to your
                      profile.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-initial"
                      onClick={handleShare}
                    >
                      <FiShare2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="orange"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 sm:flex-initial"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`bg-gray-100 ${validationErrors.name ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      className="bg-gray-100 border-gray-300 text-gray-900 cursor-not-allowed"
                      tabIndex={-1}
                    />
                  </div>
                </div>

                {/* DOB & Gender Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dob">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dob"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className="bg-gray-100"
                    />
                    {validationErrors.dob && (
                      <p className="text-sm text-red-600">{validationErrors.dob}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger className={`bg-gray-100 ${validationErrors.gender ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.gender && (
                      <p className="text-sm text-red-600">{validationErrors.gender}</p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value="+91"
                      disabled
                      className="w-20 text-center bg-gray-100"
                    />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10 digit number"
                      maxLength={10}
                      className={`flex-1 bg-gray-100 ${validationErrors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                  {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                    <p className="text-xs text-gray-500">{formData.phone.length}/10 digits</p>
                  )}
                </div>

                {/* About */}
                <div className="space-y-2">
                  <Label htmlFor="about">About <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className={`resize-none bg-gray-100 ${validationErrors.about ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.about && (
                    <p className="text-sm text-red-600">{validationErrors.about}</p>
                  )}
                  <div className="flex justify-between text-sm">
                    <p className="text-orange-500">
                      Rephrase with AI (limit - 5/5)
                    </p>
                    <p className="text-muted-foreground">
                      Character remaining {500 - formData.about.length}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is the first thing people learn about you after your
                    name.
                  </p>
                </div>

                {/* Social Media Section */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-1">Social Media</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Please note: You only need to include your{' '}
                    <span className="font-medium">username</span>.
                  </p>

                  <div className="space-y-4">
                    {/* LinkedIn */}
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className={`flex items-center border rounded-md overflow-hidden bg-gray-100 ${validationErrors.linkedin ? 'border-red-500' : ''}`}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                          <FiLinkedin size={20} className="text-blue-600" />
                          <span className="text-sm text-gray-600">
                            linkedin.com/in/
                          </span>
                        </div>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="username or full URL"
                          className="border-0 focus-visible:ring-0 bg-gray-100"
                        />
                      </div>
                      {validationErrors.linkedin && (
                        <p className="text-sm text-red-600">{validationErrors.linkedin}</p>
                      )}
                    </div>

                    {/* Personal Website */}
                    <div className="space-y-2">
                      <Label htmlFor="website">Personal Website</Label>
                      <div className={`flex items-center border rounded-md overflow-hidden bg-gray-100 ${validationErrors.website ? 'border-red-500' : ''}`}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                          <FiGlobe size={20} className="text-gray-600" />
                          <span className="text-sm text-gray-600">https://</span>
                        </div>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="yourwebsite.com"
                          className="border-0 focus-visible:ring-0 bg-gray-100"
                        />
                      </div>
                      {validationErrors.website && (
                        <p className="text-sm text-red-600">{validationErrors.website}</p>
                      )}
                    </div>

                    {/* Instagram */}
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className={`flex items-center border rounded-md overflow-hidden bg-gray-100 ${validationErrors.instagram ? 'border-red-500' : ''}`}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                          <FiInstagram size={20} className="text-pink-600" />
                          <span className="text-sm text-gray-600">
                            instagram.com/
                          </span>
                        </div>
                        <Input
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleChange}
                          placeholder="username or full URL"
                          className="border-0 focus-visible:ring-0 bg-gray-100"
                        />
                      </div>
                      {validationErrors.instagram && (
                        <p className="text-sm text-red-600">{validationErrors.instagram}</p>
                      )}
                    </div>

                    {/* YouTube */}
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <div className={`flex items-center border rounded-md overflow-hidden bg-gray-100 ${validationErrors.youtube ? 'border-red-500' : ''}`}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            youtube.com/@
                          </span>
                        </div>
                        <Input
                          id="youtube"
                          name="youtube"
                          value={formData.youtube}
                          onChange={handleChange}
                          placeholder="@username or full URL"
                          className="border-0 focus-visible:ring-0 bg-gray-100"
                        />
                      </div>
                      {validationErrors.youtube && (
                        <p className="text-sm text-red-600">{validationErrors.youtube}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        userEmail={formData.email}
        userId={user?.user_id || ''}
        userName={formData.name}
      />
    </div>
  );
}
