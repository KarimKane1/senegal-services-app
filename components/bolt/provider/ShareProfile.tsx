import React, { useMemo, useState } from 'react';
import { QrCode, Link, Copy, Share2, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';

export default function ShareProfile() {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();
  // Deep link that takes a seeker to add recommendation prefilled with provider name; if not logged in, they sign up first
  const profileUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://trustnetwork.app';
    // Include provider name and id for prefill
    const params = new URLSearchParams();
    if (user?.name) params.set('providerName', user.name);
    if (user?.id) params.set('providerId', user.id);
    return `${origin}/seeker/recommendations/new?${params.toString()}`;
  }, [user?.id, user?.name]);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Hi! I'm John the Plumber. If you've used my services and were satisfied, please add me to your Trust Network recommendations using this link: ${profileUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('provider.shareProfile')}</h3>
        <p className="text-gray-600">{t('provider.getMoreRecommendations')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-indigo-600" />
            {t('provider.qrCode')}
          </h4>
          <div className="bg-gray-50 rounded-lg p-8 text-center mb-4">
            <div className="w-48 h-48 bg-white rounded-lg shadow-sm mx-auto flex items-center justify-center border border-gray-200">
              {/* Generate QR with QuickChart (simple, no deps). Matches the Share Link exactly. */}
              <img
                alt="QR"
                className="w-44 h-44"
                src={`https://quickchart.io/qr?text=${encodeURIComponent(profileUrl)}&size=300`}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;
                }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {t('provider.showQrToCustomers')}
          </p>
        </div>

        {/* Share Link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Link className="w-5 h-5 mr-2 text-indigo-600" />
            {t('provider.shareLink')}
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 break-all font-mono">{profileUrl}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCopyLink}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? t('provider.copied') : t('provider.copyLink')}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('provider.shareViaWhatsApp')}
            </button>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-blue-600" />
          {t('provider.howToGetMore')}
        </h4>
        <div className="space-y-2 text-gray-700">
          <p className="flex items-start">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">1</span>
            {t('provider.step1')}
          </p>
          <p className="flex items-start">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">2</span>
            {t('provider.step2')}
          </p>
          <p className="flex items-start">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">3</span>
            {t('provider.step3')}
          </p>
        </div>
      </div>
    </div>
  );
}