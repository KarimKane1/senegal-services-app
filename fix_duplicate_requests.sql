-- Fix duplicate connection requests by adding unique constraint
-- This will prevent multiple requests between the same users

-- First, let's clean up any existing duplicates
-- Keep only the most recent request for each pair
DELETE FROM connection_request 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY requester_user_id, recipient_user_id 
             ORDER BY created_at DESC
           ) as rn
    FROM connection_request
  ) t 
  WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE connection_request 
ADD CONSTRAINT unique_connection_request 
UNIQUE (requester_user_id, recipient_user_id);
