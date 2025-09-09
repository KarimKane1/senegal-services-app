import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/server';

export async function POST() {
  try {
    const supabase = supabaseServer();
    
    // First, deactivate all existing categories
    const { error: deactivateError } = await supabase
      .from('service_categories')
      .update({ is_active: false });
    
    if (deactivateError) {
      console.error('Error deactivating categories:', deactivateError);
    }
    
    // Insert/update the correct categories
    const categories = [
      { name: 'Plumber', slug: 'plumber', description: 'Plumbing services and repairs', sort_order: 1 },
      { name: 'Electrician', slug: 'electrician', description: 'Electrical services and repairs', sort_order: 2 },
      { name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and air conditioning services', sort_order: 3 },
      { name: 'Carpenter', slug: 'carpenter', description: 'Carpentry and woodworking services', sort_order: 4 },
      { name: 'Handyman', slug: 'handyman', description: 'General handyman and repair services', sort_order: 5 }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const category of categories) {
      try {
        const { error: upsertError } = await supabase
          .from('service_categories')
          .upsert({
            ...category,
            is_active: true
          }, {
            onConflict: 'slug'
          });
        
        if (upsertError) {
          console.error(`Error upserting category ${category.slug}:`, upsertError);
          errorCount++;
        } else {
          console.log(`Successfully upserted category: ${category.slug}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing category ${category.slug}:`, error);
        errorCount++;
      }
    }
    
    // Update any existing providers with old service types
    const { error: updateError } = await supabase
      .from('provider')
      .update({ service_type: 'handyman' })
      .eq('service_type', 'other');
    
    if (updateError) {
      console.error('Error updating providers with other service type:', updateError);
    }
    
    const { error: updateError2 } = await supabase
      .from('provider')
      .update({ service_type: 'hvac' })
      .eq('service_type', 'cleaner');
    
    if (updateError2) {
      console.error('Error updating providers with cleaner service type:', updateError2);
    }
    
    return NextResponse.json({
      message: 'Categories fixed successfully',
      successCount,
      errorCount,
      categories: categories.map(c => c.slug)
    });
    
  } catch (error) {
    console.error('Category fix error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
