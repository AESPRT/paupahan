import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/src/lib/prisma'; // Siguraduhing tama ang path sa iyong Prisma client instance

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

  // 3. Pag-verify ng Session, Roles, at DB Existence para sa mga Protected Routes
  if (sessionUserId) {
    let userExists = false;

    try {
      // 🔍 I-verify sa database kung nage-exist pa talaga ang user na ito (dahil baka nag-reset ng DB)
      // I-adjust ang model name mo kung 'User', 'Admin', o 'Tenant' man ang tawag sa Prisma schema mo
      const dbUser = await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { id: true, role: true }, // Kunin lang ang kailangan para mabilis
      });

      if (dbUser) {
        userExists = true;
      }
    } catch (error) {
      console.error('Middleware DB verification error:', error);
      // Kung may error sa DB (hal. offline), pwede mong i-allow muna o i-fail safe
    }

    // 🔴 KUNG WALA NA SA DB (Ibig sabihin nag-reset ng DB o nabura ang user)
    if (!userExists) {
      const loginPath = isAdminDashboard ? '/admin/login' : '/tenant/login';
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      
      // 🧹 Burahin/I-expire ang mga cookies para ma-force logout
      response.cookies.set('session_user_id', '', { maxAge: 0, path: '/' });
      response.cookies.set('user_role', '', { maxAge: 0, path: '/' });
      
      return response;
    }

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
    // 🔴 KUNG MAY COOKIE PERO WALANG TAMANG ROLE
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