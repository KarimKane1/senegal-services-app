import React from 'react';
import { X, Users } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';

interface Recommender {
  id: string;
  name: string;
}

interface RecommendationsModalProps {
  providerName: string;
  recommenders: Recommender[];
  onClose: () => void;
}

export default function RecommendationsModal({ providerName, recommenders, onClose }: RecommendationsModalProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">{t('services.recommendations')}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-gray-700">
              {t('services.peopleWhoRecommended')} <span className="font-semibold">{providerName}</span>
            </p>
          </div>

          <div className="space-y-3">
            {recommenders.map((recommender) => (
              <div key={recommender.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                  {recommender.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{recommender.name}</p>
                  <p className="text-sm text-gray-500">Network connection</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
