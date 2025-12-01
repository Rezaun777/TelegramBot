import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';
import { requireAuth } from '@/lib/auth';

// Explicitly set runtime to nodejs to avoid Edge Runtime issues with Node.js built-ins
export const runtime = "nodejs";

// GET /api/templates - Get all templates
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult.redirect) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    
    const templates = await Template.find({}).sort({ createdAt: -1 });
    
    return new Response(
      JSON.stringify(templates),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching templates:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult.redirect) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { keyword, response } = await request.json();
    
    if (!keyword || !response) {
      return new Response(
        JSON.stringify({ message: 'Keyword and response are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    
    // Check if keyword already exists
    const existingTemplate = await Template.findOne({ keyword });
    if (existingTemplate) {
      return new Response(
        JSON.stringify({ message: 'A template with this keyword already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const template = new Template({ keyword, response });
    await template.save();
    
    return new Response(
      JSON.stringify(template),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating template:', error);
    
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ message: 'A template with this keyword already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}