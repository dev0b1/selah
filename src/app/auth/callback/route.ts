import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // prefer explicit query param, otherwise fall back to post_auth_redirect cookie saved by client
  const cookieStore = await cookies();
  const cookieRedirect = cookieStore.get('post_auth_redirect')?.value;
  const redirectTo = searchParams.get('redirectTo') || (cookieRedirect ? decodeURIComponent(cookieRedirect) : undefined) || '/app';

  if (code) {
    if (process.env.NODE_ENV !== 'production') {
      // Dev-only debug info to help track OAuth redirects without printing secrets
      try {
        console.log('[auth/callback] received code, redirectTo=', redirectTo);
        console.log('[auth/callback] searchParams:', Object.fromEntries(searchParams.entries()));
        const cookieNames = (await cookieStore.getAll()).map(c => c.name);
        console.log('[auth/callback] cookie names present:', cookieNames);
      } catch (e) {
        // swallow any logging errors
      }
    }
  // reuse cookieStore defined above
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message || error);
    } else {
      console.log('[auth/callback] exchangeCodeForSession succeeded');
    }

    if (!error) {
      // clear the cookie so it doesn't linger
      try {
        cookieStore.set('post_auth_redirect', '', { path: '/', maxAge: 0 });
      } catch (e) {}
      
      // Fix redirect URL to use localhost instead of 0.0.0.0
      const baseUrl = request.url.replace('0.0.0.0', 'localhost');
      
      // Redirect to checkout if user came from subscribe button
      if (redirectTo === '/checkout') {
        return NextResponse.redirect(new URL('/checkout', baseUrl));
      }
      // Otherwise redirect to the original page
      return NextResponse.redirect(new URL(redirectTo, baseUrl));
    }
  }

  // return the user to an error page with instructions
  const baseUrl = request.url.replace('0.0.0.0', 'localhost');
  return NextResponse.redirect(new URL('/auth?error=authentication_failed', baseUrl));
}
