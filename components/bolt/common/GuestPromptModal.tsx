import React from 'react';
import { X, Shield, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GuestPromptModalProps {
  onClose: () => void;
}

export default function GuestPromptModal({ onClose }: GuestPromptModalProps) {
  const { logout } = useAuth();

  const handleSignUp = () => {
    logout(); // This will reset the auth state and show the auth page
  };

  const handleSignIn = () => {
    logout(); // This will reset the auth state and show the auth page
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Join Trust Network</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">
            To access this feature, you need to create an account or sign in.
          </p>
          <p className="text-sm text-gray-500">
            Join thousands of users building trusted networks for reliable service recommendations.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSignUp}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </button>
          
          <button
            onClick={handleSignIn}
            className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors font-medium flex items-center justify-center"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </button>
          
          <button
            onClick={onClose}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}