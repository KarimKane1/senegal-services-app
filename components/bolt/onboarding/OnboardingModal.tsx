import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Users, Search, Plus } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  userType: 'seeker' | 'provider';
}

const seekerSteps = [
  {
    title: "Welcome to Trust Network! 👋",
    description: "Find trusted service providers through your network.",
    icon: Users,
    content: "Connect with friends to access their trusted recommendations and discover reliable service providers."
  },
  {
    title: "Build Your Network",
    description: "Connect with friends to access their trusted recommendations.",
    icon: Users,
    content: "The more connections you have, the better recommendations you'll get."
  },
  {
    title: "Find Services",
    description: "Browse providers recommended by your network.",
    icon: Search,
    content: "Use the Services tab to find providers recommended by your connections."
  },
  {
    title: "Share Recommendations",
    description: "Add trusted providers to help your network.",
    icon: Plus,
    content: "Know a great service provider? Add them to help your friends and family."
  }
];

const providerSteps = [
  {
    title: "Welcome to Trust Network! 👋",
    description: "Grow your business through trusted recommendations.",
    icon: Users,
    content: "Get more customers through word-of-mouth recommendations from satisfied clients."
  },
  {
    title: "Share Your Profile",
    description: "Share your profile so people can recommend you to their network.",
    icon: Plus,
    content: "Use your QR code or share link to make it easy for satisfied customers to recommend you."
  }
];

export default function OnboardingModal({ onClose, userType }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = userType === 'seeker' ? seekerSteps : providerSteps;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
            <p className="text-gray-600 mb-4">{currentStepData.description}</p>
            <p className="text-gray-700 leading-relaxed">{currentStepData.content}</p>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center mb-8">
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

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}