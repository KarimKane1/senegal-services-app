-- Migration to add dynamic service categories
-- Run this in your Supabase SQL editor

-- 1. Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert the categories that match the frontend
INSERT INTO service_categories (name, slug, description, sort_order) VALUES
('Plumber', 'plumber', 'Plumbing services and repairs', 1),
('Electrician', 'electrician', 'Electrical services and repairs', 2),
('HVAC', 'hvac', 'Heating, ventilation, and air conditioning services', 3),
('Carpenter', 'carpenter', 'Carpentry and woodworking services', 4),
('Handyman', 'handyman', 'General handyman and repair services', 5)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- 3. Add a new column to provider table to reference service_categories
ALTER TABLE provider ADD COLUMN IF NOT EXISTS service_category_id UUID REFERENCES service_categories(id);

-- 4. Update existing providers to use the new service_category_id
UPDATE provider SET service_category_id = (
  SELECT id FROM service_categories WHERE slug = provider.service_type::text
) WHERE service_category_id IS NULL;

-- 5. Update any providers with old service types to use new ones
UPDATE provider SET service_type = 'handyman' WHERE service_type = 'other';
UPDATE provider SET service_type = 'hvac' WHERE service_type = 'cleaner';

-- 6. Make service_category_id NOT NULL after data migration
ALTER TABLE provider ALTER COLUMN service_category_id SET NOT NULL;

-- 6. Add RLS policies for service_categories
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active categories
CREATE POLICY service_categories_select_all ON service_categories
  FOR SELECT USING (is_active = true);

-- Only authenticated users can insert/update/delete (admin functionality)
CREATE POLICY service_categories_admin_all ON service_categories
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_service_category_id ON provider(service_category_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories(is_active);

-- 8. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger to automatically update updated_at
CREATE TRIGGER update_service_categories_updated_at 
  BEFORE UPDATE ON service_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
