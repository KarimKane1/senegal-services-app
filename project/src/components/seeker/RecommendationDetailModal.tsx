import React from 'react';
import { X, MapPin, Phone, Edit } from 'lucide-react';

interface Recommendation {
  id: string;
  name: string;
  serviceType: string;
  location: string;
  phone: string;
  qualities: string[];
  watchFor: string[];
}

interface RecommendationDetailModalProps {
  recommendation: Recommendation;
  onClose: () => void;
  onEdit: () => void;
}

export default function RecommendationDetailModal({ recommendation, onClose, onEdit }: RecommendationDetailModalProps) {
  const handleWhatsAppContact = () => {
    const message = `Hi ${recommendation.name}, I found you through Trust Network and would like to inquire about your ${recommendation.serviceType.toLowerCase()} services.`;
    const whatsappUrl = `https://wa.me/${recommendation.phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommendation Details</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="text-indigo-600 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit recommendation"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Provider Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{recommendation.name}</h3>
                  <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                    {recommendation.serviceType}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>{recommendation.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>{recommendation.phone}</span>
                </div>
              </div>
            </div>

            {/* What You Liked */}
            {recommendation.qualities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  What You Liked
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.qualities.map((quality) => (
                    <span key={quality} className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-full">
                      {quality}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Things to Watch For */}
            {recommendation.watchFor.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Things to Watch For
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.watchFor.map((item) => (
                    <span key={item} className="bg-orange-50 text-orange-700 text-sm px-3 py-2 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Button */}
            <div className="pt-4">
              <button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Contact via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}