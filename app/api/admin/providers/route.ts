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

    let query = supabase
      .from('provider')
      .select(`
        *,
        recommendation_count:recommendation(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,service_type.ilike.%${search}%,city.ilike.%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: providers, error, count } = await query;

    if (error) {
      console.error('Error fetching providers:', error);
      return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
    }

    // Transform the data to include recommendation count
    const transformedProviders = providers?.map(provider => ({
      ...provider,
      recommendation_count: provider.recommendation_count?.[0]?.count || 0,
    })) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      providers: transformedProviders,
      total: count || 0,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error('Error in providers API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
