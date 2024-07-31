"use client"

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HandleToken() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchUserRole } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      console.log('Received token from URL:', token);
      localStorage.setItem('token', token);
      fetchUserRole().then(() => {
        router.push('/calendar');
      });
    }
  }, [searchParams, router, fetchUserRole]);

  return null;
}