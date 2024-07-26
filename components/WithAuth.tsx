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
        if (!user && !isLoading) {
          router.push('/login');
        } else if (user && !user.role) {
          await fetchUserRole();
        } else if (user && user.role && allowedRoles && !allowedRoles.includes(user.role)) {
          router.push('/unauthorized');
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