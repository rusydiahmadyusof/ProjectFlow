-- ProjectFlow Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects Table
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

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project TEXT NOT NULL,
  "projectId" TEXT,
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

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT NOT NULL DEFAULT '',
  -- Global role for the user within the company
  -- owner: first user / full access
  -- admin: manage everything except deleting whole account
  -- member: CRUD tasks on assigned projects only
  -- guest: read-only access on assigned projects only
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  "tasksAssigned" INTEGER NOT NULL DEFAULT 0,
  "tasksOverdue" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Memberships Table (per-project access for members/guests)
CREATE TABLE IF NOT EXISTS project_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "projectId" TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "memberId" TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  -- Role within this specific project (currently only member/guest)
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'guest')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
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

-- Activities Table (matches `components/types.ts` -> `Activity`)
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

-- Dashboard Stats Table (for caching/storing aggregated stats)
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

-- User Table (for current user info)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'current',
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks("projectId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks("dueDate");
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON project_memberships("projectId");
CREATE INDEX IF NOT EXISTS idx_project_memberships_member_id ON project_memberships("memberId");
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities("createdAt" DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - For now, allow all operations
-- You can tighten this later when implementing authentication
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development)
-- Replace these with proper auth policies when implementing authentication
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on project_memberships" ON project_memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on dashboard_stats" ON dashboard_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
