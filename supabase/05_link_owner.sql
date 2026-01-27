-- ============================================
-- Link Testing Company Owner
-- ============================================
-- This script links dev.rusydi@gmail.com as owner
-- Run this AFTER:
--   1. 01_schema.sql
--   2. 02_rls_and_auth.sql
--   3. Creating dev.rusydi@gmail.com in Supabase Auth
--   4. Running seed script (04_seed.sql or npx tsx scripts/seed-database.ts)
-- ============================================

-- Step 1: Check if team member exists
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
WHERE tm.email = 'dev.rusydi@gmail.com';

-- Step 2: Get auth user ID
SELECT 
  id as auth_user_id,
  email as auth_email,
  created_at
FROM auth.users 
WHERE email = 'dev.rusydi@gmail.com';

-- Step 3: Ensure team member exists (create if not exists)
INSERT INTO team_members (id, name, email, role, "tasksAssigned", "tasksOverdue")
VALUES ('11', 'Rusydi', 'dev.rusydi@gmail.com', 'owner', 0, 0)
ON CONFLICT (email) DO UPDATE
SET role = 'owner';

-- Step 4: Delete any duplicates (keep only owner role)
DELETE FROM team_members
WHERE email = 'dev.rusydi@gmail.com'
  AND id NOT IN (
    SELECT id FROM team_members
    WHERE email = 'dev.rusydi@gmail.com'
    ORDER BY 
      CASE role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 3
        WHEN 'guest' THEN 4
      END
    LIMIT 1
  );

-- Step 5: Link auth user to team member
UPDATE team_members
SET "authUserId" = (
  SELECT id FROM auth.users WHERE email = 'dev.rusydi@gmail.com'
)::uuid
WHERE email = 'dev.rusydi@gmail.com'
  AND "authUserId" IS NULL;

-- Step 6: Verify the link
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
WHERE tm.email = 'dev.rusydi@gmail.com';

-- ============================================
-- QUICK LINK (if you know your auth user ID)
-- ============================================
-- UPDATE team_members
-- SET "authUserId" = 'YOUR_AUTH_USER_ID_HERE'::uuid
-- WHERE email = 'dev.rusydi@gmail.com';
