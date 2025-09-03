import React, { useState } from 'react';
import { Edit, Users, ThumbsUp, Settings, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileTab() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">My Profile</h2>
              <p className="opacity-90">Your trust network profile and settings</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mr-6">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'Aminata Diop'}</h3>
              <p className="text-gray-600">{user?.phone || '+221 70 123 4567'}</p>
              <p className="text-gray-600">{user?.location || 'Dakar, Senegal'}</p>
            </div>
          </div>

          {/* Network Stats */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Network</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="bg-blue-50 rounded-xl p-6">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-blue-600 mb-1">3</div>
                  <div className="text-gray-600 font-medium">Connections</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-50 rounded-xl p-6">
                  <ThumbsUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-green-600 mb-1">3</div>
                  <div className="text-gray-600 font-medium">Recommendations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-gray-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">Profile Visibility</p>
                    <p className="text-sm text-gray-600 break-words">Who can see your profile and recommendations</p>
                  </div>
                </div>
                <button className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors ml-2 flex-shrink-0">
                  Public
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-gray-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">Notification Settings</p>
                    <p className="text-sm text-gray-600 break-words">Manage how you receive updates</p>
                  </div>
                </div>
                <button className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors ml-2 flex-shrink-0">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}