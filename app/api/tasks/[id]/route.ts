import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Task } from '@/components/types';
import { requireAuth } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Transform to match Task interface
    const task: Task = {
      id: data.id,
      title: data.title,
      project: data.project,
      projectId: data.projectId,
      assignee: data.assignee || undefined,
      dueDate: data.dueDate || '',
      priority: data.priority || 'medium',
      status: data.status || 'to-do',
      isCompleted: data.isCompleted ?? false,
      taskNumber: data.taskNumber,
      description: data.description,
      subtasks: Array.isArray(data.subtasks) ? data.subtasks : undefined,
      comments: Array.isArray(data.comments) ? data.comments : undefined,
      createdBy: data.createdBy || undefined,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
    };

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }

    const body = await request.json();

    // Check if task exists
    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task
    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json(
        { error: 'Failed to update task', details: error.message },
        { status: 500 }
      );
    }

    // Transform to match Task interface
    const task: Task = {
      id: data.id,
      title: data.title,
      project: data.project,
      projectId: data.projectId,
      assignee: data.assignee || undefined,
      dueDate: data.dueDate || '',
      priority: data.priority || 'medium',
      status: data.status || 'to-do',
      isCompleted: data.isCompleted ?? false,
      taskNumber: data.taskNumber,
      description: data.description,
      subtasks: Array.isArray(data.subtasks) ? data.subtasks : undefined,
      comments: Array.isArray(data.comments) ? data.comments : undefined,
      createdBy: data.createdBy || undefined,
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
    };

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Returns 401 if not authenticated
    }
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json(
        { error: 'Failed to delete task', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
