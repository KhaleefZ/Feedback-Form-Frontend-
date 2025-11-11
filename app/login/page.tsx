'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
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
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Clear errors as user types
    if (name !== 'rememberMe') {
      setErrors({ ...errors, [name]: '', general: '' });
    }
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
      const response = await api.login(formData.email, formData.password);
      
      // Store user data (backend returns { message, user })
      const userData = response.user || response;
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setErrors({
        email: '',
        password: '',
        general: err.message || 'Invalid email or password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-8 ultra-narrow split-optimize" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 mb-4 sm:mb-6 lg:mb-8">LOGIN</h1>
        
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

          <div className="mb-3 sm:mb-4">
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
          </div>

          <div className="flex items-center mb-5 sm:mb-6">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-400 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="ml-2 text-xs sm:text-sm text-gray-500 cursor-pointer">
              Remember me?
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:from-pink-500 hover:to-pink-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-3 sm:mt-4 text-right">
          <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition">
            Forgot Password?
          </a>
        </div>

        <div className="flex items-center my-4 sm:my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 sm:px-4 text-xs sm:text-sm text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-3 sm:gap-4">
          <button
            type="button"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-50 transition"
            title="Login with Google"
          >
            <FaGoogle size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-600 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
            title="Login with Facebook"
          >
            <FaFacebookF size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-700 flex items-center justify-center text-blue-700 hover:bg-blue-50 transition"
            title="Login with LinkedIn"
          >
            <FaLinkedinIn size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="mt-5 sm:mt-6 text-center">
          <span className="text-xs sm:text-sm text-gray-500">
            Need an account?{' '}
            <Link href="/signup" className="text-gray-700 font-semibold hover:underline">
              SIGN UP
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
