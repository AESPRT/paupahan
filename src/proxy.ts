import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionUserId = request.cookies.get('session_user_id')?.value;
  const userRoleCookie = request.cookies.get('user_role')?.value;

  const isAdminDashboard = pathname.startsWith('/admin/dashboard');
  const isTenantDashboard = pathname.startsWith('/tenant/dashboard');
  const isTenantLogin = pathname === '/tenant/login';
  const isAdminLogin = pathname === '/admin/login';

  // 1. Kung naka-login na ang tenant at pumunta ulit sa tenant login page
  if (isTenantLogin && sessionUserId && userRoleCookie === 'tenant') {
    return NextResponse.redirect(new URL('/tenant/dashboard/home', request.url));
  }

  // 🔴 1.1. SECURITY FIX: Kung naka-login ang Landlord/Admin pero pinilit pumunta sa Tenant Login page
  if (isTenantLogin && sessionUserId && (userRoleCookie === 'admin' || userRoleCookie === 'landlord')) {
    return NextResponse.redirect(new URL('/admin/dashboard/home', request.url));
  }

  // 🔴 1.2. SECURITY FIX: Kung naka-login ang Tenant pero pinilit pumunta sa Admin Login page
  if (isAdminLogin && sessionUserId && userRoleCookie === 'tenant') {
    return NextResponse.redirect(new URL('/tenant/dashboard/home', request.url));
  }

  // 2. Kung walang session sa protected route -> I-redirect sa tamang Login Page
  if ((isAdminDashboard || isTenantDashboard) && !sessionUserId) {
    const loginPath = isAdminDashboard ? '/admin/login' : '/tenant/login';
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // 3. Pag-verify ng Session, Roles, at DB Existence para sa mga Protected Routes (at login pages kung may cookie)
  if (sessionUserId) {
    let userExists = false;

    try {
      // 🔍 I-verify sa tamang Prisma table depende sa role ng cookie para hindi mag-fail ang tenant check
      if (userRoleCookie === 'tenant') {
        const dbTenant = await prisma.tenant.findUnique({
          where: { id: sessionUserId },
          select: { id: true },
        });
        if (dbTenant) {
          userExists = true;
        }
      } else if (userRoleCookie === 'admin' || userRoleCookie === 'landlord') {
        const dbUser = await prisma.user.findUnique({
          where: { id: sessionUserId },
          select: { id: true, role: true },
        });
        if (dbUser) {
          userExists = true;
        }
      }
    } catch (error) {
      console.error('Middleware DB verification error:', error);
    }

    // 🔴 KUNG WALA NA SA DB (Na-reset ang DB o nabura ang user/tenant)
    if (!userExists) {
      const loginPath = isAdminDashboard || userRoleCookie === 'admin' || userRoleCookie === 'landlord' 
        ? '/admin/login' 
        : '/tenant/login';
      const response = NextResponse.redirect(new URL(loginPath, request.url));
      
      response.cookies.set('session_user_id', '', { maxAge: 0, path: '/' });
      response.cookies.set('user_role', '', { maxAge: 0, path: '/' });
      
      return response;
    }

    // Kung valid ang user at nasa login page siya habang naka-login na
    if (isTenantLogin || isAdminLogin) {
      const targetDashboard = (userRoleCookie === 'admin' || userRoleCookie === 'landlord') 
        ? '/admin/dashboard/home' 
        : '/tenant/dashboard/home';
      return NextResponse.redirect(new URL(targetDashboard, request.url));
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
    '/admin/login',
  ],
};