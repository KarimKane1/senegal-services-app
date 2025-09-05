"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Page() {
  const router = useRouter();

  // Always redirect to auth page - this page should not be accessible
  React.useEffect(() => {
    router.replace('/auth');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
