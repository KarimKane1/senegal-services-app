import React, { useState } from 'react';
import Header from '../components/layout/Header';
import ProviderProfile from '../components/provider/ProviderProfile';
import RecommendationsList from '../components/provider/RecommendationsList';
import ShareProfile from '../components/provider/ShareProfile';
import InteractiveOnboarding from '../components/onboarding/InteractiveOnboarding';
import { useAuth } from '../context/AuthContext';

export default function ProviderDashboard() {
  const [activeView, setActiveView] = useState('recommendations');
  const { user, markOnboardingComplete } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  React.useEffect(() => {
    if (user?.isFirstLogin) {
      setShowOnboarding(true);
    }
  }, [user?.isFirstLogin]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    markOnboardingComplete();
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'share') {
      setActiveView('share');
    } else if (tab === 'recommendations') {
      setActiveView('recommendations');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="provider" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              className="recommendations-tab"
              onClick={() => setActiveView('recommendations')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeView === 'recommendations'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Recommendations
            </button>
            <button
              className="share-tab"
              onClick={() => setActiveView('share')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeView === 'share'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Share Profile
            </button>
          </div>
        </div>

        <div className="provider-profile">
          <ProviderProfile />
        </div>
        
        {activeView === 'recommendations' ? (
          <RecommendationsList />
        ) : (
          <ShareProfile />
        )}
      </div>
      {showOnboarding && (
        <InteractiveOnboarding
          onComplete={handleCloseOnboarding}
          userType="provider"
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}