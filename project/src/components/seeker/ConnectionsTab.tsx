import React from 'react';
import { UserPlus, Users, Search, Bell } from 'lucide-react';
import ConnectionCard from './ConnectionCard';
import ConnectionProfile from './ConnectionProfile';
import FindPeopleModal from './FindPeopleModal';
import ConnectionRequestsModal from './ConnectionRequestsModal';
import GuestPromptModal from '../common/GuestPromptModal';
import { mockConnections } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function ConnectionsTab() {
  const [selectedConnection, setSelectedConnection] = React.useState<any>(null);
  const [showFindPeople, setShowFindPeople] = React.useState(false);
  const [showRequests, setShowRequests] = React.useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = React.useState(false);
  const { connections, isGuest, logout } = useAuth();
  
  // Mock data for pending requests
  const pendingRequests = 2;
  
  // Combine mock connections with accepted connections
  const allConnections = [...mockConnections, ...connections];

  const handleGuestAction = () => {
    if (isGuest) {
      setShowGuestPrompt(true);
      return;
    }
  };

  if (selectedConnection) {
    return (
      <ConnectionProfile 
        connection={selectedConnection} 
        onBack={() => setSelectedConnection(null)} 
      />
    );
  }

  return (
    <div>
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Your Trusted Network</h2>
        <p className="text-sm md:text-base text-gray-600 px-4 md:px-0">People you're connected with and their recommendations</p>
        
        {/* Connection Actions */}
        <div className="flex justify-center space-x-2 md:space-x-4 mt-3 md:mt-4 px-2 md:px-0">
          <button
            onClick={() => {
              if (isGuest) {
                handleGuestAction();
              } else {
                setShowFindPeople(true);
              }
            }}
            className="flex items-center px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm bg-blue-600 text-white hover:bg-blue-700"
          >
            <Search className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
            Find People
          </button>
          <button
            onClick={() => {
              if (isGuest) {
                handleGuestAction();
              } else {
                setShowRequests(true);
              }
            }}
            className="flex items-center px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm relative bg-orange-600 text-white hover:bg-orange-700"
          >
            <Bell className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
            Requests
            {pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-bold">
                {pendingRequests}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Empty State or Invite Section */}
      {allConnections.length === 0 ? (
        <div className="bg-indigo-50 rounded-xl p-4 md:p-12 text-center mb-4 md:mb-8 mx-2 md:mx-0">
          <Users className="w-12 md:w-16 h-12 md:h-16 text-indigo-400 mx-auto mb-3 md:mb-6" />
          <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">Grow Your Network</h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-md mx-auto px-2 md:px-0">
            The more friends you have, the better recommendations you'll get
          </p>
          <button className="bg-indigo-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
            <UserPlus className="w-4 md:w-5 h-4 md:h-5 inline mr-2 invite-friends-btn" />
            Invite Friends
          </button>
        </div>
      ) : (
        <div className="bg-indigo-50 rounded-xl p-3 md:p-8 text-center mb-4 md:mb-8 mx-2 md:mx-0">
          <Users className="w-10 md:w-12 h-10 md:h-12 text-indigo-400 mx-auto mb-2 md:mb-4" />
          <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Grow Your Network</h3>
          <p className="text-xs md:text-base text-gray-600 mb-3 md:mb-4 px-2 md:px-0">
            The more friends you have, the better recommendations you'll get
          </p>
          <button className="bg-indigo-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs md:text-base invite-friends-btn">
            <UserPlus className="w-3 md:w-4 h-3 md:h-4 inline mr-1 md:mr-2 invite-friends-btn" />
            Invite Friends
          </button>
        </div>
      )}

      {/* Connections Grid */}
      {allConnections.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 px-2 md:px-0">
          {(isGuest ? allConnections.slice(0, 2) : allConnections).map((connection) => (
            <ConnectionCard 
              key={connection.id} 
              connection={connection} 
              onViewProfile={() => {
                if (isGuest) {
                  handleGuestAction();
                } else {
                  setSelectedConnection(connection);
                }
              }}
              isGuest={isGuest}
            />
          ))}
        </div>
      )}

      {isGuest && allConnections.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-4 text-center mt-6 mx-2 md:mx-0">
          <p className="text-indigo-800 font-medium mb-2">Want to see all your connections?</p>
          <button
            onClick={logout}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            Create Account
          </button>
        </div>
      )}

      {showFindPeople && (
        <FindPeopleModal onClose={() => setShowFindPeople(false)} />
      )}

      {showRequests && (
        <ConnectionRequestsModal onClose={() => setShowRequests(false)} />
      )}

      {showGuestPrompt && (
        <GuestPromptModal onClose={() => setShowGuestPrompt(false)} />
      )}
    </div>
  );
}