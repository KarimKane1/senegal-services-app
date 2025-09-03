"use client";
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAttributeVote(providerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { attribute: string; vote: 'like' | 'note'; text?: string; user_id: string }) => {
      const res = await fetch(`/api/providers/${providerId}/attribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to vote');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider', providerId] });
    },
  });
}


