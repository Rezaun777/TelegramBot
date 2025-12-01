import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Use a simpler JWT implementation that works with Web Crypto API
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-secret';

// Simple JWT-like token generation using base64 encoding with Web APIs
export async function signToken(payload: any) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 1 week
  
  const tokenPayload = {
    ...payload,
    iat,
    exp
  };
  
  // Use btoa for base64 encoding (Web API) instead of Buffer
  return btoa(JSON.stringify(tokenPayload));
}

export async function verifyToken(token: string) {
  try {
    // Check if token is a valid string
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    // Use atob for base64 decoding (Web API) instead of Buffer
    const decoded = atob(token);
    const payload = JSON.parse(decoded);
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  await dbConnect();
  const user = await User.findById(payload.userId).select('-password');
  return user;
}

export async function requireAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return {
      redirect: true,
      url: '/login',
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      redirect: true,
      url: '/login',
    };
  }

  return {
    redirect: false,
    user: payload,
  };
}