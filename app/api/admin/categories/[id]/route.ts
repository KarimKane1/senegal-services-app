import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../../../lib/supabase/server';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, description, is_active } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Check if slug already exists (excluding current category)
    const { data: existingCategory } = await supabase
      .from('service_categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single();

    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }

    // Update category
    const { data: updatedCategory, error } = await supabase
      .from('service_categories')
      .update({
        name,
        slug,
        description: description || '',
        is_active: is_active !== undefined ? is_active : true,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      category: updatedCategory 
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = supabaseServer();

    // Check if any providers are using this category
    const response = await supabase
      .from('provider')
      .select('id')
      .eq('service_category_id', params.id)
      .limit(1)
      .maybeSingle();
    const providersUsingCategory = response?.data;

    if (providersUsingCategory) {
      return NextResponse.json({ 
        error: 'Cannot delete category. It is being used by providers. Deactivate it instead.' 
      }, { status: 400 });
    }

    // Delete category
    const response = await supabase
      .from('service_categories')
      .delete()
      .eq('id', params.id)
      .then();
    const error = response?.error;

    if (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
