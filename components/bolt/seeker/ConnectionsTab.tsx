import React from 'react';
import { UserPlus, Users, Search, Bell } from 'lucide-react';
import ConnectionCard from './ConnectionCard';
import ConnectionProfile from './ConnectionProfile';
import FindPeopleModal from './FindPeopleModal';
import ConnectionRequestsModal from './ConnectionRequestsModal';
import GuestPromptModal from '../common/GuestPromptModal';
import InitialsAvatar from '../common/InitialsAvatar';
import { mockConnections } from '../../data/mockData';
import { useConnectionRequests, useSentConnectionRequests, useConnections, useDiscoverUsers } from '../../../hooks/connections';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import InviteFriendModal from './InviteFriendModal';

export default function ConnectionsTab() {
  const [selectedConnection, setSelectedConnection] = React.useState<any>(null);
  const [showFindPeople, setShowFindPeople] = React.useState(false);
  const [showRequests, setShowRequests] = React.useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = React.useState(false);
  const [showInvite, setShowInvite] = React.useState(false);
  const [sentRequestIds, setSentRequestIds] = React.useState<string[]>([]);
  const [showPersonModal, setShowPersonModal] = React.useState<any>(null);
  const personModalRef = React.useRef<HTMLDivElement>(null);
  const { connections, isGuest, logout, user } = useAuth();
  const { t } = useI18n();
  const { data: networkData } = useConnections(user?.id);
  const { data: reqData } = useConnectionRequests(user?.id);
  const { data: sentReqData } = useSentConnectionRequests(user?.id);
  const { data: discoverData } = useDiscoverUsers(user?.id);
  
  // Live pending requests count (only received requests should show notifications)
  const receivedRequests = ((reqData as any)?.items?.length as number) || 0;
  const sentRequests = ((sentReqData as any)?.items?.length as number) || 0;
  const totalRequests = receivedRequests; // Only count received requests for notifications
  const firstRequest = receivedRequests > 0 ? ((reqData as any)!.items as any[])[0] : null;
  const [showRequestsBanner, setShowRequestsBanner] = React.useState(true);

  React.useEffect(() => {
    // Show banner when there are pending requests on load
    if (receivedRequests > 0) {
      setShowRequestsBanner(true);
    }
  }, [receivedRequests]);

  // Click outside to close person modal
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (personModalRef.current && !personModalRef.current.contains(event.target as Node)) {
        setShowPersonModal(null);
      }
    };
    
    if (showPersonModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPersonModal]);
  
  // Show accepted connections from API, fallback to local
  const allConnections = ((networkData as any)?.items as any[]) || connections;
  
  // Debug logging
  React.useEffect(() => {
    console.log('ConnectionsTab Debug:', {
      userId: user?.id,
      networkData,
      connections,
      allConnections: allConnections.length,
      isGuest
    });
  }, [user?.id, networkData, connections, allConnections.length, isGuest]);
  
  // Process suggested people data
  const apiPeople = ((discoverData as any)?.items as any[]) || [];
  const suggestedPeople = apiPeople.slice(0, 4).map(p => ({
    id: p.id,
    name: p.name || 'Member',
    location: p.location || 'Dakar',
    avatar: p.avatar || p.photo_url || null,
    phone: p.masked_phone || '',
    mutualConnections: p.mutualConnections || 0,
    mutualNames: p.mutualNames || [],
    recommendationCount: p.recommendationCount || 0,
  }));

  const handleSendRequest = async (personId: string) => {
    const person = suggestedPeople.find(p => p.id === personId);
    if (!person || !user?.id) return;
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requester_user_id: user.id, 
          recipient_user_id: person.id, 
          requester_name: user.name, 
          recipient_name: person.name 
        }),
      });
      if (res.ok) setSentRequestIds(prev => [...prev, personId]);
    } catch {
      // no-op for MVP
    }
  };

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
      {/* Requests banner now shown globally in layout */}
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{t('connections.title') || 'Your Trusted Network'}</h2>
        <p className="text-sm md:text-base text-gray-600 px-4 md:px-0">{t('connections.subtitle') || "People you're connected with and their recommendations"}</p>
        
        {/* Connection Actions */}
        <div className="flex justify-center space-x-2 md:space-x-4 mt-3 md:mt-4 px-2 md:px-0">
          <button
            onClick={() => {
              if (isGuest) {
                handleGuestAction();
              } else {
                setShowInvite(true);
              }
            }}
            className="flex items-center px-4 md:px-6 py-3 rounded-lg transition-colors font-semibold text-sm md:text-base bg-indigo-600 text-white hover:bg-indigo-700 shadow invite-friends-top"
          >
            <UserPlus className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
            {t('connections.invite') || 'Invite Friends'}
          </button>
          <button
            onClick={() => {
              if (isGuest) {
                handleGuestAction();
              } else {
                setShowRequests(true);
              }
            }}
            className={`flex items-center px-4 md:px-6 py-3 rounded-lg transition-colors font-semibold text-sm md:text-base relative bg-orange-600 text-white hover:bg-orange-700 shadow requests-btn ${totalRequests>0 ? 'animate-pulse ring-2 ring-orange-300' : ''}`}
          >
            <Bell className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
            {t('connections.requests') || 'Requests'}
            {totalRequests > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center font-bold">
                {totalRequests}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Empty State or Invite Section */}
      {allConnections.length === 0 ? (
        <div className="bg-indigo-50 rounded-xl p-4 md:p-12 text-center mb-4 md:mb-8 mx-2 md:mx-0">
          <Users className="w-12 md:w-16 h-12 md:h-16 text-indigo-400 mx-auto mb-3 md:mb-6" />
          <h3 className="text-base md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">{t('connections.grow') || 'Grow Your Network'}</h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-md mx-auto px-2 md:px-0">
            {t('connections.growText') || "The more friends you have, the better recommendations you'll get"}
          </p>
          <button
            onClick={() => (isGuest ? handleGuestAction() : setShowFindPeople(true))}
            className="bg-blue-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm md:text-base"
          >
            <Search className="w-4 h-4 inline mr-2" />
            {t('connections.findPeople') || 'Find People'}
          </button>
        </div>
      ) : (
        <div className="bg-indigo-50 rounded-xl p-3 md:p-8 text-center mb-4 md:mb-8 mx-2 md:mx-0">
          <Users className="w-10 md:w-12 h-10 md:h-12 text-indigo-400 mx-auto mb-2 md:mb-4" />
          <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">{t('connections.grow') || 'Grow Your Network'}</h3>
          <p className="text-xs md:text-base text-gray-600 mb-3 md:mb-4 px-2 md:px-0">
            {t('connections.growText') || "The more friends you have, the better recommendations you'll get"}
          </p>
          <button
            onClick={() => (isGuest ? handleGuestAction() : setShowFindPeople(true))}
            className="bg-blue-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs md:text-base"
          >
            <Search className="w-3 md:w-4 h-3 md:h-4 inline mr-1 md:mr-2" />
            {t('connections.findPeople') || 'Find People'}
          </button>
        </div>
      )}

      {/* Suggested People Section */}
      {suggestedPeople.length > 0 && !isGuest && (
        <div className="mb-6 mx-2 md:mx-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Suggested for You</h3>
            <button
              onClick={() => setShowFindPeople(true)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              See More →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {suggestedPeople.map((person) => (
              <div key={person.id} className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group cursor-pointer" onClick={() => setShowPersonModal(person)}>
                <div className="flex justify-center mb-4">
                  <InitialsAvatar 
                    name={person.name} 
                    className="w-16 h-16"
                  />
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-4 truncate">{person.name}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendRequest(person.id);
                  }}
                  disabled={sentRequestIds.includes(person.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    sentRequestIds.includes(person.id)
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {sentRequestIds.includes(person.id) ? 'Sent' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Network Section */}
      <div className="mb-6 mx-2 md:mx-0">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            Your Network ({allConnections.length} {allConnections.length === 1 ? 'connection' : 'connections'})
          </h3>
          {allConnections.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No connections yet. Start by inviting friends or finding people to connect with!</p>
            </div>
          )}
        </div>

      {isGuest && allConnections.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-4 text-center mt-6 mx-2 md:mx-0">
          <p className="text-indigo-800 font-medium mb-2">{t('connections.guestCtaText') || 'Want to see all your connections?'}</p>
          <button
            onClick={logout}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            {t('auth.createAccount') || 'Create Account'}
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
      {showInvite && (
        <InviteFriendModal onClose={()=> setShowInvite(false)} inviteUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth?ref=${user?.id || ''}`} />
      )}

      {/* Person Info Modal */}
      {showPersonModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPersonModal(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div ref={personModalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                                    <InitialsAvatar
                    name={showPersonModal.name}
                    className="w-20 h-20"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{showPersonModal.name}</h3>
                <div className="text-sm text-gray-500 mb-6">
                  {showPersonModal.phone || '**** **** ****'}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPersonModal(null)}
                    className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSendRequest(showPersonModal.id);
                      setShowPersonModal(null);
                    }}
                    disabled={sentRequestIds.includes(showPersonModal.id)}
                    className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                      sentRequestIds.includes(showPersonModal.id)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {sentRequestIds.includes(showPersonModal.id) ? 'Request Sent' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}