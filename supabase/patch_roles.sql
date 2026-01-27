-- Patch: Add role model + project memberships
-- Run this in Supabase SQL Editor AFTER you have already run schema.sql.
-- It will:
-- 1) Update team_members.role to use the new global roles
-- 2) Create the project_memberships table for per-project access
-- 3) Enable dev-friendly RLS policies on the new table

-- 1. Update team_members.role constraint to new role set
ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_role_check;

ALTER TABLE team_members
  ADD CONSTRAINT team_members_role_check
  CHECK (role IN ('owner', 'admin', 'member', 'guest'));

-- 2. Create project_memberships table (if it doesn't exist yet)
CREATE TABLE IF NOT EXISTS project_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "projectId" TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "memberId" TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'guest')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id
  ON project_memberships("projectId");

CREATE INDEX IF NOT EXISTS idx_project_memberships_member_id
  ON project_memberships("memberId");

-- 3. RLS & dev policy (same as other tables for now)
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'project_memberships'
      AND policyname = 'Allow all operations on project_memberships'
  ) THEN
    CREATE POLICY "Allow all operations on project_memberships"
      ON project_memberships
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

