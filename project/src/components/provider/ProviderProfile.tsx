import React from 'react';
import { MapPin, Briefcase, Star, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProviderProfile() {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center">
        <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mr-4">
          {user?.name?.charAt(0) || 'J'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'John the Plumber'}</h2>
          <div className="flex items-center text-gray-600 mb-2">
            <Briefcase className="w-4 h-4 mr-1" />
            <span>Plumber</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{user?.location || 'Dakar, Senegal'}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end text-gray-600 mb-2">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-2xl font-bold text-indigo-600">12</span>
          </div>
          <p className="text-sm text-gray-600">Recommendations</p>
        </div>
      </div>
    </div>
  );
}