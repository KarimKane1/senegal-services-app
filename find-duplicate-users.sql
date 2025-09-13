-- Find duplicate users by name to identify test accounts that were created
SELECT 
    name,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids,
    STRING_AGG(phone_e164, ', ') as phone_numbers,
    STRING_AGG(created_at::text, ', ') as created_dates
FROM users 
WHERE name IN ('Karim Kane', 'Maymouna Kane')
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- Show all users with these names to see the full picture
SELECT 
    id,
    name,
    phone_e164,
    created_at,
    user_type
FROM users 
WHERE name IN ('Karim Kane', 'Maymouna Kane')
ORDER BY name, created_at;
