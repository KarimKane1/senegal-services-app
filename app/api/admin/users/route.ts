import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const supabase = supabaseServer();
    const offset = (page - 1) * limit;

    // Get all users first to deduplicate by phone number
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone_e164.ilike.%${search}%`);
    }

    const { data: allUsers, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Deduplicate by phone number (keep the most recent record for each phone number)
    const phoneMap = new Map();
    allUsers?.forEach(user => {
      if (user.phone_e164) {
        if (!phoneMap.has(user.phone_e164) || new Date(user.created_at) > new Date(phoneMap.get(user.phone_e164).created_at)) {
          phoneMap.set(user.phone_e164, user);
        }
      } else {
        // Keep users without phone numbers (they'll be unique by ID anyway)
        phoneMap.set(user.id, user);
      }
    });

    const uniqueUsers = Array.from(phoneMap.values());
    const totalCount = uniqueUsers.length;

    // Apply pagination to deduplicated results
    const users = uniqueUsers.slice(offset, offset + limit);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users: users || [],
      total: totalCount,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
