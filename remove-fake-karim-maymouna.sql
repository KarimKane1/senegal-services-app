-- Find and remove fake Karim and Maymouna accounts (not the real ones with correct phone numbers)
-- Real Karim: +12026603750
-- Real Maymouna: +12024684440

-- First, let's see what we have
SELECT 
    id,
    name,
    phone_e164,
    created_at,
    user_type
FROM users 
WHERE name IN ('Karim Kane', 'Maymouna Kane')
ORDER BY name, created_at;

-- Delete fake accounts (keep only the ones with correct phone numbers)
DELETE FROM users 
WHERE name = 'Karim Kane' 
  AND phone_e164 != '+12026603750';

DELETE FROM users 
WHERE name = 'Maymouna Kane' 
  AND phone_e164 != '+12024684440';

-- Verify only the real ones remain
SELECT 
    id,
    name,
    phone_e164,
    created_at,
    user_type
FROM users 
WHERE name IN ('Karim Kane', 'Maymouna Kane')
ORDER BY name, created_at;
