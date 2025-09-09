import React from 'react';
import { X, Share2, Phone } from 'lucide-react';

export default function InviteFriendModal({ onClose, inviteUrl, message }: { onClose: () => void; inviteUrl: string; message?: string }) {
    const text = message || `Join me on Lumio to find and share trusted service providers: ${inviteUrl}`;

  const shareNative = async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: 'Lumio', text, url: inviteUrl });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(text);
        alert('Invite link copied to clipboard');
      }
    } catch {}
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };


  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Invite a Friend</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-blue-800 text-sm font-medium leading-relaxed">
          Share this link with your friend so they can join Verra and start finding trusted service providers through your network.
        </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-medium mb-1">Message that will be sent:</p>
              <div className="bg-gray-50 rounded-lg p-3 break-words text-sm text-gray-700 border border-gray-200 leading-relaxed">
                {text}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={shareWhatsApp} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium">
                <Phone className="w-4 h-4" /> Share on WhatsApp
              </button>
              <button onClick={shareNative} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


