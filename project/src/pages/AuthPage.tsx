import React, { useState } from 'react';
import { Users, Shield, Zap, UserCheck, Briefcase, Phone, Lock, User, MapPin, Eye, EyeOff, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { login, loginWithPhone, signup, continueAsGuest, loading } = useAuth();
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
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);

  const validateSignUp = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signUpData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!signUpData.password) newErrors.password = 'Password is required';
    if (signUpData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
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
    if (!validateSignUp()) return;
    
    await signup({
      ...signUpData,
      city: signUpData.cities.join(', ')
    });
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;
    
    const fullPhone = `${signInData.countryCode}${signInData.phone}`;
    await loginWithPhone(fullPhone, signInData.password, userType);
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join the trusted network</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSignUpData({ ...signUpData, userType: 'seeker' })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    signUpData.userType === 'seeker'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserCheck className="w-5 h-5 mx-auto mb-1" />
                  Service Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpData({ ...signUpData, userType: 'provider' })}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    signUpData.userType === 'provider'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mx-auto mb-1" />
                  Service Provider
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number</label>
              <div className="flex space-x-2">
                <select
                  value={signUpData.countryCode}
                  onChange={(e) => setSignUpData({ ...signUpData, countryCode: e.target.value })}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="70 123 4567"
                  />
                </div>
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cities</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <div
                  onClick={() => setShowCitiesDropdown(!showCitiesDropdown)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer min-h-[48px] flex items-center"
                >
                  <div className="flex-1">
                    {signUpData.cities.length === 0 ? (
                      <span className="text-gray-400">Select cities</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Create a password"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign In
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('seeker')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  userType === 'seeker'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UserCheck className="w-5 h-5 mx-auto mb-1" />
                Service Seeker
              </button>
              <button
                type="button"
                onClick={() => setUserType('provider')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  userType === 'provider'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Briefcase className="w-5 h-5 mx-auto mb-1" />
                Service Provider
              </button>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex space-x-2">
                <select
                  value={signInData.countryCode}
                  onChange={(e) => setSignInData({ ...signInData, countryCode: e.target.value })}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="70 123 4567"
                  />
                </div>
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 ml-3">Trust Network</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Digitizing trust through verified recommendations. Connect with reliable service providers through your network.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trusted Networks</h3>
              <p className="text-gray-600">Build your network of trusted service providers and connections</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verified Recommendations</h3>
              <p className="text-gray-600">Get recommendations from people you trust in your network</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick Connect</h3>
              <p className="text-gray-600">Instantly connect with service providers via WhatsApp</p>
            </div>
          </div>

          {/* Auth Options */}
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
              <p className="text-gray-600">Join the trusted network or browse as a guest</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setMode('signup')}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium text-lg"
              >
                Create Account
              </button>
              
              <button
                onClick={() => setMode('signin')}
                className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium text-lg"
              >
                Sign In
              </button>
              
              <button
                onClick={() => continueAsGuest('seeker')}
                className="w-full text-gray-600 py-4 px-6 rounded-xl hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium text-lg"
              >
                Browse as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}