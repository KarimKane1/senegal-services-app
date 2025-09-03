import React, { useState } from 'react';
import { X, Check, UserX, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ConnectionRequestsModalProps {
  onClose: () => void;
}

// Mock data for connection requests
const mockConnectionRequests = [
  {
    id: '1',
    name: 'Ibrahima Ndiaye',
    location: 'Dakar',
    avatar: 'https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    mutualConnections: 1,
    mutualNames: ['Sarah Johnson'],
    recommendationCount: 3,
    requestDate: '2024-01-20',
    recommendations: [
      {
        id: 'sp6',
        name: 'Reliable Taxi Service',
        serviceType: 'Driver',
        location: 'Dakar',
        avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 77 888 9999',
        qualities: ['Reliable & Trustworthy', 'Timeliness'],
        watchFor: []
      },
      {
        id: 'sp7',
        name: 'Best Mechanic',
        serviceType: 'Mechanic',
        location: 'Dakar',
        avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 78 777 8888',
        qualities: ['Job quality', 'Fair pricing'],
        watchFor: ['Limited availability']
      }
    ]
  },
  {
    id: '2',
    name: 'Aissatou Diop',
    location: 'Thiès',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    mutualConnections: 2,
    mutualNames: ['Mike Chen', 'Aminata Diop'],
    recommendationCount: 6,
    requestDate: '2024-01-19',
    recommendations: [
      {
        id: 'sp8',
        name: 'Expert Painter',
        serviceType: 'Painter',
        location: 'Thiès',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 76 555 6666',
        qualities: ['Job quality', 'Professional', 'Clean & Organized'],
        watchFor: []
      },
      {
        id: 'sp9',
        name: 'Security Guard Pro',
        serviceType: 'Security',
        location: 'Thiès',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        phone: '+221 77 444 5555',
        qualities: ['Reliable & Trustworthy', 'Professional'],
        watchFor: ['Expensive']
      }
    ]
  }
];

export default function ConnectionRequestsModal({ onClose }: ConnectionRequestsModalProps) {
  const [requests, setRequests] = useState(mockConnectionRequests);
  const { addConnection } = useAuth();

  const handleAcceptRequest = (requestId: string) => {
    const acceptedRequest = requests.find(req => req.id === requestId);
    if (acceptedRequest) {
      // Add the connection and their network to the user's available providers
      addConnection(acceptedRequest);
    }
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Connection Requests</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-sm md:text-base text-gray-600">You're all caught up! No new connection requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1">
                      <img
                        src={request.avatar}
                        alt={request.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-3 md:mr-4"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm md:text-base font-semibold text-gray-900">{request.name}</h4>
                        <div className="flex items-center text-gray-500 text-xs md:text-sm mb-1">
                          <MapPin className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                          {request.location}
                        </div>
                        <div className="flex items-center text-gray-500 text-xs md:text-sm mb-1">
                          <Users className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                          {request.mutualConnections} mutual connection{request.mutualConnections !== 1 ? 's' : ''}
                          {request.mutualConnections > 0 && (
                            <span className="ml-1 text-gray-400">
                              ({request.mutualNames.join(', ')})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-indigo-600">
                          {request.recommendationCount} recommendations
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Requested {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-3">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-600 text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-xs md:text-sm flex items-center"
                      >
                        <Check className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="bg-gray-600 text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-xs md:text-sm flex items-center"
                      >
                        <UserX className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 rounded-lg p-3 md:p-4 mt-4 md:mt-6">
            <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2">About Connection Requests</h4>
            <ul className="text-xs md:text-sm text-gray-600 space-y-1">
              <li>• Only accept requests from people you know and trust</li>
              <li>• Mutual connections help verify trustworthiness</li>
              <li>• You can always remove connections later if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}