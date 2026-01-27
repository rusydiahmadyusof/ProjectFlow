-- ============================================
-- Row Level Security & Authentication Setup
-- ============================================
-- Run this SECOND in Supabase SQL Editor
-- AFTER: 01_schema.sql
-- BEFORE: Creating users in Supabase Auth
-- ============================================

-- ============================================
-- STEP 1: Remove Temporary "Allow All" Policies
-- ============================================
DROP POLICY IF EXISTS "temp_allow_all_projects" ON projects;
DROP POLICY IF EXISTS "temp_allow_all_tasks" ON tasks;
DROP POLICY IF EXISTS "temp_allow_all_project_memberships" ON project_memberships;
DROP POLICY IF EXISTS "temp_allow_all_team_members" ON team_members;
DROP POLICY IF EXISTS "temp_allow_all_notifications" ON notifications;
DROP POLICY IF EXISTS "temp_allow_all_activities" ON activities;
DROP POLICY IF EXISTS "temp_allow_all_dashboard_stats" ON dashboard_stats;
DROP POLICY IF EXISTS "temp_allow_all_users" ON users;

-- ============================================
-- STEP 2: Team Members RLS Policies
-- ============================================

-- Users can read their own team_member record
CREATE POLICY "team_members_self_read"
ON team_members
FOR SELECT
USING ("authUserId" = auth.uid());

-- Owner/Admin can read all team members
CREATE POLICY "team_members_owner_admin_read_all"
ON team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
);

-- Users can update their own record to link authUserId (initial setup)
CREATE POLICY "team_members_self_link_auth_user"
ON team_members
FOR UPDATE
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND "authUserId" IS NULL
)
WITH CHECK (
  "authUserId" = auth.uid()
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Users can update their own record if already linked
CREATE POLICY "team_members_self_update"
ON team_members
FOR UPDATE
USING ("authUserId" = auth.uid())
WITH CHECK ("authUserId" = auth.uid());

-- Owner/Admin can update team members (for role changes, etc.)
CREATE POLICY "team_members_owner_admin_update"
ON team_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
);

-- Owner/Admin can delete team members
CREATE POLICY "team_members_owner_admin_delete"
ON team_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
);

-- ============================================
-- STEP 3: Projects RLS Policies
-- ============================================

-- Owner/Admin: Full CRUD access to all projects
CREATE POLICY "projects_owner_admin_full"
ON projects
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
);

-- Member/Guest: Read-only access to projects they're assigned to
CREATE POLICY "projects_member_guest_read"
ON projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN project_memberships pm ON pm."memberId" = tm.id
    WHERE tm."authUserId" = auth.uid()
      AND pm."projectId" = projects.id
  )
);

-- ============================================
-- STEP 4: Project Memberships RLS Policies
-- ============================================

-- Owner/Admin: Full CRUD access to all project memberships
CREATE POLICY "pm_owner_admin_full"
ON project_memberships
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
);

-- Member/Guest: Read-only access to their own memberships
CREATE POLICY "pm_member_guest_read"
ON project_memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND project_memberships."memberId" = tm.id
  )
);

-- ============================================
-- STEP 5: Tasks RLS Policies
-- ============================================

-- Owner/Admin: Full CRUD access to all tasks
CREATE POLICY "tasks_owner_admin_full"
ON tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
);

-- Member: CRUD access to tasks in projects they're assigned to
CREATE POLICY "tasks_member_crud_assigned"
ON tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN project_memberships pm ON pm."memberId" = tm.id
    WHERE tm."authUserId" = auth.uid()
      AND tm.role = 'member'
      AND pm."projectId" = tasks."projectId"
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN project_memberships pm ON pm."memberId" = tm.id
    WHERE tm."authUserId" = auth.uid()
      AND tm.role = 'member'
      AND pm."projectId" = tasks."projectId"
  )
);

-- Guest: Read-only access to tasks in projects they're assigned to
CREATE POLICY "tasks_guest_read_assigned"
ON tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN project_memberships pm ON pm."memberId" = tm.id
    WHERE tm."authUserId" = auth.uid()
      AND tm.role = 'guest'
      AND pm."projectId" = tasks."projectId"
  )
);

-- ============================================
-- STEP 6: Notifications RLS Policies
-- ============================================

-- Users can read their own notifications
CREATE POLICY "notifications_self_read"
ON notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND (notifications."user"->>'email' = tm.email OR notifications."user"->>'id' = tm.id)
  )
);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_self_update"
ON notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND (notifications."user"->>'email' = tm.email OR notifications."user"->>'id' = tm.id)
  )
);

-- ============================================
-- STEP 7: Activities RLS Policies
-- ============================================

-- All authenticated users can read activities
CREATE POLICY "activities_read_all"
ON activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
  )
);

-- Owner/Admin can create activities
CREATE POLICY "activities_owner_admin_create"
ON activities
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM team_members tm
    WHERE tm."authUserId" = auth.uid()
      AND tm.role IN ('owner', 'admin')
  )
);

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- After running this script:
-- 1. Create users in Supabase Auth (Authentication → Users)
-- 2. Run 03_link_user.sql to link your auth user to team_members
-- 3. Test with different roles to verify RLS is working
