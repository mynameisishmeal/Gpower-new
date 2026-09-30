'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PageGuardOptions {
  requiredRole?: 'sadmin' | 'admin' | 'worker';
  requiredPermission?: string;
  redirectTo?: string;
}

export function usePageGuard(options: PageGuardOptions = {}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const evaluatePermission = useCallback((userData: any) => {
    if (!userData) return false;

    // Super Admin bypasses all checks
    if (userData.role === 'sadmin') {
      return true;
    }

    // Role check
    if (options.requiredRole === 'sadmin' && userData.role !== 'sadmin') {
      return false;
    }

    // Granular permission check
    if (options.requiredPermission) {
      const perms = userData.permissions || {};
      if (perms[options.requiredPermission] !== true) {
        return false;
      }
    }

    return true;
  }, [options.requiredRole, options.requiredPermission]);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      router.push('/login');
      return;
    }

    let localUser: any = null;
    try {
      localUser = JSON.parse(rawUser);
      setCurrentUser(localUser);
      setRole(localUser.role || '');
      setPermissions(localUser.permissions || {});

      const localAllowed = evaluatePermission(localUser);
      if (!localAllowed) {
        router.push(options.redirectTo || '/dashboard');
        return;
      }
      setIsAuthorized(true);
      setLoading(false);
    } catch {
      router.push('/login');
      return;
    }

    // Live sync permissions from server to guarantee changes from Super Admin apply immediately
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((freshUser) => {
        if (!freshUser) return;
        const updated = {
          ...localUser,
          role: freshUser.role,
          permissions: freshUser.permissions || {}
        };
        localStorage.setItem('user', JSON.stringify(updated));
        setCurrentUser(updated);
        setRole(updated.role || '');
        setPermissions(updated.permissions || {});

        const freshAllowed = evaluatePermission(updated);
        if (!freshAllowed) {
          setIsAuthorized(false);
          router.push(options.redirectTo || '/dashboard');
        } else {
          setIsAuthorized(true);
        }
      })
      .catch(() => {
        // network issue, keep cached authorization
      });
  }, [router, evaluatePermission, options.redirectTo]);

  const canManage = role === 'sadmin' || (options.requiredPermission ? permissions[options.requiredPermission] === true : false);

  return { isAuthorized, loading, currentUser, role, permissions, canManage };
}
