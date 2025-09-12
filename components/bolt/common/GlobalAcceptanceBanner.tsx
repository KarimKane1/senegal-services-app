"use client";
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSentConnectionRequests } from '../../../hooks/connections';
import ConnectionAcceptedBanner from './ConnectionAcceptedBanner';

export default function GlobalAcceptanceBanner() {
  const { user } = useAuth();
  const { data: sentReqData } = useSentConnectionRequests(user?.id);
  const [acceptedFriendName, setAcceptedFriendName] = React.useState<string | null>(null);
  const [showAcceptedBanner, setShowAcceptedBanner] = React.useState(false);
  const previousSentRequests = React.useRef<any[]>([]);

  React.useEffect(() => {
    if (sentReqData?.items && user?.id) {
      const currentSentRequests = sentReqData.items;
      
      // Check for real-time status changes (when user is actively on the page)
      if (previousSentRequests.current.length > 0) {
        currentSentRequests.forEach((currentReq: any) => {
          const previousReq = previousSentRequests.current.find((prev: any) => prev.id === currentReq.id);
          
          // Only show notification if status changed from pending to approved
          if (previousReq && previousReq.status === 'pending' && currentReq.status === 'approved') {
            // Request was accepted! Show notification
            setAcceptedFriendName(currentReq.name || 'Someone');
            setShowAcceptedBanner(true);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
              setShowAcceptedBanner(false);
            }, 5000);
          }
        });
      } else {
        // First time loading - check for requests that were accepted while user was away
        const lastSeenKey = `lastSeenSentRequests:${user.id}`;
        const lastSeenData = localStorage.getItem(lastSeenKey);
        
        if (lastSeenData) {
          try {
            const lastSeenRequests = JSON.parse(lastSeenData);
            
            currentSentRequests.forEach((currentReq: any) => {
              const lastSeenReq = lastSeenRequests.find((prev: any) => prev.id === currentReq.id);
              
              // If this request was pending when we last saw it, but is now approved
              if (lastSeenReq && lastSeenReq.status === 'pending' && currentReq.status === 'approved') {
                // Request was accepted while user was away! Show notification
                setAcceptedFriendName(currentReq.name || 'Someone');
                setShowAcceptedBanner(true);
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                  setShowAcceptedBanner(false);
                }, 5000);
              }
            });
          } catch (e) {
            console.error('Error parsing last seen requests:', e);
          }
        }
        
        // Save current state for next time
        localStorage.setItem(lastSeenKey, JSON.stringify(currentSentRequests));
      }
      
      previousSentRequests.current = currentSentRequests;
    }
  }, [sentReqData, user?.id]);

  return (
    <ConnectionAcceptedBanner
      isVisible={showAcceptedBanner}
      onClose={() => setShowAcceptedBanner(false)}
      friendName={acceptedFriendName || ''}
    />
  );
}
