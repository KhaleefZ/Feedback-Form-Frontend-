'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { api } from '@/lib/api';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      router.push('/dashboard');
    }
  }, [router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors as user types
    setErrors({ ...errors, [name]: '', general: '' });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error = '';
    
    if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'password') {
      error = validatePassword(value);
    }
    
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: '',
      });
      return;
    }

    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      // Extract name from email (before @)
      const name = formData.email.split('@')[0];
      
      const response = await api.signup(
        formData.email,
        formData.password
      );
      
      // Don't store user data or login automatically
      // Show success message and redirect to login page
      alert('Account created successfully! Please login with your credentials.');
      router.push('/login');
    } catch (err: any) {
      // Check if it's a duplicate email error
      const errorMessage = err.message || 'Signup failed. Please try again.';
      if (errorMessage.toLowerCase().includes('already exists') || 
          errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('already registered')) {
        setErrors({
          email: 'This email is already registered. Please use a different email or login.',
          password: '',
          general: '',
        });
      } else {
        setErrors({
          email: '',
          password: '',
          general: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-8 ultra-narrow split-optimize" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 mb-4 sm:mb-6 lg:mb-8">SIGN UP</h1>
        
        {errors.general && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-400' 
                  : 'border-gray-300 focus:ring-pink-400 focus:border-transparent'
              }`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="mb-5 sm:mb-6">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-400' 
                  : 'border-gray-300 focus:ring-pink-400 focus:border-transparent'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>
            )}
            {!errors.password && formData.password && (
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters with uppercase, lowercase, and number
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-pink-500 hover:to-pink-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
          </button>
        </form>

        <div className="flex items-center my-4 sm:my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-3 sm:gap-4">
          <button
            type="button"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-50 transition"
            title="Sign up with Google"
          >
            <FaGoogle size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
            title="Sign up with Facebook"
          >
            <FaFacebookF size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-700 flex items-center justify-center text-blue-700 hover:bg-blue-50 transition"
            title="Sign up with LinkedIn"
          >
            <FaLinkedinIn size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <span className="text-xs sm:text-sm text-gray-500">
            Already a user?{' '}
            <Link href="/login" className="text-gray-700 font-semibold hover:underline">
              LOGIN
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
