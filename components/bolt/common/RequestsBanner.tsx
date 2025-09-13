"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useConnectionRequests } from '../../../hooks/connections';
import { useQueryClient } from '@tanstack/react-query';

export default function RequestsBanner() {
  const router = useRouter();
  const { user } = useAuth();
  const { data } = useConnectionRequests(user?.id);
  const qc = useQueryClient();
  const pending = ((data as any)?.items?.length as number) || 0;
  const latest = pending > 0 ? ((data as any)!.items as any[])[0] : null;
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!user?.id) return;
    const key = `requestsBanner:dismissed:${user.id}`;
    const wasDismissed = sessionStorage.getItem(key) === '1';
    if (pending > 0) setVisible(!wasDismissed);
    else setVisible(false);
  }, [pending, user?.id]);

  if (!user?.id || pending === 0 || !visible) return null;

  return (
    <div className="mx-2 md:mx-0 mt-2">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-yellow-900 font-semibold text-sm md:text-base">
            You have {pending} connection request{pending !== 1 ? 's' : ''}
          </p>
          {latest && (
            <p className="text-yellow-800 text-xs md:text-sm mt-1">
              Latest: {latest.name || 'Member'} wants to connect
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 md:space-x-3 ml-2">
          {latest && (
            <>
              {pending === 1 ? (
                <>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/connections', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requester_user_id: latest.id, recipient_user_id: user?.id, action: 'approve' }),
                        });
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('Friend request accepted successfully:', result);
                          
                          // Force refetch all related queries
                          await Promise.all([
                            qc.refetchQueries({ queryKey: ['connection-requests', user?.id || 'me'] }),
                            qc.refetchQueries({ queryKey: ['connections', user?.id || 'me'] }),
                            qc.refetchQueries({ queryKey: ['sent-connection-requests', user?.id || 'me'] })
                          ]);
                        } else {
                          const errorText = await response.text();
                          console.error('Failed to accept friend request:', response.status, errorText);
                          alert(`Failed to accept friend request: ${errorText}`);
                        }
                      } catch (error) {
                        console.error('Error accepting request:', error);
                      }
                      setVisible(false);
                    }}
                    className="px-2 md:px-3 py-1 rounded-md bg-green-600 text-white text-xs md:text-sm hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/connections', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requester_user_id: latest.id, recipient_user_id: user?.id, action: 'deny' }),
                        });
                        
                        if (response.ok) {
                          // Force refetch connection requests
                          await qc.refetchQueries({ queryKey: ['connection-requests', user?.id || 'me'] });
                        }
                      } catch (error) {
                        console.error('Error declining request:', error);
                      }
                      setVisible(false);
                    }}
                    className="px-2 md:px-3 py-1 rounded-md bg-gray-200 text-gray-800 text-xs md:text-sm hover:bg-gray-300"
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    // Navigate to connections page and open requests modal
                    router.push('/seeker/connections?showRequests=true');
                    setVisible(false);
                  }}
                  className="px-2 md:px-3 py-1 rounded-md bg-indigo-600 text-white text-xs md:text-sm hover:bg-indigo-700"
                >
                  View
                </button>
              )}
            </>
          )}
          <button
            onClick={() => {
              const key = `requestsBanner:dismissed:${user?.id}`;
              sessionStorage.setItem(key, '1');
              setVisible(false);
            }}
            className="text-yellow-800 text-xs md:text-sm hover:underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}


