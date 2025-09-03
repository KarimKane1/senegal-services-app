import React from 'react';
import { X, Copy, Share2, Phone } from 'lucide-react';

export default function InviteFriendModal({ onClose, inviteUrl, message }: { onClose: () => void; inviteUrl: string; message?: string }) {
  const text = message || `Join me on Trust Network to find and share trusted service providers: ${inviteUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Invite link copied');
    } catch {}
  };

  const shareNative = async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: 'Trust Network', text, url: inviteUrl });
      } else {
        await copyToClipboard();
      }
    } catch {}
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareSMS = () => {
    const url = `sms:?&body=${encodeURIComponent(text)}`;
    window.location.href = url;
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
            <p className="text-gray-700 text-sm">Send your friend a link to join and create an account.</p>
            <div className="bg-gray-50 rounded-lg p-3 break-all text-sm text-gray-700 border border-gray-200">{inviteUrl}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button onClick={copyToClipboard} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm">
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button onClick={shareWhatsApp} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm">
                <Phone className="w-4 h-4" /> WhatsApp
              </button>
              <button onClick={shareNative} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


