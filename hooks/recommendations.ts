"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseBrowser } from '../lib/supabase/client';

export function useRecommendations(userId?: string) {
  const qp = new URLSearchParams();
  if (userId) qp.set('userId', userId);
  
  console.log('useRecommendations called with userId:', userId);
  console.log('Query params:', qp.toString());
  
  return useQuery({
    queryKey: ['recommendations', userId || 'me'],
    queryFn: async () => {
      const url = `/api/recommendations?${qp.toString()}`;
      console.log('Fetching recommendations from:', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load recommendations');
      const data = await res.json();
      console.log('Recommendations response:', data);
      return data;
    },
    enabled: !!userId,
  });
}

export function useAddRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabaseBrowser.auth.getSession();
      console.log('Session data:', { session, sessionError });
      
      const token = session?.access_token;
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Request headers:', headers);
      
      const res = await fetch('/api/recommendations', { 
        method: 'POST', 
        headers, 
        body: JSON.stringify(body) 
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
        throw new Error(`Failed to add recommendation: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both recommendations and providers queries
      // This ensures the ServicesTab refreshes when recommendations are added
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      qc.invalidateQueries({ queryKey: ['providers'] });
      // Also invalidate all provider queries with different parameters
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'providers' });
    },
  });
}

export function useDeleteRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recommendations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete recommendation');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both recommendations and providers queries
      // This ensures the ServicesTab refreshes when recommendations are deleted
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      qc.invalidateQueries({ queryKey: ['providers'] });
      // Also invalidate all provider queries with different parameters
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'providers' });
    },
  });
}


