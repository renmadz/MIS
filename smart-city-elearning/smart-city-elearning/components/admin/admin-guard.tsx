'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/browser-client';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const { data: { user }, error: authError } = await supabaseBrowser.auth.getUser();
        if (authError) throw new Error(authError.message);
        if (!user) {
          router.push('/dashboard');
          return;
        }

        // Query public.users for is_admin
        const { data, error: profileError } = await supabaseBrowser
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError.message);
          throw new Error('Failed to fetch user profile');
        }
        if (!data?.is_admin) {
          router.push('/dashboard');
          return;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to authenticate user');
        console.error('Auth error:', err);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">{error}</div>;
  }

  return <>{children}</>;
}