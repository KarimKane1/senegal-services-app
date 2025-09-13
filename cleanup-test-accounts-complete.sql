-- Complete cleanup of test accounts including Supabase Auth
-- This script will delete test users from both the users table AND auth.users table

-- First, let's see what test accounts exist in both tables
SELECT 'users table' as source, id::text, name, email, phone_e164, created_at 
FROM users 
WHERE 
    name ILIKE '%test%' OR 
    name ILIKE '%Test%' OR
    email ILIKE '%test%' OR
    phone_e164 LIKE '%test%'

UNION ALL

SELECT 'auth.users table' as source, id::text, raw_user_meta_data->>'name' as name, email, raw_user_meta_data->>'phone' as phone_e164, created_at
FROM auth.users 
WHERE 
    email ILIKE '%test%' OR
    raw_user_meta_data->>'name' ILIKE '%test%' OR
    raw_user_meta_data->>'phone' LIKE '%test%'

ORDER BY created_at DESC;

-- Delete test recommendations first (to avoid foreign key constraints)
DELETE FROM recommendation 
WHERE recommender_user_id IN (
    SELECT id FROM users 
    WHERE 
        name ILIKE '%test%' OR 
        name ILIKE '%Test%' OR
        email ILIKE '%test%' OR
        phone_e164 LIKE '%test%'
);

-- Delete test connection requests
DELETE FROM connection_request 
WHERE requester_user_id IN (
    SELECT id FROM users 
    WHERE 
        name ILIKE '%test%' OR 
        name ILIKE '%Test%' OR
        email ILIKE '%test%' OR
        phone_e164 LIKE '%test%'
) OR recipient_user_id IN (
    SELECT id FROM users 
    WHERE 
        name ILIKE '%test%' OR 
        name ILIKE '%Test%' OR
        email ILIKE '%test%' OR
        phone_e164 LIKE '%test%'
);

-- Delete test connections
DELETE FROM connection 
WHERE user1_id IN (
    SELECT id FROM users 
    WHERE 
        name ILIKE '%test%' OR 
        name ILIKE '%Test%' OR
        email ILIKE '%test%' OR
        phone_e164 LIKE '%test%'
) OR user2_id IN (
    SELECT id FROM users 
    WHERE 
        name ILIKE '%test%' OR 
        name ILIKE '%Test%' OR
        email ILIKE '%test%' OR
        phone_e164 LIKE '%test%'
);

-- Delete test providers (if any were created)
DELETE FROM provider 
WHERE owner_user_id IN (
    SELECT id FROM users 
    WHERE 
        name ILIKE '%test%' OR 
        name ILIKE '%Test%' OR
        email ILIKE '%test%' OR
        phone_e164 LIKE '%test%'
);

-- Delete from users table
DELETE FROM users 
WHERE 
    name ILIKE '%test%' OR 
    name ILIKE '%Test%' OR
    email ILIKE '%test%' OR
    phone_e164 LIKE '%test%';

-- Delete from auth.users table (Supabase Auth)
DELETE FROM auth.users 
WHERE 
    email ILIKE '%test%' OR
    raw_user_meta_data->>'name' ILIKE '%test%' OR
    raw_user_meta_data->>'phone' LIKE '%test%';

-- Verify cleanup
SELECT 'Remaining test users in users table:' as status, COUNT(*) as count
FROM users 
WHERE 
    name ILIKE '%test%' OR 
    name ILIKE '%Test%' OR
    email ILIKE '%test%' OR
    phone_e164 LIKE '%test%'

UNION ALL

SELECT 'Remaining test users in auth.users table:' as status, COUNT(*) as count
FROM auth.users 
WHERE 
    email ILIKE '%test%' OR
    raw_user_meta_data->>'name' ILIKE '%test%' OR
    raw_user_meta_data->>'phone' LIKE '%test%';

-- Show remaining legitimate users
SELECT 
    'Legitimate users remaining:' as status,
    id, 
    name, 
    email, 
    phone_e164, 
    created_at 
FROM users 
ORDER BY created_at DESC;
