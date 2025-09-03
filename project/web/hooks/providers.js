"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useProviders(params = {}) {
  const qp = new URLSearchParams();
  if (params.q) qp.set('q', params.q);
  if (params.service) qp.set('service', params.service);
  if (params.city) qp.set('city', params.city);
  if (params.page) qp.set('page', String(params.page));
  return useQuery({
    queryKey: ['providers', params],
    queryFn: async () => {
      const res = await fetch(`/api/providers?${qp.toString()}`);
      if (!res.ok) throw new Error('Failed to load providers');
      return res.json();
    },
  });
}

export function useProvider(id) {
  return useQuery({
    queryKey: ['provider', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/providers/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
  });
}

export function useAddProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const res = await fetch('/api/providers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed to add provider');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers'] });
    }
  });
}


