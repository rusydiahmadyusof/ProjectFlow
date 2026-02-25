-- ============================================
-- ProjectFlow – Full schema (single file)
-- ============================================
-- Run this in Supabase SQL Editor to create tables, RLS, indexes, storage.
-- Then run seed.sql for optional sample data. Link auth users via Dashboard or API.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tables
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT '',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'on-track' CHECK (status IN ('on-track', 'at-risk', 'late')),
  "dueDate" TEXT NOT NULL DEFAULT '',
  "taskCount" INTEGER NOT NULL DEFAULT 0,
  "teamMembers" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "isOverdue" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project TEXT NOT NULL,
  "projectId" TEXT REFERENCES projects(id) ON DELETE CASCADE,
  assignee JSONB,
  "dueDate" TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low', 'critical')),
  status TEXT NOT NULL DEFAULT 'to-do' CHECK (status IN ('to-do', 'in-progress', 'done', 'overdue', 'review', 'drafting', 'pending')),
  "isCompleted" BOOLEAN DEFAULT false,
  "taskNumber" TEXT,
  description TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  "createdBy" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  "authUserId" uuid UNIQUE,
  "tasksAssigned" INTEGER NOT NULL DEFAULT 0,
  "tasksOverdue" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "projectId" TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "memberId" TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'guest')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('comment', 'mention', 'assignment', 'overdue', 'system')),
  "user" JSONB,
  title TEXT NOT NULL,
  message TEXT,
  target TEXT,
  "time" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  icon TEXT,
  "iconColor" TEXT,
  "bgColor" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  "user" TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  time TEXT NOT NULL,
  icon TEXT NOT NULL,
  "iconColor" TEXT NOT NULL,
  "bgColor" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  "totalProjects" INTEGER NOT NULL DEFAULT 0,
  "activeProjects" INTEGER NOT NULL DEFAULT 0,
  "totalTasks" INTEGER NOT NULL DEFAULT 0,
  "completedTasks" INTEGER NOT NULL DEFAULT 0,
  "overdueTasks" INTEGER NOT NULL DEFAULT 0,
  "teamMembers" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'current',
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Additional columns (project leader, details, archiving, reminders)
-- ============================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS "projectLeaderId" TEXT REFERENCES team_members(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS goals TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS "reminderDate" TIMESTAMP WITH TIME ZONE;

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks("projectId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks("dueDate");
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks("isCompleted");
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks("projectId", status);
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_date ON tasks("reminderDate") WHERE "reminderDate" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks USING GIN (assignee);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_overdue ON projects("isOverdue");
CREATE INDEX IF NOT EXISTS idx_projects_project_leader ON projects("projectLeaderId");
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON projects("isArchived");

CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON project_memberships("projectId");
CREATE INDEX IF NOT EXISTS idx_project_memberships_member_id ON project_memberships("memberId");
CREATE INDEX IF NOT EXISTS idx_project_memberships_composite ON project_memberships("projectId", "memberId");

CREATE INDEX IF NOT EXISTS idx_team_members_auth_user_id ON team_members("authUserId");
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications("isRead", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities("user");

-- ============================================
-- Triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies so we can apply proper RLS
DROP POLICY IF EXISTS "temp_allow_all_projects" ON projects;
DROP POLICY IF EXISTS "temp_allow_all_tasks" ON tasks;
DROP POLICY IF EXISTS "temp_allow_all_team_members" ON team_members;
DROP POLICY IF EXISTS "temp_allow_all_project_memberships" ON project_memberships;
DROP POLICY IF EXISTS "temp_allow_all_notifications" ON notifications;
DROP POLICY IF EXISTS "temp_allow_all_activities" ON activities;
DROP POLICY IF EXISTS "temp_allow_all_dashboard_stats" ON dashboard_stats;
DROP POLICY IF EXISTS "temp_allow_all_users" ON users;
DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on team_members" ON team_members;
DROP POLICY IF EXISTS "Allow all operations on project_memberships" ON project_memberships;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all operations on activities" ON activities;
DROP POLICY IF EXISTS "Allow all operations on dashboard_stats" ON dashboard_stats;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- Team members
CREATE POLICY "team_members_self_read" ON team_members FOR SELECT USING ("authUserId" = auth.uid());
CREATE POLICY "team_members_owner_admin_read_all" ON team_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin'))
);
CREATE POLICY "team_members_self_link_auth_user" ON team_members FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND "authUserId" IS NULL)
  WITH CHECK ("authUserId" = auth.uid() AND email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "team_members_self_update" ON team_members FOR UPDATE USING ("authUserId" = auth.uid()) WITH CHECK ("authUserId" = auth.uid());
CREATE POLICY "team_members_owner_admin_update" ON team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin'))
) WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "team_members_owner_admin_delete" ON team_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin'))
);

-- Projects
CREATE POLICY "projects_owner_admin_full" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin'))
) WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "projects_member_guest_read" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM team_members tm JOIN project_memberships pm ON pm."memberId" = tm.id WHERE tm."authUserId" = auth.uid() AND pm."projectId" = projects.id)
);

-- Project memberships
CREATE POLICY "pm_owner_admin_full" ON project_memberships FOR ALL USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin'))
) WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "pm_member_guest_read" ON project_memberships FOR SELECT USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND project_memberships."memberId" = tm.id)
);

-- Tasks
CREATE POLICY "tasks_owner_admin_full" ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin'))
) WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "tasks_member_crud_assigned" ON tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM team_members tm JOIN project_memberships pm ON pm."memberId" = tm.id WHERE tm."authUserId" = auth.uid() AND tm.role = 'member' AND pm."projectId" = tasks."projectId")
) WITH CHECK (EXISTS (SELECT 1 FROM team_members tm JOIN project_memberships pm ON pm."memberId" = tm.id WHERE tm."authUserId" = auth.uid() AND tm.role = 'member' AND pm."projectId" = tasks."projectId"));
CREATE POLICY "tasks_guest_read_assigned" ON tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM team_members tm JOIN project_memberships pm ON pm."memberId" = tm.id WHERE tm."authUserId" = auth.uid() AND tm.role = 'guest' AND pm."projectId" = tasks."projectId")
);

-- Notifications
CREATE POLICY "notifications_self_read" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND (notifications."user"->>'email' = tm.email OR notifications."user"->>'id' = tm.id))
);
CREATE POLICY "notifications_self_update" ON notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND (notifications."user"->>'email' = tm.email OR notifications."user"->>'id' = tm.id))
);

-- Activities: owner/admin can create; any authenticated team member can also create (for activity log)
CREATE POLICY "activities_read_all" ON activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid())
);
CREATE POLICY "activities_owner_admin_create" ON activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid() AND tm.role IN ('owner', 'admin'))
);
CREATE POLICY "activities_authenticated_member_create" ON activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm."authUserId" = auth.uid())
);

-- Dashboard stats & users (allow all for now; restrict in production if needed)
CREATE POLICY "dashboard_stats_all" ON dashboard_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "users_all" ON users FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Storage bucket (task attachments)
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('task-attachments', 'task-attachments', true, 10485760, ARRAY['image/*', 'application/pdf', 'text/*', 'application/*'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
CREATE POLICY "Authenticated users can read files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'task-attachments');

DROP POLICY IF EXISTS "Users can delete files" ON storage.objects;
CREATE POLICY "Users can delete files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');

ANALYZE projects;
ANALYZE tasks;
ANALYZE team_members;
ANALYZE project_memberships;
ANALYZE notifications;
ANALYZE activities;
