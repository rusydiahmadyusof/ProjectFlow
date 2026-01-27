-- ============================================
-- Check for Duplicate Users
-- ============================================
-- Run this to check if there are duplicate team members
-- ============================================

-- Check for duplicate emails (should be 0 if UNIQUE constraint is working)
SELECT 
  email,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(role::text, ', ') as roles
FROM team_members
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Check for duplicate authUserId (should be 0 if UNIQUE constraint is working)
SELECT 
  "authUserId",
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(email::text, ', ') as emails,
  STRING_AGG(role::text, ', ') as roles
FROM team_members
WHERE "authUserId" IS NOT NULL
GROUP BY "authUserId"
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Summary: Total team members and potential duplicates
SELECT 
  (SELECT COUNT(*) FROM team_members) as total_team_members,
  (SELECT COUNT(DISTINCT email) FROM team_members) as unique_emails,
  (SELECT COUNT(*) - COUNT(DISTINCT email) FROM team_members) as duplicate_emails,
  (SELECT COUNT(DISTINCT "authUserId") FROM team_members WHERE "authUserId" IS NOT NULL) as unique_auth_users,
  (SELECT COUNT(*) - COUNT(DISTINCT "authUserId") FROM team_members WHERE "authUserId" IS NOT NULL) as duplicate_auth_users;

-- ============================================
-- If duplicates are found:
-- ============================================
-- 1. For a specific email: Run 03_link_user.sql (replace email)
-- 2. For dev.rusydi@gmail.com: Run 05_link_owner.sql
-- 3. For other emails: Manually delete duplicates keeping the highest priority role
