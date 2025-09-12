"use client";
import React, { useState } from 'react';
import { useI18n } from '../../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { X, Users, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';

interface SimpleOnboardingProps {
  onComplete: () => void;
  userType: 'seeker' | 'provider';
  onTabChange?: (tab: string) => void;
}

export default function SimpleOnboarding({ onComplete, userType, onTabChange }: SimpleOnboardingProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAddingFriends, setIsAddingFriends] = useState(false);
  const [friendsAdded, setFriendsAdded] = useState(false);
  const [providerAdded, setProviderAdded] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Lumio! 🎉',
      description: 'Let\'s learn how to use Lumio together! I\'ll guide you through adding friends and providers.',
      showNext: true,
    },
    {
      id: 'add-friends',
      title: 'Add Your First Friends 👥',
      description: 'Let\'s add Maymouna Kane and Karim Kane to your network. Click "Add Friend" next to their names.',
      showNext: false,
      action: 'guide-add-friends',
    },
    {
      id: 'add-provider',
      title: 'Add a Trusted Provider 🛠️',
      description: 'Now let\'s add a service provider you trust. This helps build your recommendation network.',
      showNext: false,
      action: 'guide-add-provider',
    },
    {
      id: 'explore-services',
      title: 'Explore Services 🔍',
      description: 'Perfect! Now you can browse all the service providers recommended by your network.',
      showNext: true,
      action: 'show-services',
    },
  ];

  const handleGuideAddFriends = () => {
    // Navigate to connections tab to show the suggestions
    onTabChange?.('connections');
    // Don't hide modal - keep it visible as a guide
    // The user will manually add friends, then we'll detect when they're done
  };

  // Check if user has added friends (we'll detect this from the connections data)
  React.useEffect(() => {
    if (currentStep === 1) {
      // Check if user has sent requests to Maymouna and Karim
      const checkFriendsAdded = async () => {
        try {
          const response = await fetch(`/api/connections?sentRequests=1&userId=${user?.id}`);
          const data = await response.json();
          
          if (data.items) {
            console.log('Onboarding Debug: Checking sent requests:', data.items);
            const maymounaAdded = data.items.some((item: any) => 
              item.name === 'Maymouna Kane' && item.status === 'pending'
            );
            const karimAdded = data.items.some((item: any) => 
              item.name === 'Karim Kane' && item.status === 'pending'
            );
            
            console.log('Onboarding Debug: Maymouna added:', maymounaAdded, 'Karim added:', karimAdded);
            
            if (maymounaAdded && karimAdded) {
              console.log('Onboarding Debug: Both friends added, moving to next step');
              setFriendsAdded(true);
              setTimeout(() => {
                setCurrentStep(2); // Move to provider step
              }, 1500);
            }
          }
        } catch (error) {
          console.error('Error checking friends:', error);
        }
      };
      
      // Check every 2 seconds if friends have been added
      const interval = setInterval(checkFriendsAdded, 2000);
      return () => clearInterval(interval);
    }
  }, [currentStep, user?.id]);

  const handleGuideAddProvider = () => {
    // Navigate to recommendations tab to show providers
    onTabChange?.('recommendations');
    // Don't hide modal - keep it visible as a guide
    // The user will manually add a provider, then we'll detect when they're done
  };

  // Check if user has added a provider
  React.useEffect(() => {
    if (currentStep === 2) {
      const checkProviderAdded = async () => {
        try {
          const response = await fetch(`/api/recommendations?userId=${user?.id}`);
          const data = await response.json();
          
          console.log('Onboarding Debug: Checking recommendations:', data);
          
          if (data.recommendations && data.recommendations.length > 0) {
            console.log('Onboarding Debug: Provider added, moving to next step');
            setProviderAdded(true);
            setTimeout(() => {
              setCurrentStep(3); // Move to services step
            }, 1500);
          }
        } catch (error) {
          console.error('Error checking providers:', error);
        }
      };
      
      // Check every 2 seconds if a provider has been added
      const interval = setInterval(checkProviderAdded, 2000);
      return () => clearInterval(interval);
    }
  }, [currentStep, user?.id]);

  const handleShowServices = () => {
    onTabChange?.('services'); // Go to services tab
    setTimeout(() => {
      onComplete(); // Complete onboarding
    }, 1000);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];

  // Always show the modal - it's blocking until completion
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto">
        <div className="flex items-center mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-indigo-600 font-bold text-sm">{currentStep + 1}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
          </div>
        </div>

        <p className="text-gray-600 mb-6">{currentStepData.description}</p>

        {currentStep === 1 && (
          <div className="mb-6">
            {!friendsAdded ? (
              <button
                onClick={handleGuideAddFriends}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Show Me Where to Add Friends
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800 font-medium">Great! You've added friends!</span>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="mb-6">
            {!providerAdded ? (
              <button
                onClick={handleGuideAddProvider}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Show Me Where to Add Provider
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800 font-medium">Perfect! Provider added!</span>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="mb-6">
            <button
              onClick={handleShowServices}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Explore Services
            </button>
          </div>
        )}

        {currentStepData.showNext && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentStep ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
