'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageGuardOptions {
  requiredRole?: 'sadmin' | 'admin' | 'worker';
  requiredPermission?: string;
  redirectTo?: string;
}

export function usePageGuard(options: PageGuardOptions = {}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      setCurrentUser(user);

      // Super Admin bypasses all restrictions
      if (user.role === 'sadmin') {
        setIsAuthorized(true);
        return;
      }

      // Check strictly if sadmin is required
      if (options.requiredRole === 'sadmin' && user.role !== 'sadmin') {
        router.push(options.redirectTo || '/dashboard');
        return;
      }

      // Check granular permission if required
      if (options.requiredPermission) {
        const perms = user.permissions || {};
        if (perms[options.requiredPermission] === false || !perms[options.requiredPermission]) {
          router.push(options.redirectTo || '/dashboard');
          return;
        }
      }

      setIsAuthorized(true);
    } catch {
      router.push('/login');
    }
  }, [router, options.requiredRole, options.requiredPermission, options.redirectTo]);

  return { isAuthorized, currentUser };
}
