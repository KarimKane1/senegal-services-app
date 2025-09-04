"use client";
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header.jsx';
import Navigation from '../components/layout/Navigation.jsx';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [active, setActive] = React.useState('services');

  const tabs = [
    { id: 'services', label: 'Services' },
    { id: 'connections', label: 'Connections' },
    { id: 'profile', label: 'Profile' },
  ];

  // Redirect unauthenticated users to auth page
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={user.userType} />
      <div className="max-w-6xl mx-auto px-2 md:px-4">
        <Navigation tabs={tabs} activeTab={active} setActiveTab={setActive} />
        <div className="py-4">
          {active === 'services' && (
            <div>
              <div className="text-sm text-gray-500 mb-3">Browse trusted providers</div>
              <Link href="/providers" className="text-indigo-600 hover:underline">Open provider list</Link>
            </div>
          )}
          {active !== 'services' && (
            <div className="text-sm text-gray-400">This tab will be ported next.</div>
          )}
        </div>
      </div>
    </div>
  );
}
