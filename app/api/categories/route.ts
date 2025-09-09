import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Return the 5 categories we want
    const categories = [
      { id: '1', name: 'Plumber', slug: 'plumber', description: 'Plumbing services and repairs' },
      { id: '2', name: 'Electrician', slug: 'electrician', description: 'Electrical services and repairs' },
      { id: '3', name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and air conditioning services' },
      { id: '4', name: 'Carpenter', slug: 'carpenter', description: 'Carpentry and woodworking services' },
      { id: '5', name: 'Handyman', slug: 'handyman', description: 'General handyman and repair services' }
    ];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
