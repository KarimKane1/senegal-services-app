-- Clean up test accounts created today
-- This script will delete test users and their associated data

-- First, let's see what test accounts exist
SELECT 
    id, 
    name, 
    email, 
    phone_e164, 
    created_at 
FROM users 
WHERE 
    name ILIKE '%test%' OR 
    name ILIKE '%Test%' OR
    email ILIKE '%test%' OR
    phone_e164 LIKE '%test%'
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

-- Finally, delete the test users
DELETE FROM users 
WHERE 
    name ILIKE '%test%' OR 
    name ILIKE '%Test%' OR
    email ILIKE '%test%' OR
    phone_e164 LIKE '%test%';

-- Verify cleanup
SELECT COUNT(*) as remaining_test_users
FROM users 
WHERE 
    name ILIKE '%test%' OR 
    name ILIKE '%Test%' OR
    email ILIKE '%test%' OR
    phone_e164 LIKE '%test%';

-- Show remaining users (should only be real users like Karim, Maymouna, etc.)
SELECT 
    id, 
    name, 
    email, 
    phone_e164, 
    created_at 
FROM users 
ORDER BY created_at DESC;
