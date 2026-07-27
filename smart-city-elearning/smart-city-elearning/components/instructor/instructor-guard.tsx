'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/components/providers/user-provider';

/**
 * Soft client-side gate for instructor pages, mirroring AdminGuard. Reads the
 * shared user context instead of its own getUser()+users select. Checks
 * is_instructor AND status='active' (matching is_instructor() AND
 * is_active_user() in RLS). Middleware is the authoritative server-side gate.
 */
export function InstructorGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.push('/login');
      return;
    }
    if (!profile.is_instructor || profile.status !== 'active') {
      router.push('/dashboard');
    }
  }, [loading, profile, router]);

  const allowed = !!profile?.is_instructor && profile?.status === 'active';
  if (loading || !allowed) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return <>{children}</>;
}
