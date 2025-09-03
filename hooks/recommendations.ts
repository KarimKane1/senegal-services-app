"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseBrowser } from '../lib/supabase/client';

export function useRecommendations(userId?: string) {
  const qp = new URLSearchParams();
  if (userId) qp.set('userId', userId);
  return useQuery({
    queryKey: ['recommendations', userId || 'me'],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations?${qp.toString()}`);
      if (!res.ok) throw new Error('Failed to load recommendations');
      return res.json();
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
      qc.invalidateQueries({ queryKey: ['recommendations'] });
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
      qc.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}


