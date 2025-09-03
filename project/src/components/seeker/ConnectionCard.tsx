import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  location: string;
  avatar: string;
  recommendationCount: number;
}

interface ConnectionCardProps {
  connection: Connection;
  onViewProfile: () => void;
  isGuest?: boolean;
}

export default function ConnectionCard({ connection, onViewProfile, isGuest = false }: ConnectionCardProps) {
  return (
    <div
      className="connection-card bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-2 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onViewProfile}
    >
      <div className="text-center">
        <img
          src={connection.avatar}
          alt={connection.name}
          className="w-10 md:w-16 h-10 md:h-16 rounded-full mx-auto mb-2 md:mb-4 object-cover border-2 border-gray-100"
        />
        <h3 className="text-xs md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 leading-tight">
          {isGuest ? connection.name.replace(/\w/g, '*') : connection.name}
        </h3>
        <div className="flex items-center justify-center text-gray-500 text-xs md:text-sm mb-2 md:mb-4">
          <MapPin className="w-3 md:w-4 h-3 md:h-4 mr-1" />
          {connection.location}
        </div>
        
        <div className="bg-indigo-50 rounded-md md:rounded-lg py-1 md:py-3 px-2 md:px-4 mb-2 md:mb-6">
          <span className="text-indigo-600 font-medium text-xs">
            {isGuest ? '***' : connection.recommendationCount} recommendation{connection.recommendationCount !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile();
          }}
          className="w-full py-1.5 md:py-3 px-2 md:px-4 rounded-md md:rounded-lg transition-colors font-medium flex items-center justify-center text-xs md:text-base bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <MessageCircle className="w-3 md:w-5 h-3 md:h-5 mr-1 md:mr-2" />
          <span className="hidden sm:inline">
            View Recommendations
          </span>
          <span className="sm:hidden">
            View
          </span>
        </button>
      </div>
    </div>
  );
}