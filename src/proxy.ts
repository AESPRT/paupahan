import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionUserId = request.cookies.get('session_user_id')?.value;
  const userRoleCookie = request.cookies.get('user_role')?.value;

  const isAdminDashboard = pathname.startsWith('/admin/dashboard');
  const isTenantDashboard = pathname.startsWith('/tenant/dashboard');
  const isTenantLogin = pathname === '/tenant/login';

  // 1. Kung naka-login na ang tenant at pumunta ulit sa login page
  if (isTenantLogin && sessionUserId && userRoleCookie === 'tenant') {
    return NextResponse.redirect(new URL('/tenant/dashboard/home', request.url));
  }

  // 2. Kung walang session sa protected route -> I-redirect sa tamang Login Page
  if ((isAdminDashboard || isTenantDashboard) && !sessionUserId) {
    const loginPath = isAdminDashboard ? '/admin/login' : '/tenant/login';
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // 3. Pag-verify ng Session at Roles para sa mga Protected Routes
  if (sessionUserId) {
    // 🔴 KUNG TENANT ANG NAKA-LOGIN
    if (userRoleCookie === 'tenant') {
      if (isAdminDashboard) {
        return NextResponse.redirect(new URL('/tenant/dashboard/home', request.url));
      }
    } 
    // 🔴 KUNG LANDLORD O ADMIN ANG NAKA-LOGIN
    else if (userRoleCookie === 'admin' || userRoleCookie === 'landlord') {
      if (isTenantDashboard) {
        return NextResponse.redirect(new URL('/admin/dashboard/home', request.url));
      }
    } 
    // 🔴 KUNG MAY COOKIE PERO WALANG TAMANG ROLE (O orphaned session)
    else {
      if (isTenantDashboard) {
        return NextResponse.redirect(new URL('/tenant/login', request.url));
      }
      if (isAdminDashboard) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/tenant/dashboard/:path*',
    '/tenant/login',
  ],
};