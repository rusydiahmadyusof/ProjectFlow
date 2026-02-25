import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }

    const { user } = authResult;

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
    
    // Get projects with all needed fields; tasks need projectId and updatedAt for weekly completion
    const [projectsResult, tasksResult, teamResult] = await Promise.all([
      supabaseAdmin.from('projects').select('id, name, status, progress, isOverdue'),
      supabaseAdmin.from('tasks').select('id, status, isCompleted, createdAt, updatedAt, projectId'),
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

    // Calculate trend percentage based on task completion rate
    // Trend shows improvement/degradation from a neutral baseline
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isCompleted || t.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate trend: compare completion rate to average project progress
    // This provides a more dynamic baseline based on actual project performance
    const averageProjectProgress = totalProjects > 0 ? totalProgress / totalProjects : 0;
    const trendPercentage = Math.round(completionRate - averageProjectProgress);

    // Get project progress for the ProjectProgress component
    const projectProgress = projects
      .map((p) => ({
        name: p.name,
        progress: p.progress || 0,
      }))
      .sort((a, b) => b.progress - a.progress); // Sort by progress descending

    // Last 30 days task completion for Activity Trends (one bucket per day; index 0 = 30 days ago, index 29 = today)
    const now = new Date();
    const DAYS = 30;
    const dailyLabels: string[] = [];
    for (let i = 0; i < DAYS; i++) {
      dailyLabels.push(i === DAYS - 1 ? 'Today' : `${DAYS - 1 - i}d ago`);
    }
    const dailyCompletionAll: number[] = new Array(DAYS).fill(0);
    const dailyCompletionByProject: Record<string, number[]> = {};
    projects.forEach((p) => {
      dailyCompletionByProject[p.id] = new Array(DAYS).fill(0);
    });
    const getTaskDate = (t: Record<string, unknown>): Date | null => {
      const dateStr = (t.updatedAt ?? t.updated_at ?? t.createdAt ?? t.created_at) as string | undefined;
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const getTaskProjectId = (t: Record<string, unknown>): string | undefined => {
      return (t.projectId ?? t.project_id ?? t.project) as string | undefined;
    };
    const isCompletedTask = (t: Record<string, unknown>): boolean =>
      t.isCompleted === true || t.status === 'done';

    const completedTasksList = tasks.filter(isCompletedTask);
    completedTasksList.forEach((t) => {
      const d = getTaskDate(t);
      const dateToUse = d ?? new Date();
      const ms = now.getTime() - dateToUse.getTime();
      const daysAgo = ms / (1000 * 60 * 60 * 24);
      const dayIndex = Math.floor(daysAgo);
      if (dayIndex >= 0 && dayIndex < DAYS) {
        const bucketIndex = DAYS - 1 - dayIndex; // 0 = 30d ago, 29 = today
        dailyCompletionAll[bucketIndex]++;
        const pid = getTaskProjectId(t);
        if (pid && dailyCompletionByProject[pid]) {
          dailyCompletionByProject[pid][bucketIndex]++;
        }
      }
    });

    const stats = {
      completionPercentage,
      activeProjects,
      delayedProjects,
      trendPercentage,
      projectProgress,
      weeklyTrend: {
        labels: dailyLabels,
        all: dailyCompletionAll,
        byProject: dailyCompletionByProject,
      },
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
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
