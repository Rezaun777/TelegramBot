import { NextRequest, NextFetchEvent } from 'next/server';

export async function authMiddleware(request: NextRequest, event: NextFetchEvent) {
  // Skip authentication for specific paths
  if (request.nextUrl.pathname.startsWith('/api/telegram') || 
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/api/auth/login') ||
      request.nextUrl.pathname.startsWith('/api/auth/logout')) {
    return null;
  }

  // Log the request for debugging
  console.log('Auth middleware checking request to:', request.nextUrl.pathname);
  
  // For API routes that require authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('Token from cookie:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Simple token validation using only Web APIs (Edge Runtime compatible)
    try {
      // Use atob for base64 decoding (Web API) instead of Buffer
      const decoded = atob(token);
      const payload = JSON.parse(decoded);
      
      console.log('Token payload:', payload);
      
      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return new Response(
          JSON.stringify({ message: 'Token expired' }),
          { 
            status: 401, 
            headers: { 
              'Content-Type': 'application/json',
            }
          }
        );
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return new Response(
        JSON.stringify({ message: 'Invalid token' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
          }
        }
      );
    }
  }

  return null;
}