import React, { useMemo, useState } from 'react';
import { X, User, Briefcase, MapPin, Phone } from 'lucide-react';
import { useCategories } from '../../../lib/hooks/useCategories';
import { useI18n } from '../../../context/I18nContext';

interface Recommendation {
  id: string;
  name: string;
  serviceType: string;
  location: string;
  phone: string;
  qualities: string[];
  watchFor: string[];
}

interface EditRecommendationModalProps {
  recommendation: Recommendation;
  onClose: () => void;
  onSave: (updatedRecommendation: Recommendation) => void;
}

// These will be translated in the component
const qualityOptions = [
  'Job quality', 'Timeliness', 'Clean & Organized', 'Professional', 'Reliable & Trustworthy', 'Fair pricing'
];

const watchForOptions = [
  'Expensive', 'Limited availability', 'Punctuality', 'Communication'
];

export default function EditRecommendationModal({ recommendation, onClose, onSave }: EditRecommendationModalProps) {
  const { categories, loading: categoriesLoading, getLocalizedCategoryName } = useCategories();
  const { t } = useI18n();

  // Get translated quality attribute
  const getTranslatedQuality = (quality: string) => {
    const qualityMap: { [key: string]: string } = {
      'Job quality': t('recs.jobQuality'),
      'Timeliness': t('recs.timeliness'),
      'Clean & Organized': t('recs.cleanOrganized'),
      'Professional': t('recs.professional'),
      'Reliable & Trustworthy': t('recs.reliableTrustworthy'),
      'Fair pricing': t('recs.fairPricing'),
      'Expensive': t('recs.expensive'),
      'Limited availability': t('recs.limitedAvailability'),
      'Punctuality': t('recs.punctuality'),
      'Communication': t('recs.communication')
    };
    return qualityMap[quality] || quality;
  };


  const senegalCities = useMemo(() => [
    'Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis','Tambacounda','Mbour','Diourbel','Louga','Kolda','Fatick','Kaffrine','Kédougou','Matam','Sédhiou'
  ], []);

  const normalizeServiceType = (input: string) => {
    if (!input) return '';
    // Find the category that matches the input
    const category = categories.find(cat => 
      cat.name.toLowerCase() === input.toLowerCase() ||
      cat.slug === input.toLowerCase() ||
      getLocalizedCategoryName(cat).toLowerCase() === input.toLowerCase()
    );
    return category ? category.name : input;
  };

  const initialPhone = (recommendation as any).phone || (recommendation as any).phone_e164 || '';
  // Parse initial phone to extract country code and number
  const parsePhone = (phone: string) => {
    if (!phone) return { countryCode: '+221', phone: '' };
    
    // Handle different country code lengths
    if (phone.startsWith('+1')) return { countryCode: '+1', phone: phone.substring(2) };
    if (phone.startsWith('+221')) return { countryCode: '+221', phone: phone.substring(4) };
    if (phone.startsWith('+33')) return { countryCode: '+33', phone: phone.substring(3) };
    if (phone.startsWith('+44')) return { countryCode: '+44', phone: phone.substring(3) };
    if (phone.startsWith('+49')) return { countryCode: '+49', phone: phone.substring(3) };
    if (phone.startsWith('+39')) return { countryCode: '+39', phone: phone.substring(3) };
    if (phone.startsWith('+34')) return { countryCode: '+34', phone: phone.substring(3) };
    if (phone.startsWith('+32')) return { countryCode: '+32', phone: phone.substring(3) };
    if (phone.startsWith('+41')) return { countryCode: '+41', phone: phone.substring(3) };
    if (phone.startsWith('+31')) return { countryCode: '+31', phone: phone.substring(3) };
    
    // Default to Senegal if no country code found
    return { countryCode: '+221', phone: phone.replace(/^\+?\d{1,4}/, '') };
  };
  
  const { countryCode: initialCountryCode, phone: initialPhoneNumber } = parsePhone(initialPhone);
  
  const [formData, setFormData] = useState({
    ...recommendation,
    phone: initialPhoneNumber,
    countryCode: initialCountryCode,
    serviceType: normalizeServiceType(recommendation.serviceType)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean the phone number by removing any non-digit characters
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const fullPhone = `${formData.countryCode}${cleanPhone}`;
    
    console.log('Phone number processing:', {
      originalPhone: formData.phone,
      countryCode: formData.countryCode,
      cleanPhone,
      fullPhone
    });
    
    const updatedData = {
      ...formData,
      phone: fullPhone
    };
    
    console.log('Sending to API:', {
      id: updatedData.id,
      name: updatedData.name,
      phone: updatedData.phone,
      location: updatedData.location,
      serviceType: updatedData.serviceType
    });
    onSave(updatedData);
    onClose();
  };

  const toggleQuality = (quality: string) => {
    setFormData(prev => ({
      ...prev,
      qualities: prev.qualities.includes(quality)
        ? prev.qualities.filter(q => q !== quality)
        : [...prev.qualities, quality]
    }));
  };

  const toggleWatchFor = (item: string) => {
    setFormData(prev => ({
      ...prev,
      watchFor: prev.watchFor.includes(item)
        ? prev.watchFor.filter(w => w !== item)
        : [...prev.watchFor, item]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('recs.editRecommendation') || 'Edit Recommendation'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('recs.providerName') || 'Provider Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  placeholder={t('recs.enterProviderName') || 'Enter provider name'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('recs.serviceType') || 'Service Type'}
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-gray-900"
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? (t('common.loading') || 'Loading categories...') : (t('recs.selectServiceType') || 'Select service type')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{getLocalizedCategoryName(category)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('recs.phoneNumber') || 'Phone Number'}
              </label>
              <div className="flex">
                <div className="relative w-24">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+32">🇧🇪 +32</option>
                    <option value="+41">🇨🇭 +41</option>
                    <option value="+31">🇳🇱 +31</option>
                  </select>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder={t('auth.phonePh') || '70 123 4567'}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('recs.location') || 'Location'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-gray-900"
                  required
                >
                  {senegalCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* What You Liked */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {t('recs.whatYouLiked') || 'What You Liked'} ({t('recs.optional') || 'Optional'})
              </label>
              <div className="grid grid-cols-2 gap-3">
                {qualityOptions.map(quality => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => toggleQuality(quality)}
                    className={`text-left p-3 rounded-lg border transition-colors text-gray-900 ${
                      formData.qualities.includes(quality)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {getTranslatedQuality(quality)}
                  </button>
                ))}
              </div>
            </div>

            {/* Things to Watch For */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {t('recs.watchFor') || 'Things to Watch For'} ({t('recs.optional') || 'Optional'})
              </label>
              <div className="grid grid-cols-2 gap-3">
                {watchForOptions.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleWatchFor(item)}
                    className={`text-left p-3 rounded-lg border transition-colors text-gray-900 ${
                      formData.watchFor.includes(item)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {getTranslatedQuality(item)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {t('common.save') || 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}