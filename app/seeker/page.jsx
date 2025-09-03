"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SeekerIndex() {
  const router = useRouter();
  useEffect(() => { router.replace('/seeker/services'); }, [router]);
  return null;
}


