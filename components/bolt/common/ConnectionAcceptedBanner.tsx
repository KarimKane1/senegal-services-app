import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';

interface ConnectionAcceptedBannerProps {
  isVisible: boolean;
  onClose: () => void;
  friendName: string;
}

export default function ConnectionAcceptedBanner({ isVisible, onClose, friendName }: ConnectionAcceptedBannerProps) {
  const { t } = useI18n();
  
  console.log('ConnectionAcceptedBanner - friendName:', friendName);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-green-800">
              {t('connections.acceptedRequest', { name: friendName })}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {t('connections.nowInFriendsList')}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
