"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Shield, Zap, UserCheck, Briefcase, Phone, Lock, User, MapPin, Eye, EyeOff, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';

const countryCodes = [
  { code: '+221', country: 'Senegal', flag: '🇸🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
];

const senegalCities = [
  'Dakar',
  'Thiès',
  'Kaolack',
  'Ziguinchor',
  'Saint-Louis',
  'Tambacounda',
  'Mbour',
  'Diourbel',
  'Louga',
  'Kolda',
  'Fatick',
  'Kaffrine',
  'Kédougou',
  'Matam',
  'Sédhiou'
];

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithPhone, signup, continueAsGuest, loading } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<'welcome' | 'signin' | 'signup'>('welcome');
  const [userType, setUserType] = useState<'seeker' | 'provider'>('seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Sign in form
  const [signInData, setSignInData] = useState({
    countryCode: '+221',
    phone: '',
    password: ''
  });
  
  // Sign up form
  const [signUpData, setSignUpData] = useState({
    countryCode: '+221',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
    cities: [] as string[],
    userType: 'seeker' as 'seeker' | 'provider'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const citiesRef = useRef<HTMLDivElement | null>(null);

  // Close cities dropdown on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!showCitiesDropdown) return;
      if (citiesRef.current && !citiesRef.current.contains(e.target as Node)) {
        setShowCitiesDropdown(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCitiesDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showCitiesDropdown]);

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signUpData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!signUpData.password) newErrors.password = 'Password is required';
    if (signUpData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (signUpData.password && !/(?=.*[a-zA-Z])/.test(signUpData.password)) newErrors.password = 'Password must contain at least one letter';
    if (signUpData.password && !/(?=.*\d)/.test(signUpData.password)) newErrors.password = 'Password must contain at least one number';
    if (signUpData.password !== signUpData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!signUpData.name.trim()) newErrors.name = 'Name is required';
    if (signUpData.cities.length === 0) newErrors.cities = 'At least one city is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signInData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!signInData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateSignUp()) return;
    
    try {
      await signup({
        ...signUpData,
        city: signUpData.cities.join(', '),
        language: lang,
      });
      const returnTo = searchParams?.get('returnTo');
      if (returnTo) {
        router.replace(returnTo);
      } else {
        router.replace(signUpData.userType === 'provider' ? '/provider/profile' : '/seeker/services');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Sign up failed. Please try again.');
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateSignIn()) return;
    
    try {
      const fullPhone = `${signInData.countryCode}${signInData.phone}`;
      await loginWithPhone(fullPhone, signInData.password, userType);
      const returnTo = searchParams?.get('returnTo');
      if (returnTo) {
        router.replace(returnTo);
      } else {
        router.replace(userType === 'provider' ? '/provider/profile' : '/seeker/services');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Sign in failed. Please check credentials.');
    }
  };

  const toggleCity = (city: string) => {
    setSignUpData(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city]
    }));
  };

  const removeCity = (city: string) => {
    setSignUpData(prev => ({
      ...prev,
      cities: prev.cities.filter(c => c !== city)
    }));
  };

  if (mode === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 ml-2">Trust Network</h1>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.createAccount') || 'Create Account'}</h2>
            <p className="text-gray-700 mb-4">{t('auth.join') || 'Join the trusted network'}</p>
            {/* Language toggle (signup only) */}
            <div className="flex justify-center mb-2">
              <div className="inline-flex rounded-full bg-gray-100 p-1" role="radiogroup" aria-label="Language">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'fr', label: 'Français' },
                  { id: 'wo', label: 'Wolof' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={lang === opt.id}
                    onClick={() => setLang(opt.id)}
                    className={`${lang === opt.id ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700'} px-4 py-1.5 text-sm rounded-full mx-0.5 border ${lang === opt.id ? 'border-indigo-600' : 'border-transparent'} font-medium`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Avatar handled later in Profile tab. Default initial will be used. */}
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.iAm') || 'I am a'}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSignUpData({ ...signUpData, userType: 'seeker' })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    signUpData.userType === 'seeker'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <UserCheck className="w-5 h-5 mx-auto mb-1" />
                  {t('role.seeker') || 'Seeker'}
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpData({ ...signUpData, userType: 'provider' })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    signUpData.userType === 'provider'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mx-auto mb-1" />
                  {t('role.provider') || 'Provider'}
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName') || 'Full Name'}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                  placeholder={t('auth.fullNamePh') || 'Enter your full name'}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.whatsAppPhone') || 'WhatsApp Phone Number'}</label>
              <div className="flex space-x-2">
                <select
                  value={signUpData.countryCode}
                  onChange={(e) => setSignUpData({ ...signUpData, countryCode: e.target.value })}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  {countryCodes.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder={t('auth.phonePh') || '70 123 4567'}
                  />
                </div>
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.cities') || 'Cities'}</label>
              <div className="relative" ref={citiesRef}>
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <div
                  onClick={() => setShowCitiesDropdown(!showCitiesDropdown)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer min-h-[48px] flex items-center"
                >
                  <div className="flex-1">
                    {signUpData.cities.length === 0 ? (
                      <span className="text-gray-400">{t('auth.selectCities') || 'Select cities'}</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {signUpData.cities.map(city => (
                          <span
                            key={city}
                            className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-sm flex items-center"
                          >
                            {city}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCity(city);
                              }}
                              className="ml-1 hover:text-indigo-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                
                {/* Dropdown */}
                {showCitiesDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {senegalCities.map(city => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between ${
                          signUpData.cities.includes(city) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                        }`}
                      >
                        {city}
                        {signUpData.cities.includes(city) && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.cities && <p className="text-red-500 text-sm mt-1">{errors.cities}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password') || 'Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                  placeholder={t('auth.createPassword') || 'Create a password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword') || 'Confirm Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                  placeholder={t('auth.confirmPasswordPh') || 'Confirm your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {submitError && (
              <p className="text-red-600 text-sm mt-2" role="alert">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (t('auth.creating') || 'Creating Account...') : (t('auth.createAccount') || 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700">
              {t('auth.alreadyHave') || 'Already have an account?'}{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {t('auth.signIn') || 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'signin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 ml-2">Trust Network</h1>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.welcomeBack') || 'Welcome Back'}</h2>
            <p className="text-gray-700 mb-4">{t('auth.signInSubtitle') || 'Sign in to your account'}</p>
            {/* Language is selected on profile after signup; no toggle here */}
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.iAm') || 'I am a'}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('seeker')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  userType === 'seeker'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                }`}
              >
                <UserCheck className="w-5 h-5 mx-auto mb-1" />
                {t('role.seeker') || 'Seeker'}
              </button>
              <button
                type="button"
                onClick={() => setUserType('provider')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  userType === 'provider'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                }`}
              >
                <Briefcase className="w-5 h-5 mx-auto mb-1" />
                {t('role.provider') || 'Provider'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone') || 'Phone Number'}</label>
              <div className="flex space-x-2">
                <select
                  value={signInData.countryCode}
                  onChange={(e) => setSignInData({ ...signInData, countryCode: e.target.value })}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  {countryCodes.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={signInData.phone}
                    onChange={(e) => setSignInData({ ...signInData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder={t('auth.phonePh') || '70 123 4567'}
                  />
                </div>
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password') || 'Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {submitError && (
              <p className="text-red-600 text-sm mt-2" role="alert">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (t('auth.signingIn') || 'Signing In...') : (t('auth.signIn') || 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700">
              {t('auth.dontHave') || "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {t('auth.createAccount') || 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Public language toggle for visitors */}
      <div className="w-full bg-transparent">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-end">
          <div className="inline-flex rounded-full bg-gray-100 p-1" role="radiogroup" aria-label="Language">
            {[
              { id: 'en', label: 'English' },
              { id: 'fr', label: 'Français' },
              { id: 'wo', label: 'Wolof' },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={lang === opt.id}
                onClick={() => setLang(opt.id)}
                className={`${lang === opt.id ? 'bg-indigo-600 text-white' : 'bg-transparent text-gray-700'} px-4 py-1.5 text-sm rounded-full mx-0.5 border ${lang === opt.id ? 'border-indigo-600' : 'border-transparent'} font-medium`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 ml-3">{t('app.title')}</h1>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {t('landing.tagline') || 'Digitizing trust through verified recommendations. Connect with reliable service providers through your network.'}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-lg border-2 border-indigo-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-indigo-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">{t('landing.trusted') || 'Trusted Networks'}</h3>
              <p className="text-indigo-800 text-lg leading-relaxed">{t('landing.trustedText') || 'Build your network of trusted service providers and connections'}</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-green-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">{t('landing.verified') || 'Verified Recommendations'}</h3>
              <p className="text-green-800 text-lg leading-relaxed">{t('landing.verifiedText') || 'Get recommendations from people you trust in your network'}</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mb-4">{t('landing.quick') || 'Quick Connect'}</h3>
              <p className="text-purple-800 text-lg leading-relaxed">{t('landing.quickText') || 'Instantly connect with service providers via WhatsApp'}</p>
            </div>
          </div>

          {/* Auth Options */}
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('landing.getStarted') || 'Get Started'}</h2>
              <p className="text-gray-700">{t('landing.getStartedText') || 'Join the trusted network or browse as a guest'}</p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium text-lg"
              >
                {t('auth.createAccount') || 'Create Account'}
              </button>
              
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium text-lg"
              >
                {t('auth.signIn') || 'Sign In'}
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  await continueAsGuest('seeker');
                  router.replace('/seeker/services');
                }}
                className="w-full text-gray-600 py-4 px-6 rounded-xl hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-lg"
              >
                {t('landing.browseGuest') || 'Browse as Guest'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}