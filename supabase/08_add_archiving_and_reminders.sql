-- ============================================
-- Add Archiving and Reminder Features
-- ============================================
-- Run this AFTER 01_schema.sql
-- Adds isArchived to projects and reminderDate to tasks
-- ============================================

-- Add isArchived column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- Add reminderDate column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS "reminderDate" TIMESTAMP WITH TIME ZONE;

-- Add index for archived projects filter
CREATE INDEX IF NOT EXISTS idx_projects_is_archived ON projects("isArchived");

-- Add index for task reminders
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_date ON tasks("reminderDate") 
WHERE "reminderDate" IS NOT NULL;

-- Add index for task assignments (assignee email lookup)
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks USING GIN (assignee);

-- ============================================
-- Update status check constraint for projects
-- ============================================
-- Note: Archived projects keep their original status but isArchived=true
-- This allows filtering archived projects separately
