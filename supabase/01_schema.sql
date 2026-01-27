-- ============================================
-- ProjectFlow Database Schema
-- ============================================
-- Run this FIRST in Supabase SQL Editor
-- Creates all tables, indexes, and triggers
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Projects Table
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

-- ============================================
-- Tasks Table
-- ============================================
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

-- ============================================
-- Team Members Table
-- ============================================
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

-- ============================================
-- Project Memberships Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "projectId" TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "memberId" TEXT NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'guest')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Notifications Table
-- ============================================
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

-- ============================================
-- Activities Table
-- ============================================
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

-- ============================================
-- Dashboard Stats Table
-- ============================================
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

-- ============================================
-- User Table (legacy - may be removed later)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'current',
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
-- Task indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks("projectId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks("dueDate");
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks("isCompleted");
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks("projectId", status); -- Composite for filtering by project and status

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_overdue ON projects("isOverdue");

-- Project memberships indexes
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON project_memberships("projectId");
CREATE INDEX IF NOT EXISTS idx_project_memberships_member_id ON project_memberships("memberId");
CREATE INDEX IF NOT EXISTS idx_project_memberships_composite ON project_memberships("projectId", "memberId"); -- Composite for join queries

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_auth_user_id ON team_members("authUserId");
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email); -- For email lookups
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role); -- For role-based queries

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications("isRead");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications("isRead", "createdAt" DESC); -- Composite for unread notifications

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities("user"); -- For user-specific activity queries

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

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Temporary "Allow All" Policies (for development)
-- ============================================
-- These will be replaced by proper RLS policies in 02_rls_and_auth.sql
-- Remove these in production!
CREATE POLICY IF NOT EXISTS "temp_allow_all_projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "temp_allow_all_tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "temp_allow_all_team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "temp_allow_all_project_memberships" ON project_memberships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "temp_allow_all_notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "temp_allow_all_activities" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "temp_allow_all_dashboard_stats" ON dashboard_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "temp_allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
