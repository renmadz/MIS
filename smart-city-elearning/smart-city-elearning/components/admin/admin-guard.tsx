'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/components/providers/user-provider';

/**
 * Soft client-side gate for admin pages. Reads the shared user context instead of
 * running its own getUser()+users select. Middleware remains the authoritative
 * server-side gate; this only controls what the client renders.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!profile?.is_admin) router.push('/dashboard');
  }, [loading, profile, router]);

  // While loading, or when not an admin (redirect in flight), don't flash the
  // protected content.
  if (loading || !profile?.is_admin) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return <>{children}</>;
}
