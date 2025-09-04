-- Fix duplicate phone numbers in users table
-- This script will:
-- 1. Find duplicate phone numbers
-- 2. Keep the oldest user (first created)
-- 3. Delete newer duplicates
-- 4. Add unique constraint to prevent future duplicates

-- First, let's see what duplicates exist
SELECT phone_e164, COUNT(*) as count, array_agg(id) as user_ids, array_agg(name) as names, array_agg(created_at) as created_dates
FROM users 
WHERE phone_e164 IS NOT NULL 
GROUP BY phone_e164 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Create a temporary table to identify which users to keep (oldest) and which to delete
CREATE TEMP TABLE duplicate_phones AS
SELECT 
  phone_e164,
  id,
  name,
  created_at,
  ROW_NUMBER() OVER (PARTITION BY phone_e164 ORDER BY created_at ASC) as rn
FROM users 
WHERE phone_e164 IS NOT NULL;

-- Show what will be deleted
SELECT 
  phone_e164,
  id as user_id_to_delete,
  name as name_to_delete,
  created_at as delete_date
FROM duplicate_phones 
WHERE rn > 1
ORDER BY phone_e164, created_at;

-- Delete the duplicate users (keep the oldest)
DELETE FROM users 
WHERE id IN (
  SELECT id 
  FROM duplicate_phones 
  WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE users ADD CONSTRAINT unique_phone_e164 UNIQUE (phone_e164);

-- Clean up
DROP TABLE duplicate_phones;
