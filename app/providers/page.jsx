"use client";
import React from "react";
import { useProviders } from "../../hooks/providers.ts";
import ServiceProviderCard from "../../components/seeker/ServiceProviderCard.jsx";

export default function ProvidersPage() {
  const { data, isLoading, error } = useProviders({ page: 1 });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="p-6 text-sm text-red-600">Failed to load</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      {data?.items?.map((p) => (
        <ServiceProviderCard key={p.id} provider={{
          id: p.id,
          name: p.name,
          serviceType: p.service_type,
          service_type: p.service_type,
          location: p.city,
          city: p.city,
          avatar: p.photo_url || '',
          phone: '',
          isNetworkRecommendation: false,
          qualities: [],
          watchFor: [],
        }} onViewDetails={() => {}} />
      ))}
      {(!data?.items || data.items.length === 0) && (
        <div className="text-sm text-gray-500">No providers yet.</div>
      )}
    </main>
  );
}


