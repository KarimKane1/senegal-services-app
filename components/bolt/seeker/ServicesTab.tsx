import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import ServiceProviderCard from './ServiceProviderCard';
import ServiceProviderDetailModal from './ServiceProviderDetailModal';
import GuestPromptModal from '../common/GuestPromptModal';
import { mockServiceProviders } from '../../data/mockData';
import { useProviders } from '../../../hooks/providers';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { useCategories } from '../../../lib/hooks/useCategories';
import { useConnections } from '../../../hooks/connections';
import { useQueryClient } from '@tanstack/react-query';

export default function ServicesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const { availableProviders, isGuest, logout, user } = useAuth();
  const { t } = useI18n();
  const { data } = useProviders({ q: searchTerm, service: selectedCategory === 'All' ? undefined : selectedCategory });
  const { categories, getLocalizedCategoryName } = useCategories();
  const { data: connectionsData, refetch: refetchConnections } = useConnections(user?.id);
  const queryClient = useQueryClient();
  const liveProviders = (data?.items as any[]) || [];
  
  // Combine mock providers with providers from accepted connections
  const mappedLive = liveProviders.map((p: any) => ({
    id: p.id,
    name: p.name,
    serviceType: p.service_type || p.serviceType,
    location: p.city || '',
    avatar: p.photo_url || 'https://placehold.co/64x64',
    phone: '',
    recommendedBy: undefined,
    // Filter out recommendations from the current user
    recommenders: (p.recommenders || [])
      .map((r: any) => ({ id: r.id, name: r.name }))
      .filter((r: any) => r.id !== user?.id), // Don't show current user's own recommendations
    isNetworkRecommendation: true,
    qualities: (p.top_likes || []).slice(0, 3),
    watchFor: (p.top_watch || []).slice(0, 2),
  }));
  const allProviders = [...mappedLive, ...availableProviders];

  // Get user's network connections
  const userConnections = connectionsData?.items || [];
  const connectionUserIds = userConnections.map((conn: any) => conn.id);
  
  // Force refresh connections data when component mounts
  React.useEffect(() => {
    if (user?.id) {
      console.log('Forcing connections refresh for user:', user.id);
      // Invalidate the query cache first
      queryClient.invalidateQueries({ queryKey: ['connections', user.id] });
      // Then refetch
      refetchConnections().then((result) => {
        console.log('Connections refresh result:', result);
      });
    }
  }, [user?.id, refetchConnections, queryClient]);

  // Debug logging
  React.useEffect(() => {
    console.log('ServicesTab Debug:', {
      userId: user?.id,
      userConnections: userConnections.length,
      connectionUserIds,
      availableProviders: availableProviders.length,
      liveProviders: liveProviders.length
    });
  }, [user?.id, userConnections.length, connectionUserIds, availableProviders.length, liveProviders.length]);

  const filteredProviders = allProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Debug logging for filtering
    if (provider.name === 'Daunte Pean') {
      console.log('Daunte Pean Filter Debug:', {
        provider,
        selectedCategory,
        serviceType: provider.serviceType,
        matchesCategory: selectedCategory === 'All' || provider.serviceType === selectedCategory
      });
    }
    
    const matchesCategory = selectedCategory === 'All' || 
      (provider.serviceType && provider.serviceType.toLowerCase() === selectedCategory.toLowerCase());
    
    // For guests, show limited providers without network recommendations
    if (isGuest) {
      return matchesSearch && matchesCategory;
    }
    
    // Show all providers, but only mark as network recommendations if they're recommended by user's network
    return matchesSearch && matchesCategory;
  }).map(provider => {
    // Check if this provider is recommended by people in the user's network
    const networkRecommenders = provider.recommenders ? provider.recommenders.filter((rec: any) => 
      connectionUserIds.includes(rec.id)
    ) : [];
    
    // Debug logging for each provider
    if (provider.name === 'Daunte Pean') {
      console.log('Daunte Pean Debug:', {
        provider,
        recommenders: provider.recommenders,
        connectionUserIds,
        networkRecommenders
      });
    }
    
    return {
      ...provider,
      isNetworkRecommendation: networkRecommenders.length > 0,
      networkRecommenders: networkRecommenders
    };
  });

  const allCategories = [
    { key: 'All', name: t('category.all') },
    ...categories.map(c => ({ key: c.slug, name: getLocalizedCategoryName(c) }))
  ];
  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 8);
  
  // Debug logging for categories
  React.useEffect(() => {
    console.log('Categories Debug:', {
      categories,
      allCategories,
      selectedCategory
    });
  }, [categories, allCategories, selectedCategory]);

  const handleGuestAction = () => {
    if (isGuest) {
      setShowGuestPrompt(true);
      return;
    }
  };

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{t('services.title') || 'Service Providers'}</h2>
        <p className="text-sm md:text-base text-gray-600 px-2 md:px-0">{t('services.subtitle') || 'Find trusted service providers through your network'}</p>
      </div>

      {/* Search and Filter */}
      <div className="relative mb-4 md:mb-6 px-2 md:px-0">
        <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
        <input
          className="search-input w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          type="text"
          placeholder={t('services.search') || 'Search providers...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Service Categories */}
      <div className="mb-4 md:mb-6 px-2 md:px-0">
        <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
          {visibleCategories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-2 md:px-4 py-1 md:py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {!showAllCategories && allCategories.length > 8 && (
          <button
            onClick={() => setShowAllCategories(true)}
            className="text-indigo-600 text-xs md:text-sm font-medium hover:text-indigo-700"
          >
            {t('services.showMore') || 'Show more categories'}
          </button>
        )}
      </div>

      {/* Service Providers List */}
      <div className="space-y-2 md:space-y-4 px-2 md:px-0">
        {(isGuest ? filteredProviders.slice(0, 3) : filteredProviders).map((provider) => (
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
        ))}
      </div>

      {isGuest && filteredProviders.length > 3 && (
        <div className="bg-indigo-50 rounded-xl p-4 text-center mt-6 mx-2 md:mx-0">
          <p className="text-indigo-800 font-medium mb-2">{t('services.guestCtaText') || 'Want to see all available service providers?'}</p>
          <button
            onClick={logout}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            {t('auth.createAccount') || 'Create Account'}
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