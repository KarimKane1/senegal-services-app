import React, { useState } from 'react';
import { X, Search, MapPin, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FindPeopleModalProps {
  onClose: () => void;
}

// Mock data for people you can connect with
const mockSuggestedPeople = [
  {
    id: '1',
    name: 'Ousmane Diallo',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 77 123 4567',
    mutualConnections: 2,
    mutualNames: ['Sarah Johnson', 'Mike Chen'],
    recommendationCount: 4
  },
  {
    id: '2',
    name: 'Fatou Sall',
    location: 'Thiès',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 78 987 6543',
    mutualConnections: 1,
    mutualNames: ['Aminata Diop'],
    recommendationCount: 3
  },
  {
    id: '3',
    name: 'Mamadou Ba',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    phone: '+221 76 555 8901',
    mutualConnections: 1,
    mutualNames: ['Sarah Johnson'],
    recommendationCount: 5
  }
];

export default function FindPeopleModal({ onClose }: FindPeopleModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const { addConnection } = useAuth();

  const maskPhoneNumber = (phone: string) => {
    // Extract the last 4 digits
    const lastFour = phone.slice(-4);
    // Get the country code (assuming format like +221 XX XXX XXXX)
    const countryCode = phone.split(' ')[0];
    return `${countryCode} *****${lastFour.slice(0, 2)} ${lastFour.slice(2)}`;
  };
  const filteredPeople = mockSuggestedPeople.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = (personId: string) => {
    // For demo purposes, we'll simulate immediate acceptance
    // In a real app, this would send a request and wait for acceptance
    const person = mockSuggestedPeople.find(p => p.id === personId);
    if (person) {
      // Add mock recommendations for the person
      const personWithRecommendations = {
        ...person,
        recommendations: [
          {
            id: `sp_${personId}_1`,
            name: `Provider from ${person.name}`,
            serviceType: 'Plumber',
            location: person.location,
            avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
            phone: '+221 77 999 0000',
            qualities: ['Job quality', 'Reliable & Trustworthy'],
            watchFor: []
          }
        ]
      };
      
      addConnection(personWithRecommendations);
      setSentRequests(prev => [...prev, personId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Find People</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4 md:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-12 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
            />
          </div>

          {/* Suggested People */}
          <div className="mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Suggested Connections</h3>
            <div className="space-y-3 md:space-y-4">
              {filteredPeople.map((person) => (
                <div key={person.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3 md:mr-4"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm md:text-base font-semibold text-gray-900">{person.name}</h4>
                        <div className="flex items-center text-gray-500 text-xs md:text-sm mb-1">
                          <MapPin className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                          {person.location}
                        </div>
                        <div className="flex items-center text-gray-500 text-xs md:text-sm">
                          <Users className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                          {person.mutualConnections} mutual connection{person.mutualConnections !== 1 ? 's' : ''}
                          {person.mutualConnections > 0 && (
                            <span className="ml-1 text-gray-400">
                              ({person.mutualNames.join(', ')})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-indigo-600 mt-1">
                          {person.recommendationCount} recommendations
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {maskPhoneNumber(person.phone)}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSendRequest(person.id)}
                      disabled={sentRequests.includes(person.id)}
                      className={`ml-3 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-colors ${
                        sentRequests.includes(person.id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {sentRequests.includes(person.id) ? (
                        'Sent'
                      ) : (
                        <>
                          <UserPlus className="w-3 md:w-4 h-3 md:h-4 mr-1 inline" />
                          Connect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-3 md:p-4">
            <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2">Tips for Growing Your Network</h4>
            <ul className="text-xs md:text-sm text-gray-600 space-y-1">
              <li>• Connect with people you know and trust in real life</li>
              <li>• Look for mutual connections to find trusted people</li>
              <li>• The more connections you have, the better recommendations you'll get</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}