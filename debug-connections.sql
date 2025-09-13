-- Debug script to check connection state
-- Replace 'YOUR_USER_ID' with your actual user ID

-- Check all connections for a specific user
SELECT 
    'Connections' as table_name,
    user_a_id,
    user_b_id,
    created_at
FROM connection 
WHERE user_a_id = 'YOUR_USER_ID' OR user_b_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;

-- Check all connection requests for a specific user
SELECT 
    'Connection Requests' as table_name,
    requester_user_id,
    recipient_user_id,
    status,
    created_at,
    responded_at
FROM connection_request 
WHERE requester_user_id = 'YOUR_USER_ID' OR recipient_user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;

-- Check total connection count
SELECT 
    'Connection Count' as metric,
    COUNT(*) as total_connections
FROM connection;

-- Check total connection requests count
SELECT 
    'Request Count' as metric,
    COUNT(*) as total_requests,
    status,
    COUNT(*) as count_by_status
FROM connection_request 
GROUP BY status;

-- Check for any duplicate connections
SELECT 
    'Duplicate Connections' as issue,
    user_a_id,
    user_b_id,
    COUNT(*) as duplicate_count
FROM connection 
GROUP BY user_a_id, user_b_id
HAVING COUNT(*) > 1;
