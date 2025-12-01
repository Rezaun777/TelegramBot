import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

// Explicitly set runtime to nodejs to avoid Edge Runtime issues with Node.js built-ins
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log('Login endpoint hit');
  
  try {
    // Log the raw request body
    const requestBody = await request.text();
    console.log('Raw request body:', requestBody);
    
    // Parse the JSON
    const { username, password } = JSON.parse(requestBody);
    
    console.log('Login attempt with username:', username);
    
    if (!username || !password) {
      console.log('Missing username or password');
      return new Response(
        JSON.stringify({ message: 'Username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    
    // Find user by username
    const user = await User.findOne({ username });
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', { id: user._id, username: user.username });
    }
    
    if (!user) {
      console.log('User not found');
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return new Response(
        JSON.stringify({ message: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create token
    const token = await signToken({ userId: user._id });
    
    console.log('Token created:', token);
    
    // Return success response with token in cookie
    const response = new Response(
      JSON.stringify({ message: 'Login successful' }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
        }
      }
    );
    
    // Set cookie
    response.headers.append('Set-Cookie', `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    
    console.log('Login successful, cookie set');
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}