-- ============================================
-- Performance Optimization Indexes
-- ============================================
-- Run this AFTER 01_schema.sql
-- Adds additional indexes for common query patterns
-- ============================================

-- Task indexes for better filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks("isCompleted");
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks("projectId", status); -- Composite for filtering by project and status

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_projects_is_overdue ON projects("isOverdue");

-- Project memberships composite index for join queries
CREATE INDEX IF NOT EXISTS idx_project_memberships_composite ON project_memberships("projectId", "memberId");

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email); -- For email lookups
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role); -- For role-based queries

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications("isRead", "createdAt" DESC); -- Composite for unread notifications

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities("user"); -- For user-specific activity queries

-- ============================================
-- Analyze tables to update statistics
-- ============================================
ANALYZE projects;
ANALYZE tasks;
ANALYZE team_members;
ANALYZE project_memberships;
ANALYZE notifications;
ANALYZE activities;
