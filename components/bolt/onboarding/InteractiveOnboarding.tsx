import React, { useState, useEffect } from 'react';
import { useI18n } from '../../../context/I18nContext';
import { X, ArrowDown, ArrowRight, ArrowLeft, ArrowUp } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrow: 'down' | 'up' | 'left' | 'right';
  action?: string;
}

interface InteractiveOnboardingProps {
  onComplete: () => void;
  userType: 'seeker' | 'provider';
  onTabChange?: (tab: string) => void;
}

const seekerSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Hey there! Welcome to Verra! 👋',
    description: 'I\'m here to help you find amazing service providers through people you already trust. Think of me as your personal guide - let\'s explore together!',
    targetSelector: '',
    position: 'top',
    arrow: 'up',
    action: 'setTab:connections'
  },
  {
    id: 'connections-tab',
    title: 'This is where the magic happens! ✨',
    description: 'Your connections are like your personal recommendation engine. The more friends you connect with, the better suggestions I can give you. It\'s like having a whole network of people helping you find the best services!',
    targetSelector: '[data-tab="connections"]',
    position: 'top',
    arrow: 'down',
    action: 'setTab:connections'
  },
  {
    id: 'services-tab',
    title: 'Ready to discover some gems? 🔍',
    description: 'Here\'s where you\'ll find all the service providers your friends have recommended. I\'ll show you plumbers, cleaners, electricians - you name it! All vetted by people you trust.',
    targetSelector: '[data-tab="services"]',
    position: 'top',
    arrow: 'down',
    action: 'setTab:services'
  },
  {
    id: 'recommendations-tab',
    title: 'Time to pay it forward! 💝',
    description: 'Know someone amazing? Add them here to help your friends and family. When you share great service providers, everyone wins!',
    targetSelector: '[data-tab="recommendations"]',
    position: 'top',
    arrow: 'down',
    action: 'setTab:recommendations'
  }
];

const providerSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Hey! Welcome to Verra! 👋',
    description: 'I\'m excited to help you grow your business through word-of-mouth recommendations. Let me show you how to get more customers through satisfied clients!',
    targetSelector: '',
    position: 'top',
    arrow: 'up'
  },
  {
    id: 'share-profile',
    title: 'Let\'s get you connected! 📱',
    description: 'The secret to getting more recommendations? Make it super easy for happy customers to share your profile. I\'ll show you how!',
    targetSelector: '.share-tab',
    position: 'bottom',
    arrow: 'up',
    action: 'setTab:share'
  }
];

export default function InteractiveOnboarding({ onComplete, userType, onTabChange }: InteractiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const { t } = useI18n();
  // Map static step ids to translated titles/descriptions
  const steps = (userType === 'seeker' ? seekerSteps : providerSteps).map(s => ({
    ...s,
    title: t(`onboard.${userType}.${s.id}.title`) || s.title,
    description: t(`onboard.${userType}.${s.id}.desc`) || s.description,
  }));
  const currentStepData = steps[currentStep];

  useEffect(() => {
    // Handle tab changes if specified
    if (currentStepData.action && onTabChange) {
      const [actionType, tabName] = currentStepData.action.split(':');
      if (actionType === 'setTab') {
        onTabChange(tabName);
      }
    }

    const findTarget = () => {
      if (currentStepData.targetSelector === '') {
        setTargetElement(null);
      } else {
        const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
        setTargetElement(element);
      }
    };

    // Wait a bit for the DOM to be ready
    const timer = setTimeout(findTarget, 300);
    return () => clearTimeout(timer);
  }, [currentStep, currentStepData.targetSelector, currentStepData.action, onTabChange]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const getTooltipPosition = () => {
    if (!targetElement || currentStepData.position === 'top') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipOffset = 16;
    const isMobile = window.innerWidth < 768;
    const tooltipWidth = isMobile ? 260 : 320; // Even smaller on mobile
    const tooltipHeight = isMobile ? 200 : 280; // Much smaller on mobile
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = isMobile ? 12 : 16; // Less padding on mobile

    // Special positioning for mobile onboarding steps
    if (isMobile) {
      // For invite friends step - position at top to show button clearly
      if (currentStepData.id === 'invite-friends') {
        return {
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      }
      
      // For view recommendations step - position at bottom to show cards clearly
      if (currentStepData.id === 'click-connections') {
        return {
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      }
    }
    switch (currentStepData.position) {
      case 'bottom':
        const topLeft = Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - padding));
        return {
          top: `${Math.max(padding, rect.top - tooltipHeight - tooltipOffset)}px`,
          left: `${topLeft}px`,
          transform: 'none'
        };
      case 'bottom':
        const bottomLeft = Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - padding));
        return {
          top: `${Math.min(viewportHeight - tooltipHeight - padding, rect.bottom + tooltipOffset)}px`,
          left: `${bottomLeft}px`,
          transform: 'none'
        };
      case 'left':
        const leftTop = Math.max(padding, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, viewportHeight - tooltipHeight - padding));
        return {
          top: `${leftTop}px`,
          left: `${Math.max(padding, rect.left - tooltipWidth - tooltipOffset)}px`,
          transform: 'none'
        };
      case 'right':
        const rightTop = Math.max(padding, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, viewportHeight - tooltipHeight - padding));
        return {
          top: `${rightTop}px`,
          left: `${Math.min(viewportWidth - tooltipWidth - padding, rect.right + tooltipOffset)}px`,
          transform: 'none'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const getHighlightStyle = () => {
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    return {
      top: `${rect.top - 8}px`,
      left: `${rect.left - 8}px`,
      width: `${rect.width + 16}px`,
      height: `${rect.height + 16}px`
    };
  };

  const ArrowIcon = () => {
    if (currentStepData.arrow === 'up') return null;
    
    switch (currentStepData.arrow) {
      case 'down': return <ArrowDown className="w-6 h-6 text-blue-500" />;
      case 'left': return <ArrowLeft className="w-6 h-6 text-blue-500" />;
      case 'right': return <ArrowRight className="w-6 h-6 text-blue-500" />;
      default: return <ArrowDown className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      
      {/* Highlight circle around target element */}
      {targetElement && (
        <div
          className="absolute border-2 border-blue-500 rounded-xl bg-blue-500 bg-opacity-20 shadow-lg"
          style={getHighlightStyle()}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-10"
        style={getTooltipPosition()}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 w-72 md:w-96 border border-gray-100 mx-4 md:mx-0 max-w-[calc(100vw-32px)]">
          {/* Arrow pointing to target */}
          {currentStepData.arrow !== 'up' && (
            <div className="flex items-center justify-center mb-3">
              <div className="text-blue-500">
                <ArrowIcon />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="text-center mb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-500 text-sm hover:text-gray-700 transition-colors font-medium"
            >
              I'll explore on my own
            </button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm shadow-sm"
              >
                {currentStep === steps.length - 1 ? 'Let\'s go!' : 'Tell me more!'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}