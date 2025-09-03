import React, { useState } from 'react';
import { X, User, Briefcase, MapPin, Phone } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

interface AddRecommendationModalProps {
  onClose: () => void;
}

const qualityOptions = [
  'Job quality', 'Timeliness', 'Clean & Organized', 'Professional', 'Reliable & Trustworthy', 'Fair pricing'
];

const watchForOptions = [
  'Expensive', 'Limited availability', 'Punctuality', 'Communication'
];

export default function AddRecommendationModal({ onClose }: AddRecommendationModalProps) {
  const { categories, loading: categoriesLoading, getLocalizedCategoryName } = useCategories();
  const [formData, setFormData] = useState({
    name: '',
    serviceType: '',
    phone: '',
    location: '',
    qualities: [] as string[],
    watchFor: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Adding recommendation:', formData);
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
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Recommendation</h2>
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
                Provider Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter provider name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading categories...' : 'Select service type'}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{getLocalizedCategoryName(category)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+221 70 123 4567"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="City, Area"
                  required
                />
              </div>
            </div>

            {/* What You Liked */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What You Liked (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {qualityOptions.map(quality => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => toggleQuality(quality)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      formData.qualities.includes(quality)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>

            {/* Things to Watch For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Things to Watch For (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {watchForOptions.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleWatchFor(item)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      formData.watchFor.includes(item)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Add Recommendation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}