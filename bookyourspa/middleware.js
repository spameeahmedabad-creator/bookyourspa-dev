import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths
  const publicPaths = ['/', '/login', '/spa'];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/spa/'));
  
  // API routes that don't need auth
  const publicApiPaths = ['/api/auth/send-otp', '/api/auth/verify-otp', '/api/spas', '/api/bookings'];
  const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path) && request.method === 'GET');

  // If accessing protected route without token
  if (!isPublicPath && !pathname.startsWith('/api') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token for protected routes
  if (token && !isPublicPath) {
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
