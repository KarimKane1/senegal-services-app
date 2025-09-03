import React, { useEffect, useState } from 'react';
import { X, User, Briefcase, MapPin, Phone } from 'lucide-react';
import { supabaseBrowser } from '../../../lib/supabase/client';
import { useAddRecommendation } from '../../../hooks/recommendations';
import { useCategories } from '../../../lib/hooks/useCategories';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';

interface AddRecommendationModalProps {
  onClose: () => void;
}

const qualityOptions = [
  'Job quality',
  'Timeliness',
  'Clean & Organized',
  'Professional',
  'Reliable & Trustworthy',
  'Fair pricing'
];

const qualityHelp: Record<string, string> = {
  'Job quality': 'Did the provider do solid, long‑lasting work?',
  'Timeliness': 'Arrived on time and finished on schedule',
  'Clean & Organized': 'Kept the area tidy and organized',
  'Professional': 'Polite, respectful, easy to work with',
  'Reliable & Trustworthy': 'Showed up when promised, can be trusted',
  'Fair pricing': 'Charged a reasonable, transparent price',
};

const watchForOptions = [
  'Expensive',
  'Limited availability',
  'Punctuality',
  'Communication'
];

const watchHelp: Record<string, string> = {
  'Expensive': 'Costs may be higher than average',
  'Limited availability': 'May be booked up or slow to schedule',
  'Punctuality': 'Has arrived late or missed times before',
  'Communication': 'Hard to reach or slow to respond',
};

export default function AddRecommendationModal({ onClose }: AddRecommendationModalProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const addRecommendation = useAddRecommendation();
  const { categories, loading: categoriesLoading, getLocalizedCategoryName } = useCategories();

  // Get translated quality options
  const getTranslatedQualityOptions = () => [
    t('recs.jobQuality'),
    t('recs.timeliness'),
    t('recs.cleanOrganized'),
    t('recs.professional'),
    t('recs.reliableTrustworthy'),
    t('recs.fairPricing')
  ];

  // Get translated watch for options
  const getTranslatedWatchForOptions = () => [
    t('recs.expensive'),
    t('recs.limitedAvailability'),
    t('recs.punctuality'),
    t('recs.communication')
  ];
  // Prefill from URL params (e.g., providerName, providerId)
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const prefillName = params.get('providerName') || '';
  const prefillId = params.get('providerId') || '';
  const [formData, setFormData] = useState({
    name: prefillName,
    serviceType: '',
    countryCode: '+221',
    phone: '',
    location: 'Dakar',
    qualities: [] as string[],
    watchFor: [] as string[]
  });
  const maxQualities = 3;
  const maxWatch = 2;
  const [limitMsg, setLimitMsg] = useState('');

  // If providerId is present, try to prefill name and phone from users table
  useEffect(() => {
    const fetchProvider = async () => {
      if (!prefillId) return;
      try {
        const { data, error } = await supabaseBrowser
          .from('users')
          .select('name, phone_e164')
          .eq('id', prefillId)
          .maybeSingle();
        if (error) return;
        if (data) {
          const e164 = data.phone_e164 || '';
          const m = String(e164).match(/^(\+\d{1,3})(\d+)$/);
          const cc = m ? m[1] : formData.countryCode;
          const rest = m ? m[2] : '';
          setFormData(prev => ({
            ...prev,
            name: prev.name || data.name || '',
            countryCode: cc as any,
            phone: rest
          }));
        }
      } catch {}
    };
    fetchProvider();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        serviceType: formData.serviceType,
        phone: `${formData.countryCode} ${formData.phone}`,
        location: formData.location,
        qualities: formData.qualities,
        watchFor: formData.watchFor,
      };
      console.log('Adding recommendation with payload:', payload);
      await addRecommendation.mutateAsync(payload);
      onClose();
    } catch (error: any) {
      console.error('Error adding recommendation:', error);
      alert(error?.message || 'Failed to add recommendation');
    }
  };

  const toggleQuality = (quality: string) => {
    setFormData(prev => ({
      ...prev,
      qualities: prev.qualities.includes(quality)
        ? prev.qualities.filter(q => q !== quality)
        : prev.qualities.length >= maxQualities
          ? (setLimitMsg(`Select up to ${maxQualities} items for What You Liked`), prev.qualities)
          : [...prev.qualities, quality]
    }));
  };

  const toggleWatchFor = (item: string) => {
    setFormData(prev => ({
      ...prev,
      watchFor: prev.watchFor.includes(item)
        ? prev.watchFor.filter(w => w !== item)
        : prev.watchFor.length >= maxWatch
          ? (setLimitMsg(`Select up to ${maxWatch} items for Things to Watch For`), prev.watchFor)
          : [...prev.watchFor, item]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('recs.addTitle')}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                {t('recs.providerName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                  placeholder={t('recs.enterProviderName')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                {t('recs.serviceType')}
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
                  <option value="">{categoriesLoading ? t('recs.adding') : t('recs.selectServiceType')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>{getLocalizedCategoryName(category)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                {t('recs.phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <div className="flex space-x-2 pl-10">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+27">🇿🇦 +27</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-gray-900"
                    placeholder="70 123 4567"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                {t('recs.location')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 appearance-none"
                >
                  {['Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis','Tambacounda','Mbour','Diourbel','Louga','Kolda','Fatick','Kaffrine','Kédougou','Matam','Sédhiou'].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* What You Liked */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-3">
                {t('recs.whatYouLiked')} ({t('recs.optional')})
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {getTranslatedQualityOptions().map((quality, index) => {
                  const originalQuality = qualityOptions[index];
                  return (
                    <button
                      key={originalQuality}
                      type="button"
                      onClick={() => toggleQuality(originalQuality)}
                      title={qualityHelp[originalQuality]}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        formData.qualities.includes(originalQuality)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-800 hover:border-gray-400'
                      }`}
                    >
                      {quality}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Things to Watch For */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-3">
                {t('recs.watchFor')} ({t('recs.optional')})
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {getTranslatedWatchForOptions().map((item, index) => {
                  const originalItem = watchForOptions[index];
                  return (
                    <button
                      key={originalItem}
                      type="button"
                      onClick={() => toggleWatchFor(originalItem)}
                      title={watchHelp[originalItem]}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        formData.watchFor.includes(originalItem)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 text-gray-800 hover:border-gray-400'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {limitMsg && (
              <p className="text-xs text-red-600">{limitMsg}</p>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
{t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={addRecommendation.isPending}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addRecommendation.isPending ? t('recs.adding') : t('recs.addRecommendation')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}