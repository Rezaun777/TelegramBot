import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';
import { requireAuth } from '@/lib/auth';

// Explicitly set runtime to nodejs to avoid Edge Runtime issues with Node.js built-ins
export const runtime = "nodejs";

// PUT /api/templates/[id] - Update a template
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult.redirect) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = params;
    const { keyword, response } = await request.json();
    
    if (!keyword || !response) {
      return new Response(
        JSON.stringify({ message: 'Keyword and response are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    
    // Check if another template already has this keyword
    const existingTemplate = await Template.findOne({ keyword, _id: { $ne: id } });
    if (existingTemplate) {
      return new Response(
        JSON.stringify({ message: 'A template with this keyword already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const template = await Template.findByIdAndUpdate(
      id,
      { keyword, response },
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return new Response(
        JSON.stringify({ message: 'Template not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify(template),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating template:', error);
    
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

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult.redirect) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = params;

    await dbConnect();
    
    const template = await Template.findByIdAndDelete(id);
    
    if (!template) {
      return new Response(
        JSON.stringify({ message: 'Template not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: 'Template deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting template:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}