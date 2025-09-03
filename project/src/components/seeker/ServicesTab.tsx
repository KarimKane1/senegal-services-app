import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import ServiceProviderCard from './ServiceProviderCard';
import ServiceProviderDetailModal from './ServiceProviderDetailModal';
import GuestPromptModal from '../common/GuestPromptModal';

import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../hooks/useCategories';

export default function ServicesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const { availableProviders, isGuest, logout } = useAuth();
  const { categories, getLocalizedCategoryName } = useCategories();
  
  // Only show providers from actual network connections (no mock data)
  const allProviders = [...availableProviders];

  const filteredProviders = allProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || provider.serviceType === selectedCategory;
    
    // Only show providers that are actually recommended by people in the user's network
    return matchesSearch && matchesCategory && provider.isNetworkRecommendation;
  });

  const allCategories = ['All', ...categories.map(c => getLocalizedCategoryName(c))];
  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 8);

  const handleGuestAction = () => {
    if (isGuest) {
      setShowGuestPrompt(true);
      return;
    }
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Service Providers</h2>
        <p className="text-sm md:text-base text-gray-600 px-2 md:px-0">Find trusted service providers through your network</p>
      </div>

      {/* Search and Filter */}
      <div className="relative mb-4 md:mb-6 px-2 md:px-0">
        <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
        <input
          className="search-input w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          type="text"
          placeholder="Search providers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Service Categories */}
      <div className="mb-4 md:mb-6 px-2 md:px-0">
        <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
          {visibleCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 md:px-4 py-1 md:py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {!showAllCategories && serviceCategories.length > 8 && (
          <button
            onClick={() => setShowAllCategories(true)}
            className="text-indigo-600 text-xs md:text-sm font-medium hover:text-indigo-700"
          >
            Show more categories
          </button>
        )}
      </div>

      {/* Service Providers List */}
      <div className="space-y-2 md:space-y-4 px-2 md:px-0">
        {filteredProviders.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No network recommendations yet</h3>
              <p className="text-gray-600 mb-4">
                Connect with people in your network to see their service provider recommendations.
              </p>
              <button
                onClick={() => window.location.href = '/seeker/connections'}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Connections
              </button>
            </div>
          </div>
        ) : (
          (isGuest ? filteredProviders.slice(0, 3) : filteredProviders).map((provider) => (
            <ServiceProviderCard 
              key={provider.id} 
              provider={provider} 
              onViewDetails={() => {
                if (isGuest) {
                  handleGuestAction();
                } else {
                  setSelectedProvider(provider);
                }
              }}
              onContact={() => {
                if (isGuest) {
                  handleGuestAction();
                }
              }}
              isGuest={isGuest}
            />
          ))
        )}
      </div>

      {isGuest && filteredProviders.length > 3 && (
        <div className="bg-indigo-50 rounded-xl p-4 text-center mt-6 mx-2 md:mx-0">
          <p className="text-indigo-800 font-medium mb-2">Want to see all available service providers?</p>
          <button
            onClick={logout}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            Create Account
          </button>
        </div>
      )}

      {selectedProvider && (
        <ServiceProviderDetailModal 
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}

      {showGuestPrompt && (
        <GuestPromptModal onClose={() => setShowGuestPrompt(false)} />
      )}
    </div>
  );
}