import React, { useState } from 'react';
import { QrCode, Link, Copy, Share2, MessageCircle } from 'lucide-react';

export default function ShareProfile() {
  const [copied, setCopied] = useState(false);
  
  const profileUrl = 'https://trustnetwork.app/recommend/john-plumber-xyz123';
  
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Profile</h3>
        <p className="text-gray-600">Get more recommendations by sharing your profile with customers</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-indigo-600" />
            QR Code
          </h4>
          <div className="bg-gray-50 rounded-lg p-8 text-center mb-4">
            <div className="w-48 h-48 bg-white rounded-lg shadow-sm mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Show this QR code to customers so they can easily add you to their recommendations
          </p>
        </div>

        {/* Share Link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Link className="w-5 h-5 mr-2 text-indigo-600" />
            Share Link
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
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share via WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-blue-600" />
          How to Get More Recommendations
        </h4>
        <div className="space-y-2 text-gray-700">
          <p className="flex items-start">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">1</span>
            Share your profile link or QR code with satisfied customers
          </p>
          <p className="flex items-start">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">2</span>
            They can add you to their trusted providers even without an account
          </p>
          <p className="flex items-start">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">3</span>
            More recommendations mean more visibility to their network
          </p>
        </div>
      </div>
    </div>
  );
}