import { type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Get session and user
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/*',
    '/certificates',
    '/certificates/*',
    '/courses/*',
    '/learning-paths/*',
    '/admin',
    '/admin/*',
  ];

  // Redirect to login if no session for protected routes
  if (
    protectedRoutes.some(route => pathname.startsWith(route.replace('*', ''))) &&
    (!session || sessionError)
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check is_admin for /admin/* routes
  if (pathname.startsWith('/admin') && (!user || userError)) {
    console.error('Middleware auth error:', userError?.message);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/admin')) {
    if (!user || !user.id) {
      console.error('Middleware profile error: User is null or missing id');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    const { data, error: profileError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !data?.is_admin) {
      console.error('Middleware profile error:', profileError?.message || 'Not an admin');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};