-- ============================================
-- Add Project Leader
-- ============================================
-- Run AFTER 01_schema.sql
-- Adds optional project leader (team member) to projects
-- ============================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS "projectLeaderId" TEXT REFERENCES team_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_project_leader ON projects("projectLeaderId");
