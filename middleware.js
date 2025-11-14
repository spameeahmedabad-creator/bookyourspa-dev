import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and public assets
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login'];
  const isPublicPath = publicPaths.some(path => pathname === path);
  const isSpaPath = pathname.startsWith('/spa/');

  // Allow public paths and spa detail pages
  if (isPublicPath || isSpaPath) {
    return NextResponse.next();
  }

  // Protected routes (dashboard) require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
