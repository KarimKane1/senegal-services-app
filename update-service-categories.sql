-- Update service categories to only include the 4 specified categories
-- Run this in your Supabase SQL editor

-- First, deactivate all existing categories
UPDATE service_categories SET is_active = false;

-- Insert the new limited categories
INSERT INTO service_categories (name, slug, description, sort_order, is_active) VALUES
('Plumber', 'plumber', 'Plumbing services and repairs', 1, true),
('Electrician', 'electrician', 'Electrical services and repairs', 2, true),
('HVAC', 'hvac', 'Heating, ventilation, and air conditioning services', 3, true),
('Carpenter', 'carpenter', 'Carpentry and woodworking services', 4, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Update any existing providers that have other service types to use one of the new categories
-- This is a fallback - you may want to manually review these
UPDATE provider SET service_type = 'plumber' WHERE service_type NOT IN ('plumber', 'electrician', 'hvac', 'carpenter');

-- Update the enum type to only include the new categories
-- Note: This might require dropping and recreating the enum if it's used in constraints
-- ALTER TYPE service_type RENAME TO service_type_old;
-- CREATE TYPE service_type AS ENUM ('plumber', 'electrician', 'hvac', 'carpenter');
-- ALTER TABLE provider ALTER COLUMN service_type TYPE service_type USING service_type::text::service_type;
-- DROP TYPE service_type_old;
