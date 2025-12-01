import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';

// Define which routes should be protected
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  // Run our auth middleware
  const authResponse = await authMiddleware(request, {} as any);
  
  // If auth middleware returned a response, return it (meaning auth failed)
  if (authResponse) {
    return authResponse;
  }
  
  // Continue with the request
  return NextResponse.next();
}