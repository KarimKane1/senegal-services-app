import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { event_type, user_id, provider_id, metadata } = await req.json();

    if (!event_type) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    const supabase = supabaseServer();

    // In production, you'd have an events table to store these
    // For now, we'll just log to console and return success
    console.log('Admin Event:', {
      event_type,
      user_id,
      provider_id,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Example events table structure (you'd create this in Supabase):
    /*
    CREATE TABLE events (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id UUID REFERENCES users(id),
      provider_id UUID REFERENCES provider(id),
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Event logged successfully' 
    });
  } catch (error) {
    console.error('Error logging event:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const event_type = searchParams.get('event_type');
    const days = parseInt(searchParams.get('days') || '7');

    const supabase = supabaseServer();

    // In production, you'd query the events table
    // For now, return mock data
    const mockEvents = [
      { event_type: 'profile_view', count: 45, date: '2024-01-01' },
      { event_type: 'contact_click', count: 12, date: '2024-01-01' },
      { event_type: 'profile_view', count: 38, date: '2024-01-02' },
      { event_type: 'contact_click', count: 8, date: '2024-01-02' },
      // ... more mock data
    ];

    return NextResponse.json({ 
      events: mockEvents,
      total: mockEvents.length 
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
