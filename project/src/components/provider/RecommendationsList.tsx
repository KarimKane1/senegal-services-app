import React from 'react';
import { MessageCircle, MapPin, Calendar } from 'lucide-react';

const mockRecommenders = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    dateAdded: '2024-01-15',
    qualities: ['Job quality', 'Timeliness', 'Professional'],
    watchFor: ['Expensive']
  },
  {
    id: '2',
    name: 'Mike Chen',
    location: 'Thiès',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    dateAdded: '2024-01-10',
    qualities: ['Reliable & Trustworthy', 'Fair pricing'],
    watchFor: []
  },
  {
    id: '3',
    name: 'Fatou Ba',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    dateAdded: '2024-01-05',
    qualities: ['Clean & Organized', 'Timeliness'],
    watchFor: ['Limited availability']
  }
];

export default function RecommendationsList() {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">People Who Recommend You</h3>
        <p className="text-gray-600">See who trusts and recommends your services</p>
      </div>

      <div className="space-y-4">
        {mockRecommenders.map((recommender) => (
          <div key={recommender.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <img
                  src={recommender.avatar}
                  alt={recommender.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{recommender.name}</h4>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {recommender.location}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(recommender.dateAdded).toLocaleDateString()}
              </div>
            </div>

            {/* Qualities */}
            {recommender.qualities.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">What They Liked</p>
                <div className="flex flex-wrap gap-2">
                  {recommender.qualities.map((quality) => (
                    <span key={quality} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                      {quality}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Things to Watch For */}
            {recommender.watchFor.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Things to Watch For</p>
                <div className="flex flex-wrap gap-2">
                  {recommender.watchFor.map((item) => (
                    <span key={item} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}