import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Convert JWT secret to Uint8Array for jose
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'NONE'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get token from cookies or Authorization header
  const token = 
    request.cookies.get('token')?.value || 
    request.cookies.get('accessToken')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isPortalRoute = pathname.startsWith('/portal');

  // 2. If trying to access protected route without token
  if ((isDashboardRoute || isPortalRoute) && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If token exists, verify signature & claims
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // (Optional) Role-Based Guarding
      // e.g., Guard /dashboard for admins and /portal for tenants
      const userRole = payload.role as string;

      if (isDashboardRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (isPortalRoute && userRole !== 'tenant' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Valid token -> continue request
      return NextResponse.next();

    } catch (err) {
      // Token is invalid, expired, or tampered with
      console.error('Middleware JWT Error:', err);
      const loginUrl = new URL('/admin/login', request.url);
      
      // Clear invalid cookie on redirect
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      response.cookies.delete('accessToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/portal/:path*',
  ],
};