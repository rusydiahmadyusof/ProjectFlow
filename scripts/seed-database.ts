/**
 * Database Seeding Script - Testing Company
 * 
 * This script populates your Supabase database with initial mock data
 * for "Testing Company".
 * 
 * All seeded data will be tagged under "Testing Company":
 * - Team members: @testingcompany.com email domain
 * - Projects: client = "Testing Company"
 * 
 * ⚠️ DATA SAFETY:
 * - Uses UPSERT (update if exists, insert if not)
 * - Updates records with matching IDs (1-30)
 * - Does NOT delete existing data
 * - Preserves records not in mock data
 * - See supabase/README.md for data safety notes
 * 
 * Usage:
 * 1. Make sure your .env.local file is configured with Supabase credentials
 * 2. Run: npx tsx scripts/seed-database.ts
 * 
 * Note: This script uses the service role key to bypass RLS.
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  mockProjects,
  mockTasks,
  mockTeamMembers,
  mockNotifications,
  mockActivities,
  mockUser,
  mockProjectMemberships,
} from '../lib/mockData';

// Load Next.js local env file for this script (tsx does not auto-load it)
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Make sure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedDatabase() {
  console.log('🌱 Starting database seeding for Testing Company...\n');

  try {
    // 1. Seed Users
    console.log('📝 Seeding users...');
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: 'current',
        name: mockUser.name,
        role: mockUser.role,
        avatar: mockUser.avatar,
      });
    if (userError) throw userError;
    console.log('✅ Users seeded\n');

    // 2. Seed Team Members
    console.log('👥 Seeding team members...');
    const { error: teamError } = await supabase
      .from('team_members')
      .upsert(
        mockTeamMembers.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.role,
          tasksAssigned: member.tasksAssigned,
          tasksOverdue: member.tasksOverdue,
        })),
        { onConflict: 'id' }
      );
    if (teamError) throw teamError;
    console.log(`✅ ${mockTeamMembers.length} team members seeded\n`);

    // 3. Seed Projects
    console.log('📁 Seeding projects...');
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(
        mockProjects.map((project) => ({
          id: project.id,
          name: project.name,
          client: project.client,
          progress: project.progress,
          status: project.status,
          dueDate: project.dueDate,
          taskCount: project.taskCount,
          teamMembers: project.teamMembers,
          isOverdue: project.isOverdue || false,
        })),
        { onConflict: 'id' }
      );
    if (projectsError) throw projectsError;
    console.log(`✅ ${mockProjects.length} projects seeded\n`);

    // 4. Seed Tasks
    console.log('✅ Seeding tasks...');
    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(
        mockTasks.map((task) => ({
          id: task.id,
          title: task.title,
          project: task.project,
          projectId: task.projectId,
          assignee: task.assignee || null,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          isCompleted: task.isCompleted || false,
          taskNumber: task.taskNumber,
          description: task.description,
          subtasks: task.subtasks || [],
          comments: task.comments || [],
          createdBy: task.createdBy || null,
          // createdAt in mock data is a human-readable string (e.g. "Jan 20 at 12:14 PM")
          // Our DB column is a timestamp, so we let Supabase default to NOW()
        })),
        { onConflict: 'id' }
      );
    if (tasksError) throw tasksError;
    console.log(`✅ ${mockTasks.length} tasks seeded\n`);

    // 5. Seed Notifications
    console.log('🔔 Seeding notifications...');
    const { error: notificationsError } = await supabase
      .from('notifications')
      .upsert(
        mockNotifications.map((notification) => ({
          id: notification.id,
          type: notification.type,
          user: notification.user || null,
          title: notification.title,
          message: notification.message,
          target: notification.target,
          time: notification.time,
          isRead: notification.isRead,
          icon: notification.icon,
          iconColor: notification.iconColor,
          bgColor: notification.bgColor,
        })),
        { onConflict: 'id' }
      );
    if (notificationsError) throw notificationsError;
    console.log(`✅ ${mockNotifications.length} notifications seeded\n`);

    // 6. Seed Activities
    console.log('📊 Seeding activities...');
    const { error: activitiesError } = await supabase
      .from('activities')
      .upsert(
        mockActivities.map((activity) => ({
          id: activity.id,
          user: activity.user,
          action: activity.action,
          target: activity.target,
          time: activity.time,
          icon: activity.icon,
          iconColor: activity.iconColor,
          bgColor: activity.bgColor,
        })),
        { onConflict: 'id' }
      );
    if (activitiesError) throw activitiesError;
    console.log(`✅ ${mockActivities.length} activities seeded\n`);

    // 7. Seed Project Memberships
    console.log('🔗 Seeding project memberships...');
    // First, delete existing memberships for these projects to avoid duplicates
    const projectIds = mockProjects.map((p) => p.id);
    const { error: deleteError } = await supabase
      .from('project_memberships')
      .delete()
      .in('projectId', projectIds);
    if (deleteError) throw deleteError;
    
    // Then insert new memberships
    const { error: membershipsError } = await supabase
      .from('project_memberships')
      .insert(
        mockProjectMemberships.map((membership) => ({
          projectId: membership.projectId,
          memberId: membership.memberId,
          role: membership.role,
        }))
      );
    if (membershipsError) throw membershipsError;
    console.log(`✅ ${mockProjectMemberships.length} project memberships seeded\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary (Testing Company):');
    console.log(`   - Company: Testing Company`);
    console.log(`   - Users: 1`);
    console.log(`   - Team Members: ${mockTeamMembers.length} (@testingcompany.com)`);
    console.log(`   - Projects: ${mockProjects.length} (all clients: Testing Company)`);
    console.log(`   - Tasks: ${mockTasks.length}`);
    console.log(`   - Notifications: ${mockNotifications.length}`);
    console.log(`   - Activities: ${mockActivities.length}`);
    console.log(`   - Project Memberships: ${mockProjectMemberships.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedDatabase();
