import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase/server';

export async function GET() {
  try {
    const supabase = supabaseServer();

    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('service_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }

    // Get the next sort order
    const { data: lastCategory } = await supabase
      .from('service_categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = (lastCategory?.sort_order || 0) + 1;

    // Insert new category
    const { data: newCategory, error } = await supabase
      .from('service_categories')
      .insert({
        name,
        slug,
        description: description || '',
        is_active: true,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      category: newCategory 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
