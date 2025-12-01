import { NextRequest } from 'next/server';

// Explicitly set runtime to nodejs for consistency with other auth routes
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Create response with cookie removal
  const response = new Response(
    JSON.stringify({ message: 'Logout successful' }),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
      }
    }
  );
  
  // Remove auth token cookie
  response.headers.append('Set-Cookie', 'auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  
  return response;
}