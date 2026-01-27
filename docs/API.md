# ProjectFlow API Documentation

## Overview

ProjectFlow uses a hybrid approach:
- **Direct Supabase Client** for most operations (client-side)
- **Next.js API Routes** for server-side operations requiring admin access

## API Routes

### Dashboard Stats

**Endpoint:** `GET /api/dashboard/stats`

**Description:** Returns aggregated dashboard statistics

**Response:**
```json
{
  "totalProjects": 8,
  "activeProjects": 5,
  "totalTasks": 30,
  "completedTasks": 12,
  "overdueTasks": 3,
  "teamMembers": 11
}
```

**Authentication:** Required (uses Supabase Admin client)

---

### Projects

**Endpoint:** `PATCH /api/projects/[id]`

**Description:** Updates a project (server-side with admin access)

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "client": "Client Name",
  "progress": 75,
  "status": "on-track",
  "isArchived": false
}
```

**Response:** Updated project object

**Authentication:** Required (uses Supabase Admin client)

---

### Tasks

**Endpoint:** `PATCH /api/tasks/[id]`

**Description:** Updates a task (server-side with admin access)

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "in-progress",
  "assignee": {
    "id": "tm-123",
    "name": "John Doe",
    "avatar": "https://...",
    "email": "john@example.com"
  },
  "reminderDate": "2024-12-01T09:00:00Z"
}
```

**Response:** Updated task object

**Authentication:** Required (uses Supabase Admin client)

---

## Direct Supabase Client Operations

Most CRUD operations are performed directly from the client using Supabase's JavaScript client.

### Projects

**Fetch Projects:**
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('createdAt', { ascending: false });
```

**Create Project:**
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert([{
    id: 'project-123',
    name: 'New Project',
    client: 'Client Name',
    progress: 0,
    status: 'on-track',
    isArchived: false
  }])
  .select()
  .single();
```

**Update Project:**
```typescript
const { data, error } = await supabase
  .from('projects')
  .update({ isArchived: true })
  .eq('id', 'project-123')
  .select()
  .single();
```

**Delete Project:**
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', 'project-123');
```

### Tasks

**Fetch Tasks (with pagination):**
```typescript
const { data, error, count } = await supabase
  .from('tasks')
  .select('*', { count: 'exact' })
  .eq('projectId', 'project-123')
  .order('createdAt', { ascending: false })
  .range(0, 19);
```

**Create Task:**
```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert([{
    id: 'task-123',
    title: 'New Task',
    projectId: 'project-123',
    assignee: { id: 'tm-1', name: 'John', avatar: '...' },
    reminderDate: '2024-12-01T09:00:00Z'
  }])
  .select()
  .single();
```

**Update Task:**
```typescript
const { data, error } = await supabase
  .from('tasks')
  .update({
    status: 'done',
    comments: [...existingComments, newComment]
  })
  .eq('id', 'task-123')
  .select()
  .single();
```

### Team Members

**Fetch Team Members:**
```typescript
const { data, error } = await supabase
  .from('team_members')
  .select('*')
  .order('createdAt', { ascending: false });
```

### Notifications

**Fetch Notifications:**
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .order('createdAt', { ascending: false });
```

**Mark Notification as Read:**
```typescript
const { data, error } = await supabase
  .from('notifications')
  .update({ isRead: true })
  .eq('id', 'notification-123')
  .select()
  .single();
```

### File Storage

**Upload File:**
```typescript
const { data, error } = await supabase.storage
  .from('task-attachments')
  .upload('folder/filename.pdf', file, {
    cacheControl: '3600',
    upsert: false
  });
```

**Get Public URL:**
```typescript
const { data } = supabase.storage
  .from('task-attachments')
  .getPublicUrl('folder/filename.pdf');
```

**Delete File:**
```typescript
const { error } = await supabase.storage
  .from('task-attachments')
  .remove(['folder/filename.pdf']);
```

## Error Handling

All operations use the error handling utility (`lib/errorHandler.ts`) which provides:
- User-friendly error messages
- Automatic retry for network errors
- Error type detection (RLS, validation, network, etc.)

## Authentication

All operations require authentication via Supabase Auth. The client automatically includes the auth token in requests.

## Row Level Security (RLS)

All tables have RLS policies enabled. Users can only:
- Read data they have access to
- Update/delete data they own or have permission for
- Create data according to their role permissions

See `supabase/02_rls_and_auth.sql` for detailed RLS policies.

## Rate Limiting

All API routes are protected by rate limiting to prevent abuse and ensure fair usage.

### Rate Limit Headers

Every API response includes rate limit headers:
- `X-RateLimit-Limit`: Maximum number of requests allowed per window
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: Unix timestamp (in seconds) when the rate limit window resets

### Rate Limit Configurations

| Endpoint | Max Requests | Window |
|----------|--------------|--------|
| `/api/dashboard/stats` | 30 | 1 minute |
| `/api/projects` | 60 | 1 minute |
| `/api/tasks` | 60 | 1 minute |
| `/api/user` | 20 | 1 minute |
| Other API routes | 100 | 1 minute |

### Rate Limit Exceeded

When rate limit is exceeded, the API returns:
- **Status Code**: `429 Too Many Requests`
- **Response Body**:
  ```json
  {
    "error": "Too Many Requests",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 45
  }
  ```
- **Headers**: Includes `Retry-After` header (in seconds) indicating when to retry

### Implementation Details

- Rate limiting is IP-based (uses `X-Forwarded-For` or `X-Real-IP` headers)
- Rate limits are tracked in-memory (for single-server deployments)
- For multi-server deployments, consider using Redis or a distributed cache
- See `lib/rateLimit.ts` for implementation details
