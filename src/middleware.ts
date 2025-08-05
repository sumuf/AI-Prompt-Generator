import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs only in development mode
export function middleware(request: NextRequest) {
  // Continue with the request
  return NextResponse.next();
}

// Only run middleware on the client-side in development
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};