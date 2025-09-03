import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import ConnectionsTab from '../components/seeker/ConnectionsTab';
import ServicesTab from '../components/seeker/ServicesTab';
import RecommendationsTab from '../components/seeker/RecommendationsTab';
import ProfileTab from '../components/seeker/ProfileTab';
import InteractiveOnboarding from '../components/onboarding/InteractiveOnboarding';
import { useAuth } from '../context/AuthContext';

export default function SeekerDashboard() {
  const [activeTab, setActiveTab] = useState('connections');
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'connections':
        return <ConnectionsTab />;
      case 'services':
        return <ServicesTab />;
      case 'recommendations':
        return <RecommendationsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <ConnectionsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="seeker" />
      <div className="max-w-4xl mx-auto px-1 md:px-4 py-2 md:py-6 pb-16 md:pb-24">
        <div className="mb-2 md:mb-6">
          {renderActiveTab()}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 md:px-4 py-1 md:py-3" data-onboarding="navigation">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-around">
            <button
              data-tab="connections"
              onClick={() => setActiveTab('connections')}
              className={`flex flex-col items-center py-1 md:py-2 px-1 md:px-4 rounded-lg transition-colors ${activeTab === 'connections' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
            >
              <span className="text-base md:text-2xl mb-0.5 md:mb-1">👥</span>
              <span className="text-xs font-medium leading-tight">Connections</span>
            </button>
            <button
              data-tab="services"
              onClick={() => setActiveTab('services')}
              className={`flex flex-col items-center py-1 md:py-2 px-1 md:px-4 rounded-lg transition-colors ${activeTab === 'services' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
            >
              <span className="text-base md:text-2xl mb-0.5 md:mb-1">🔍</span>
              <span className="text-xs font-medium leading-tight">Services</span>
            </button>
            <button
              data-tab="recommendations"
              onClick={() => setActiveTab('recommendations')}
              className={`flex flex-col items-center py-1 md:py-2 px-1 md:px-4 rounded-lg transition-colors ${activeTab === 'recommendations' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
            >
              <span className="text-base md:text-2xl mb-0.5 md:mb-1">➕</span>
              <span className="text-xs font-medium leading-tight hidden sm:inline">My Recommendations</span>
              <span className="text-xs font-medium leading-tight sm:hidden">My Recs</span>
            </button>
            <button
              data-tab="profile"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center py-1 md:py-2 px-1 md:px-4 rounded-lg transition-colors ${activeTab === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
            >
              <span className="text-base md:text-2xl mb-0.5 md:mb-1">👤</span>
              <span className="text-xs font-medium leading-tight">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {showOnboarding && (
        <InteractiveOnboarding 
          onComplete={handleCloseOnboarding}
          userType="seeker"
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
}