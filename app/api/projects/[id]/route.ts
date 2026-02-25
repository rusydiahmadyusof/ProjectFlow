import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Project } from '@/components/types';
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
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Transform to match Project interface
    const project: Project = {
      id: data.id,
      name: data.name,
      client: data.client || '',
      progress: data.progress || 0,
      status: data.status || 'on-track',
      dueDate: data.dueDate || '',
      taskCount: data.taskCount || 0,
      teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
      isOverdue: data.isOverdue || false,
    };

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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

    // Check if project exists
    const { data: existingProject, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project', details: error.message },
        { status: 500 }
      );
    }

    // Transform to match Project interface
    const project: Project = {
      id: data.id,
      name: data.name,
      client: data.client || '',
      progress: data.progress || 0,
      status: data.status || 'on-track',
      dueDate: data.dueDate || '',
      taskCount: data.taskCount || 0,
      teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
      isOverdue: data.isOverdue || false,
    };

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
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
      .from('projects')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
