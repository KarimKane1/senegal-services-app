import React from 'react';
import { MapPin, MessageCircle, Phone } from 'lucide-react';

interface ServiceProvider {
  id: string;
  name: string;
  serviceType: string;
  location: string;
  avatar: string;
  phone: string;
  recommendedBy?: string;
  isNetworkRecommendation: boolean;
  qualities: string[];
  watchFor: string[];
}

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onViewDetails: () => void;
  onContact?: () => void;
  isGuest?: boolean;
}

export default function ServiceProviderCard({ provider, onViewDetails, onContact, isGuest = false }: ServiceProviderCardProps) {
  const handleCardClick = () => {
    onViewDetails();
  };

  const handleWhatsAppContact = () => {
    if (isGuest && onContact) {
      onContact();
      return;
    }
    const message = `Hi ${provider.name}, I found you through Trust Network and would like to inquire about your ${provider.serviceType.toLowerCase()} services.`;
    const whatsappUrl = `https://wa.me/${provider.phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center mb-3 md:mb-4">
        <img
          src={provider.avatar}
          alt={provider.name}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mr-3 md:mr-4"
        />
        <div className="flex-1">
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{provider.name}</h3>
            <p className="text-indigo-600 font-medium mb-1 text-sm md:text-base">{provider.serviceType}</p>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {provider.location}
            </div>
          </div>
        </div>
      </div>

      {provider.recommendedBy && (
        <div className="bg-green-50 rounded-lg p-2 md:p-3 mb-3 md:mb-4">
          <p className="text-sm text-green-800">
            <span className="font-medium">
              {isGuest ? 'Recommended by ***' : `Recommended by ${provider.recommendedBy}`}
            </span>
          </p>
        </div>
      )}

      {/* Qualities */}
      {provider.qualities.length > 0 && (
        <div className="mb-3 md:mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">What They Liked</p>
          <div className="flex flex-wrap gap-2">
            {provider.qualities.map((quality) => (
              <span key={quality} className="bg-green-50 text-green-700 text-xs md:text-sm px-2 md:px-3 py-1 rounded-full">
                {quality}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Things to Watch For */}
      {provider.watchFor.length > 0 && (
        <div className="mb-3 md:mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Things to Watch For</p>
          <div className="flex flex-wrap gap-2">
            {provider.watchFor.map((item) => (
              <span key={item} className="bg-orange-50 text-orange-700 text-xs md:text-sm px-2 md:px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleWhatsAppContact();
        }}
        className="w-full py-2 md:py-3 px-3 md:px-4 rounded-lg transition-all duration-200 font-medium flex items-center justify-center text-sm md:text-base bg-green-600 text-white hover:bg-green-700"
      >
        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        Contact via WhatsApp
      </button>

      <div className="text-center mt-2">
        <span className="text-xs md:text-sm text-gray-500">
          {provider.phone}
        </span>
      </div>
    </div>
  );
}