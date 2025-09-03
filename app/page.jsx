"use client";
import React from 'react';
import Header from '../components/layout/Header.jsx';
import Navigation from '../components/layout/Navigation.jsx';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Page() {
  const tabs = [
    { id: 'services', label: 'Services' },
    { id: 'connections', label: 'Connections' },
    { id: 'profile', label: 'Profile' },
  ];
  const [active, setActive] = React.useState('services');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType="seeker" />
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
