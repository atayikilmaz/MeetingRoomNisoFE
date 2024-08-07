"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function withAuth(WrappedComponent: React.ComponentType, allowedRoles?: string[]) {
  return function AuthenticatedComponent(props: any) {
    const { user, isLoading, fetchUserRole } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        console.log('Checking auth. User:', user, 'Is loading:', isLoading);
        if (!user && !isLoading) {
          console.log('No user and not loading, redirecting to login');
          router.push('/login');
        } else if (user && !user.role) {
          console.log('User exists but no role, fetching role');
          await fetchUserRole();
        } else if (user && user.role && allowedRoles && !allowedRoles.includes(user.role)) {
          console.log('User does not have allowed role, redirecting to unauthorized');
          router.push('/login');
        }
        setIsChecking(false);
      };
    
      checkAuth();
    }, [user, isLoading, router, fetchUserRole]);
    if (isLoading || isChecking) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}