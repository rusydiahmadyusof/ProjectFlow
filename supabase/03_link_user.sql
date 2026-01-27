-- ============================================
-- Link Auth User to Team Member
-- ============================================
-- Run this AFTER:
--   1. 01_schema.sql
--   2. 02_rls_and_auth.sql
--   3. Creating your user in Supabase Auth
-- ============================================
-- INSTRUCTIONS:
-- Replace 'your-email@example.com' with your actual email
-- ============================================

-- Step 1: Check current status
SELECT 
  tm.id,
  tm.name,
  tm.email,
  tm.role,
  tm."authUserId",
  CASE 
    WHEN tm."authUserId" IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as link_status
FROM team_members tm
WHERE tm.email = 'your-email@example.com';

-- Step 2: Get your auth user ID
SELECT 
  id as auth_user_id,
  email as auth_email,
  created_at
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 3: Delete duplicates (keep only the highest priority role)
-- Priority: admin > owner > member > guest
DELETE FROM team_members
WHERE email = 'your-email@example.com'
  AND id NOT IN (
    SELECT id FROM team_members
    WHERE email = 'your-email@example.com'
    ORDER BY 
      CASE role
        WHEN 'admin' THEN 1
        WHEN 'owner' THEN 2
        WHEN 'member' THEN 3
        WHEN 'guest' THEN 4
      END
    LIMIT 1
  );

-- Step 4: Link auth user to team member
UPDATE team_members
SET "authUserId" = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
)::uuid
WHERE email = 'your-email@example.com'
  AND "authUserId" IS NULL;

-- Step 5: Verify the link
SELECT 
  tm.id,
  tm.name,
  tm.email,
  tm.role,
  tm."authUserId",
  au.email as auth_email,
  CASE 
    WHEN tm."authUserId" IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as link_status
FROM team_members tm
LEFT JOIN auth.users au ON tm."authUserId" = au.id
WHERE tm.email = 'your-email@example.com';

-- ============================================
-- QUICK LINK (if you know your auth user ID)
-- ============================================
-- UPDATE team_members
-- SET "authUserId" = 'YOUR_AUTH_USER_ID_HERE'::uuid
-- WHERE email = 'your-email@example.com';
