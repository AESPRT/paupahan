import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'NONE'
);

// Pinalitan mula 'middleware' patungong 'proxy'
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sinusuportahan ang ating session_user_id cookie pati na rin ang mga token
  const sessionUserId = request.cookies.get('session_user_id')?.value;
  const token = 
    request.cookies.get('token')?.value || 
    request.cookies.get('accessToken')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  const isAdminDashboard = pathname.startsWith('/admin/dashboard');
  const isTenantDashboard = pathname.startsWith('/tenant/dashboard');

  // Kung walang session o token sa protected route
  if ((isAdminDashboard || isTenantDashboard) && !sessionUserId && !token) {
    const loginPath = isAdminDashboard ? '/admin/login' : '/tenant/login';
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // Kung nag-login gamit ang ating database session cookie, ituloy ang request
  if (sessionUserId) {
    return NextResponse.next();
  }

  // Kung may JWT token, i-verify ang signature
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;

      if (isAdminDashboard && userRole !== 'admin' && userRole !== 'landlord') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (isTenantDashboard && userRole !== 'tenant' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error('Proxy JWT Error:', err);
      
      const loginPath = isAdminDashboard ? '/admin/login' : '/tenant/login';
      const loginUrl = new URL(loginPath, request.url);
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      response.cookies.delete('accessToken');
      response.cookies.delete('session_user_id');
      
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/tenant/dashboard/:path*',
  ],
};