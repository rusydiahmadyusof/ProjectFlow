import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing in server environment');
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing' },
        { status: 500 }
      );
    }

    // Fetch aggregated stats from database
    // For now, calculate on-the-fly. Later you can cache in dashboard_stats table
    
    // Get projects with all needed fields
    const [projectsResult, tasksResult, teamResult] = await Promise.all([
      supabaseAdmin.from('projects').select('id, name, status, progress, isOverdue'),
      supabaseAdmin.from('tasks').select('id, status, isCompleted, createdAt'),
      supabaseAdmin.from('team_members').select('id', { count: 'exact', head: true }),
    ]);

    const projects = projectsResult.data || [];
    const tasks = tasksResult.data || [];
    const teamCount = teamResult.count || 0;

    // Calculate completion percentage (average of all project progress)
    const totalProjects = projects.length;
    const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
    const completionPercentage = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;

    // Calculate active and delayed projects
    const activeProjects = projects.filter((p) => p.status === 'on-track').length;
    const delayedProjects = projects.filter((p) => p.status === 'late' || p.status === 'at-risk').length;

    // Calculate trend percentage (comparing recent task completions)
    // For now, use a simple calculation based on completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isCompleted || t.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    // Trend percentage: compare current completion rate to a baseline (assuming 50% baseline)
    const trendPercentage = Math.round(completionRate - 50);

    // Get project progress for the ProjectProgress component
    const projectProgress = projects
      .map((p) => ({
        name: p.name,
        progress: p.progress || 0,
      }))
      .sort((a, b) => b.progress - a.progress); // Sort by progress descending

    const stats = {
      completionPercentage,
      activeProjects,
      delayedProjects,
      trendPercentage,
      projectProgress,
      // Also include raw stats for other components that might need them
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks: tasks.filter((t) => t.status === 'overdue').length,
      teamMembers: teamCount,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
