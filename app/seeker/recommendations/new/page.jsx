"use client";
import React, { useEffect } from 'react';
import AddRecommendationModal from '../../../../components/bolt/seeker/AddRecommendationModal';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../../components/context/AuthContext';

export const dynamic = 'force-dynamic';

export default function NewRecommendationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    // If not logged in or wrong role, push to auth with returnTo
    if (!user || user.userType !== 'seeker') {
      const dest = typeof window !== 'undefined' ? window.location.href : pathname;
      const url = `/auth?returnTo=${encodeURIComponent(dest)}`;
      router.replace(url);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user || user.userType !== 'seeker') {
    return <div className="min-h-screen bg-gray-50" />;
  }

  // Always open modal; on close, go back to main recommendations tab
  return <AddRecommendationModal onClose={() => router.replace('/seeker/recommendations')} />;
}


