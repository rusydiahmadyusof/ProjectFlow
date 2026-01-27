# ProjectFlow Component Documentation

## Component Structure

```
components/
├── auth/              # Authentication components
├── dashboard/         # Dashboard-specific components
├── layout/            # Layout components (header, sidebar, etc.)
├── modals/            # Modal dialogs
├── projects/          # Project-related components
├── tasks/             # Task-related components
├── utils/             # Utility components and helpers
└── types.ts           # TypeScript type definitions
```

## Core Components

### Layout Components

#### `AppLayout`
Main application layout wrapper.

**Props:**
- `children`: ReactNode - Page content
- `headerTitle?: string` - Optional header title
- `headerUser?: User` - User info for header
- `showDateRange?: boolean` - Show date range picker
- `showSearch?: boolean` - Show search bar
- `searchPlaceholder?: string` - Search placeholder text
- `onSearchChange?: (query: string) => void` - Search handler
- `headerActions?: ReactNode` - Custom header actions

**Usage:**
```tsx
<AppLayout headerTitle="Dashboard" showSearch>
  <DashboardContent />
</AppLayout>
```

#### `AppHeader`
Application header with user profile and navigation.

**Props:**
- `title?: string` - Header title
- `user?: User` - Current user info
- `showDateRange?: boolean`
- `showSearch?: boolean`
- `searchPlaceholder?: string`
- `onSearchChange?: (query: string) => void`
- `actions?: ReactNode` - Custom actions

#### `AppSidebar`
Navigation sidebar with menu items.

**Features:**
- Active route highlighting
- Role-based menu visibility
- Logout confirmation modal

### Modal Components

#### `ConfirmationModal`
Reusable confirmation dialog.

**Props:**
- `isOpen: boolean`
- `title: string`
- `message: string`
- `confirmText?: string` - Default: "Confirm"
- `cancelText?: string` - Default: "Cancel"
- `type?: 'danger' | 'warning' | 'info'` - Default: 'warning'
- `onConfirm: () => void`
- `onCancel: () => void`

**Usage:**
```tsx
<ConfirmationModal
  isOpen={showConfirm}
  title="Delete Project"
  message="Are you sure?"
  type="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

#### `AlertModal`
Alert/notification modal.

**Props:**
- `isOpen: boolean`
- `title: string`
- `message: string`
- `type?: 'success' | 'error' | 'info' | 'warning'`
- `onClose: () => void`

#### `AssignTaskModal`
Modal for assigning tasks to team members.

**Props:**
- `isOpen: boolean`
- `currentAssignee?: { id, name, avatar, email } | null`
- `onAssign: (assignee: TeamMember | null) => void`
- `onClose: () => void`

#### `SetReminderModal`
Modal for setting task reminders.

**Props:**
- `isOpen: boolean`
- `currentReminderDate?: string`
- `dueDate?: string`
- `onSetReminder: (reminderDate: string | null) => void`
- `onClose: () => void`

### Screen Components

#### `DashboardScreen`
Main dashboard with stats, charts, and activity feed.

**Features:**
- Project completion overview
- Activity trends graph
- Project progress cards
- Activity log
- Quick stats

#### `ProjectsScreen`
Projects management screen.

**Features:**
- Grid/list view toggle
- Filter and sort
- Create/edit/archive/delete projects
- Search functionality

#### `TasksScreen`
Tasks management screen.

**Features:**
- Infinite scroll table
- Filter by status/priority
- Sort functionality
- Task details modal
- Analytics

#### `TeamScreen`
Team member management.

**Features:**
- Team member list
- Role management
- Edit/delete members
- Export functionality

## Custom Hooks

### `useProjects`
Project CRUD operations.

**Returns:**
- `data`: Project[]
- `isLoading`: boolean
- `error`: Error | null

**Mutations:**
- `useCreateProject()` - Create new project
- `useUpdateProject()` - Update project
- `useDeleteProject()` - Delete project

### `useTasks`
Task operations with infinite scroll.

**Parameters:**
- `params?: { projectId?, status? }`

**Returns:**
- Infinite query with pages of tasks

**Mutations:**
- `useCreateTask()` - Create new task
- `useUpdateTask()` - Update task

### `useUser`
Current user and role information.

**Returns:**
- `data`: { name, role, avatar }
- `isLoading`: boolean
- `error`: Error | null

**Features:**
- Auto-linking to team_members
- Email fallback matching
- Auto-refresh on auth changes

### `useTeam`
Team member management.

**Returns:**
- `data`: TeamMember[]
- `isLoading`: boolean
- `error`: Error | null

### `useNotifications`
Notification handling.

**Returns:**
- `data`: Notification[]
- `isLoading`: boolean

**Mutations:**
- `useMarkNotificationRead()` - Mark notification as read

## Utility Functions

### `lib/validation.ts`
Input validation utilities:
- `validateEmail()` - Email validation
- `validatePassword()` - Password strength
- `validateProjectName()` - Project name validation
- `validateTaskTitle()` - Task title validation
- `validateComment()` - Comment validation
- `validateFile()` - File upload validation
- `sanitizeString()` - XSS protection
- `sanitizeObject()` - Recursive sanitization

### `lib/security.ts`
Security utilities:
- `escapeHTML()` - HTML escaping
- `sanitizeForDisplay()` - Safe display sanitization
- `sanitizeForStorage()` - Safe storage sanitization
- `RateLimiter` - Client-side rate limiting
- `getCSPHeader()` - Content Security Policy

### `lib/fileUpload.ts`
File upload utilities:
- `uploadFile()` - Upload to Supabase Storage
- `deleteFile()` - Delete from storage
- `formatFileSize()` - Format bytes to readable size
- `getFileIcon()` - Get icon for file type

### `lib/errorHandler.ts`
Error handling utilities:
- `getUserFriendlyErrorMessage()` - Convert errors to user messages
- `isRLSError()` - Detect RLS errors
- `isNetworkError()` - Detect network errors
- `isValidationError()` - Detect validation errors
- `retryWithBackoff()` - Retry with exponential backoff
- `withErrorHandling()` - Wrap operations with error handling

## Type Definitions

See `components/types.ts` for all TypeScript interfaces:
- `Project` - Project data structure
- `Task` - Task data structure
- `TeamMember` - Team member data
- `TaskComment` - Comment structure
- `Notification` - Notification structure
- `User` - Current user info

## Styling

All components use Tailwind CSS with:
- Dark mode support
- Responsive design
- Consistent color scheme
- Material Symbols icons

## Accessibility

Components include:
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
