'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AccessDenied from './AccessDenied';

type Role = 'ADMIN' | 'VIEWER' | 'BILLING_MANAGER';

interface Props {
  children:     React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading CloudLens...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Role check — show access denied instead of blank/redirect
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied requiredRole={allowedRoles[0]} />;
  }

  return <>{children}</>;
}