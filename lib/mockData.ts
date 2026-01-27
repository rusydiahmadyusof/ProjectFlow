import {
  Project,
  Task,
  TeamMember,
  Notification,
  Activity,
  ActivityFeedItem,
  User,
} from '@/components/types';

/**
 * ============================================
 * Mock Data for Testing Company
 * ============================================
 * All mock data is organized under "Testing Company"
 * - All team members use @testingcompany.com email domain
 * - All projects have client: "Testing Company"
 * - All data is designed for testing and development purposes
 * ============================================
 */

// Mock User Data - Testing Company
export const mockUser: User = {
  name: 'Alex Morgan',
  role: 'Product Manager',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBhIuZcPuGGF4lJR794lmts66gmLur5F9yoW_6gjV-axFdxP8WPuhrjoliqLQPIykEycLvuqqbaTQ4Iyor9arzg_XGWCJYuB2lJRBuh4v0BBpkcKqvnjxufO4Rnvk3-6M2OF4ACABg1ETwvBmtkqF44cOAemrgaWxJUBycj8JlZfmxVYbDaHrPQ4E6Fw9W5-NF47Bn9j00Nb0Y-XG2nculpAYChZ6ctnB1wMQLSfvvjRndyd_aIwKEzEOYBghDd-wNYIs9DLNMfjuE',
};

// Mock Team Members Data - Testing Company
export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah.c@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3tgryqD_nkGvBmRRpnnVVTn1NcPdMEOn291SW6BJZU7kNJkg0Znt7klcHoXVECeBIvHkSxjPzD4VhdAayVJWDAnEAhy5r_ccpllgHRSkslZgCktVwmP8mtuG1uyetrCuUsyLpqeFK0CVRKig1i7wz42BHxj_7HZMogtHjbyCQ_jAYw5B-NMDCQy3G6Wlap2ZxjTft_ZNn5fwlLzazdToaIuXfubvtpDWhLeqLox0o48Xl13mUQ9PgMaXfj5jz5-A9eNeUqj9Nz0A',
    role: 'admin',
    tasksAssigned: 15,
    tasksOverdue: 1,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBIgg7tzuSFhKOhKIx8trD7OprLGHuE-rquj1bOK4V9boAhMpTDVFHlIY5JnNkPfbPUe2L0R3Up4Tb6Ov-di2cEqi2QGvlGk3WizGY9BmiQ_QOpKJ2QCEkD-nPEE96NZtr73_aIYKo-58rvqxAqDvDP9swemxgItjBf95Y-kUGyNRRUvJ2mt3x6gFL6V6gkcAAMB14dc7RZ01GKAyPXk0BKoe4RizkKwSX4azm6gqtVuGt5I2bBc5Tv0ZTBZGod4EweHRYEjkNW7KQ',
    role: 'member',
    tasksAssigned: 12,
    tasksOverdue: 0,
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.j@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-WnTjqP_5it3Hr_Bjd2AbLAVWqfbbGO-FotaGGnJWH456F2uXliA33ddJm1Su_Panw4ObRA83saIu9OtGbysWt2Zwuet9Y4KhSHYtsFciB2aONl6BRLLOKqWwUv7KJGm1b1QAgGh0RFxWgaFMd88yvcS-kG9CWT9SLd4qUdwHVIok8J5C1fKZwIN4M_f1PyjADbSbW3ND50a7SDyc-_orFy6s77bW3v73LhixbDFVbMMKyiscpAscec1rnPmfQK-dL-deRrQLvqo',
    role: 'member',
    tasksAssigned: 10,
    tasksOverdue: 2,
  },
  {
    id: '4',
    name: 'Bob Smith',
    email: 'bob.smith@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCjPnjJ-TH192V8kZEm-bK1XJ4QVv6c7u0KlbldSLJm_ZzzqCrJRaJn0YyP0JQ0ZYXVo91SRZYq8XkZ9n02c561Kx90KnLBaawz7AyYYB3ruK4KONoFOVHocBTmNzTVFS7sp6oHjV4ajpiE6R4U8n-yzIaxwvEUzdOLy8y-68k3FC7AFfQJPGNWhgIqaulbJO1W-R7vrjOFPjaEzRd9qUuOOajCeWyhXV6n-NzKIT6q0mdLPA1D9gyq5DaMw-VC2KNwTb7oBtWj7gw',
    role: 'member',
    tasksAssigned: 8,
    tasksOverdue: 1,
  },
  {
    id: '5',
    name: 'Emily Davis',
    email: 'emily.d@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBdCnsXRXUU3Y4pBuCN2glA6qMCbZnu8L2mDFQepMx0YPd0qsPwiEwbaKgFoVVIoW49VQXaZXuBVNjdyCvFAZnhPqQ_DWCmrRe_Wr3kgX-ll1Y3qCfh9vo6O-vzOn297cIhVaFTCMIuSh5zleQ1F4BsdXBCFOd0CbVOVlA_JWJ2T__AltSV16JRFz12gb8Tw8h1vNsA1k19Llt--mn9BbCcl9DptYUEiCJL2R_Xrz-wDPUxFQ8m9QWSr0bAO2MbzvnWDtEGrQFer3Q',
    role: 'member',
    tasksAssigned: 7,
    tasksOverdue: 0,
  },
  {
    id: '6',
    name: 'John Doe',
    email: 'john.doe@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7hWydA9zlf6USNN_aTEPMIqqDK1H7lXxox4-nRlaIYMB61gVNTsYhsn1PeWDCFHQLpPnEiBzFqdRpZM4jZh9ozjfwKIxizeLzSA8h1ROmLM_HWjss_HDIXtJz39NgFphheah-rzCY_HwV0reWyGBrcEWSyTwBvJ4Wq6QoiIrK4mkPOzexB926PGlBScki_yHkiWqyZDZesyePhIv1pDsAS9KVEik-Pe4LlAghYDtmURUaFNK3dnf8-3ftbznMqZWY7Y-uP1YhMA0',
    role: 'member',
    tasksAssigned: 6,
    tasksOverdue: 0,
  },
  {
    id: '7',
    name: 'Lisa James',
    email: 'lisa.j@testingcompany.com',
    avatar: '',
    role: 'member',
    tasksAssigned: 5,
    tasksOverdue: 0,
  },
  {
    id: '8',
    name: 'David Wilson',
    email: 'david.w@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQEXSgSZ1ef32haRBH4W5GH-ZOWxNLX6_KNQW9qj364o-qa_6Ks_wwfO9_KLWCZwOElMaJpzXyk3zI6MX3MMAEtsFA433oG5wuZ03LkYNe1pN94iri65xTRc85L2g0rDLYtwAbebt3OcCZJIljZym2f_pEbNfdmeWTDT00YzxCVD3GZSGtBjnZ6okqP7hLdWi5ukEhewVT0ygkQBz502OryTpsM3EE2e3AC63WX98XE23CqQVB7VOeVLeSE16irut69U6TlPbHf3g',
    role: 'member',
    tasksAssigned: 4,
    tasksOverdue: 1,
  },
  {
    id: '9',
    name: 'Sarah Wilson',
    email: 'sarah.w@testingcompany.com',
    avatar: '',
    role: 'member',
    tasksAssigned: 3,
    tasksOverdue: 0,
  },
  {
    id: '10',
    name: 'Charlie Brown',
    email: 'charlie.b@testingcompany.com',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmMRfDmw-KdxcE3nVZOgaEEuCPIkgTCgP8mU252GNyo5-YEyinUmoMpwx1WnipeP1VE1hlrNCab9gC_x1mEZCzAsjrLDTM-6lZJ5kxsAOErtKy94BPQsEJKQ3UHr3pDw2ZYHMMekLbv3zU1yffSK72IYhZshT4Giw-LX9vpckKsMoUUCYhDRfmVhInOg1wuchCXS4OxoyzQzOHHGFY3tm2nwpc15le-wodT-GqESzMbFPI1NNdQdkyYUEXoEFswe5vdpj-hSeeqpM',
    role: 'guest',
    tasksAssigned: 2,
    tasksOverdue: 0,
  },
  {
    id: '11',
    name: 'Rusydi',
    email: 'dev.rusydi@gmail.com',
    avatar: '',
    role: 'owner',
    tasksAssigned: 0,
    tasksOverdue: 0,
  },
];

// Helper function to format dates consistently
const formatProjectDueDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

// Mock Projects Data - Testing Company
export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    client: 'Testing Company',
    progress: 75,
    status: 'on-track',
    dueDate: formatProjectDueDate(15), // Due in 2 weeks
    taskCount: 24,
    teamMembers: [
      mockTeamMembers[0].avatar,
      mockTeamMembers[1].avatar,
      mockTeamMembers[2].avatar,
      mockTeamMembers[3].avatar,
    ],
  },
  {
    id: '2',
    name: 'Mobile App MVP',
    client: 'Testing Company',
    progress: 40,
    status: 'at-risk',
    dueDate: formatProjectDueDate(35), // Due in ~5 weeks
    taskCount: 18,
    teamMembers: [
      mockTeamMembers[1].avatar,
      mockTeamMembers[4].avatar,
      mockTeamMembers[5].avatar,
    ],
  },
  {
    id: '3',
    name: 'Q1 Marketing Campaign',
    client: 'Testing Company',
    progress: 90,
    status: 'on-track',
    dueDate: formatProjectDueDate(5), // Due soon
    taskCount: 12,
    teamMembers: [
      mockTeamMembers[2].avatar,
      mockTeamMembers[6].avatar,
    ],
  },
  {
    id: '4',
    name: 'E-commerce Platform',
    client: 'Testing Company',
    progress: 60,
    status: 'on-track',
    dueDate: formatProjectDueDate(50), // Due in ~7 weeks
    taskCount: 20,
    teamMembers: [
      mockTeamMembers[0].avatar,
      mockTeamMembers[3].avatar,
      mockTeamMembers[7].avatar,
    ],
  },
  {
    id: '5',
    name: 'Brand Identity',
    client: 'Testing Company',
    progress: 25,
    status: 'at-risk',
    dueDate: formatProjectDueDate(45), // Due in ~6 weeks
    taskCount: 8,
    teamMembers: [
      mockTeamMembers[4].avatar,
    ],
  },
  {
    id: '6',
    name: 'Data Migration',
    client: 'Testing Company',
    progress: 55,
    status: 'on-track',
    dueDate: formatProjectDueDate(25), // Due in ~3.5 weeks
    taskCount: 15,
    teamMembers: [
      mockTeamMembers[1].avatar,
      mockTeamMembers[2].avatar,
      mockTeamMembers[5].avatar,
    ],
  },
  {
    id: '7',
    name: 'Customer Portal',
    client: 'Testing Company',
    progress: 30,
    status: 'at-risk',
    dueDate: formatProjectDueDate(60), // Due in ~8.5 weeks
    taskCount: 22,
    teamMembers: [
      mockTeamMembers[0].avatar,
      mockTeamMembers[3].avatar,
      mockTeamMembers[4].avatar,
      mockTeamMembers[7].avatar,
    ],
  },
  {
    id: '8',
    name: 'API Integration',
    client: 'Testing Company',
    progress: 85,
    status: 'on-track',
    dueDate: formatProjectDueDate(10), // Due in ~1.5 weeks
    taskCount: 10,
    teamMembers: [
      mockTeamMembers[1].avatar,
      mockTeamMembers[5].avatar,
    ],
  },
];

// Helper function to generate dates for tasks
const getDateString = (daysAgo: number, includeTime = false): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  if (includeTime) {
    const hours = Math.floor(Math.random() * 12) + 8;
    const minutes = Math.floor(Math.random() * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${month} ${day} at ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  
  return `${month} ${day}, ${year}`;
};

const getDueDateString = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

// Mock Tasks Data - Comprehensive set
export const mockTasks: Task[] = [
  // Website Redesign Project Tasks
  {
    id: '1',
    title: 'Homepage Hero Redesign',
    project: 'Website Redesign',
    projectId: '1',
    taskNumber: '#WR-102',
    assignee: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    dueDate: getDueDateString(3),
    priority: 'high',
    status: 'in-progress',
    description: 'Update the hero section of the homepage to align with the new branding guidelines. This includes replacing the main banner image, updating the headline copy, and adjusting the CTA button styles.',
    subtasks: [
      { id: 'st-1', title: 'Export assets from Figma', isCompleted: true },
      { id: 'st-2', title: 'Draft new copy variations', isCompleted: true },
      { id: 'st-3', title: 'Implement changes in HTML/CSS', isCompleted: false },
      { id: 'st-4', title: 'Test responsive layouts', isCompleted: false },
    ],
    comments: [
      {
        id: 'c-1',
        user: {
          name: 'Michael Chen',
          avatar: mockTeamMembers[1].avatar,
        },
        content: "I've attached the new hero assets below. Let me know if you need different formats.",
        time: getDateString(5, true),
        attachments: [
          { name: 'hero-v2.jpg', size: '2.4 MB', type: 'image/jpeg' },
          { name: 'hero-assets.zip', size: '5.2 MB', type: 'application/zip' },
        ],
      },
      {
        id: 'c-2',
        user: {
          name: 'Sarah Connor',
          avatar: mockTeamMembers[0].avatar,
        },
        content: "Thanks Michael! I'll start implementing these changes today.",
        time: getDateString(4, true),
      },
    ],
    createdBy: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    createdAt: getDateString(7, true),
  },
  {
    id: '2',
    title: 'Draft Landing Page Copy',
    project: 'Website Redesign',
    projectId: '1',
    taskNumber: '#WR-115',
    assignee: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    dueDate: getDueDateString(-2),
    priority: 'low',
    status: 'overdue',
    description: 'Write compelling copy for the landing page that highlights our key value propositions and drives conversions.',
    subtasks: [
      { id: 'st-5', title: 'Research competitor messaging', isCompleted: true },
      { id: 'st-6', title: 'Draft headline variations', isCompleted: false },
      { id: 'st-7', title: 'Write CTA copy', isCompleted: false },
    ],
    comments: [
      {
        id: 'c-3',
        user: {
          name: 'Michael Chen',
          avatar: mockTeamMembers[1].avatar,
        },
        content: 'Working on this now. Should have drafts ready by end of day.',
        time: getDateString(1, true),
      },
    ],
    createdBy: {
      name: 'Alex Morgan',
      avatar: mockUser.avatar,
    },
    createdAt: getDateString(8, true),
  },
  {
    id: '3',
    title: 'Update Navigation Menu',
    project: 'Website Redesign',
    projectId: '1',
    taskNumber: '#WR-118',
    assignee: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    dueDate: getDueDateString(5),
    priority: 'medium',
    status: 'in-progress',
    description: 'Redesign the main navigation menu with improved UX patterns and mobile responsiveness.',
    subtasks: [
      { id: 'st-8', title: 'Create navigation mockups', isCompleted: true },
      { id: 'st-9', title: 'Implement desktop navigation', isCompleted: true },
      { id: 'st-10', title: 'Implement mobile menu', isCompleted: false },
    ],
    createdBy: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    createdAt: getDateString(6, true),
  },
  {
    id: '4',
    title: 'Optimize Page Load Speed',
    project: 'Website Redesign',
    projectId: '1',
    taskNumber: '#WR-120',
    assignee: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    dueDate: getDueDateString(7),
    priority: 'high',
    status: 'to-do',
    description: 'Improve page load times by optimizing images, minifying CSS/JS, and implementing lazy loading.',
    subtasks: [
      { id: 'st-11', title: 'Audit current performance', isCompleted: false },
      { id: 'st-12', title: 'Optimize images', isCompleted: false },
      { id: 'st-13', title: 'Minify assets', isCompleted: false },
    ],
    createdBy: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    createdAt: getDateString(2, true),
  },
  {
    id: '5',
    title: 'Implement Dark Mode',
    project: 'Website Redesign',
    projectId: '1',
    taskNumber: '#WR-125',
    assignee: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    dueDate: getDueDateString(10),
    priority: 'medium',
    status: 'done',
    isCompleted: true,
    description: 'Add dark mode toggle functionality with proper theme switching and persistence.',
    subtasks: [
      { id: 'st-14', title: 'Design dark theme colors', isCompleted: true },
      { id: 'st-15', title: 'Implement theme toggle', isCompleted: true },
      { id: 'st-16', title: 'Test across all pages', isCompleted: true },
    ],
    createdBy: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    createdAt: getDateString(12, true),
  },
  // Mobile App MVP Tasks
  {
    id: '6',
    title: 'Set up Git Repository',
    project: 'Mobile App MVP',
    projectId: '2',
    taskNumber: '#MA-003',
    assignee: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    dueDate: getDueDateString(-5),
    priority: 'medium',
    status: 'done',
    isCompleted: true,
    description: 'Initialize Git repository for the mobile app project with proper branch structure and CI/CD setup.',
    subtasks: [
      { id: 'st-17', title: 'Create repository on GitHub', isCompleted: true },
      { id: 'st-18', title: 'Set up main and develop branches', isCompleted: true },
      { id: 'st-19', title: 'Configure CI/CD pipeline', isCompleted: true },
    ],
    createdBy: {
      name: 'Alex Morgan',
      avatar: mockUser.avatar,
    },
    createdAt: getDateString(15, true),
  },
  {
    id: '7',
    title: 'Design User Authentication Flow',
    project: 'Mobile App MVP',
    projectId: '2',
    taskNumber: '#MA-007',
    assignee: {
      name: 'Emily Davis',
      avatar: mockTeamMembers[4].avatar,
    },
    dueDate: getDueDateString(4),
    priority: 'high',
    status: 'in-progress',
    description: 'Create wireframes and mockups for login, signup, and password reset flows.',
    subtasks: [
      { id: 'st-20', title: 'Research best practices', isCompleted: true },
      { id: 'st-21', title: 'Create wireframes', isCompleted: true },
      { id: 'st-22', title: 'Design mockups', isCompleted: false },
    ],
    createdBy: {
      name: 'Emily Davis',
      avatar: mockTeamMembers[4].avatar,
    },
    createdAt: getDateString(9, true),
  },
  {
    id: '8',
    title: 'Implement Push Notifications',
    project: 'Mobile App MVP',
    projectId: '2',
    taskNumber: '#MA-012',
    assignee: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    dueDate: getDueDateString(8),
    priority: 'medium',
    status: 'to-do',
    description: 'Set up push notification service and implement notification handling.',
    subtasks: [
      { id: 'st-23', title: 'Choose notification service', isCompleted: false },
      { id: 'st-24', title: 'Implement iOS notifications', isCompleted: false },
      { id: 'st-25', title: 'Implement Android notifications', isCompleted: false },
    ],
    createdBy: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    createdAt: getDateString(3, true),
  },
  {
    id: '9',
    title: 'User Interview Analysis',
    project: 'Mobile App MVP',
    projectId: '2',
    taskNumber: '#MA-015',
    assignee: {
      name: 'Lisa James',
      avatar: '',
    },
    dueDate: getDueDateString(6),
    priority: 'low',
    status: 'pending',
    description: 'Analyze user interview data and compile insights for product improvements.',
    subtasks: [
      { id: 'st-26', title: 'Transcribe interviews', isCompleted: false },
      { id: 'st-27', title: 'Identify key themes', isCompleted: false },
      { id: 'st-28', title: 'Create insights report', isCompleted: false },
    ],
    createdBy: {
      name: 'Lisa James',
      avatar: '',
    },
    createdAt: getDateString(4, true),
  },
  // Q1 Marketing Campaign Tasks
  {
    id: '10',
    title: 'Create Social Media Content',
    project: 'Q1 Marketing Campaign',
    projectId: '3',
    taskNumber: '#MC-001',
    assignee: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    dueDate: getDueDateString(2),
    priority: 'high',
    status: 'in-progress',
    description: 'Develop social media content calendar and create posts for all platforms.',
    subtasks: [
      { id: 'st-29', title: 'Plan content calendar', isCompleted: true },
      { id: 'st-30', title: 'Create Instagram posts', isCompleted: true },
      { id: 'st-31', title: 'Create Twitter posts', isCompleted: false },
    ],
    createdBy: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    createdAt: getDateString(5, true),
  },
  {
    id: '11',
    title: 'Design Email Campaign',
    project: 'Q1 Marketing Campaign',
    projectId: '3',
    taskNumber: '#MC-005',
    assignee: {
      name: 'Lisa James',
      avatar: '',
    },
    dueDate: getDueDateString(1),
    priority: 'medium',
    status: 'review',
    description: 'Design responsive email templates for the Q1 campaign launch.',
    subtasks: [
      { id: 'st-32', title: 'Create email template', isCompleted: true },
      { id: 'st-33', title: 'Test email rendering', isCompleted: true },
      { id: 'st-34', title: 'Get approval', isCompleted: false },
    ],
    createdBy: {
      name: 'Lisa James',
      avatar: '',
    },
    createdAt: getDateString(6, true),
  },
  {
    id: '12',
    title: 'Launch Campaign Landing Page',
    project: 'Q1 Marketing Campaign',
    projectId: '3',
    taskNumber: '#MC-008',
    assignee: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    dueDate: getDueDateString(-1),
    priority: 'critical',
    status: 'overdue',
    description: 'Launch the campaign landing page with tracking and analytics setup.',
    subtasks: [
      { id: 'st-35', title: 'Finalize page design', isCompleted: true },
      { id: 'st-36', title: 'Set up analytics', isCompleted: false },
      { id: 'st-37', title: 'Deploy to production', isCompleted: false },
    ],
    createdBy: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    createdAt: getDateString(7, true),
  },
  // E-commerce Platform Tasks
  {
    id: '13',
    title: 'Build Product Catalog',
    project: 'E-commerce Platform',
    projectId: '4',
    taskNumber: '#EC-002',
    assignee: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    dueDate: getDueDateString(12),
    priority: 'high',
    status: 'in-progress',
    description: 'Develop the product catalog with filtering, search, and pagination features.',
    subtasks: [
      { id: 'st-38', title: 'Design catalog layout', isCompleted: true },
      { id: 'st-39', title: 'Implement filtering', isCompleted: true },
      { id: 'st-40', title: 'Add search functionality', isCompleted: false },
    ],
    createdBy: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    createdAt: getDateString(10, true),
  },
  {
    id: '14',
    title: 'Implement Shopping Cart',
    project: 'E-commerce Platform',
    projectId: '4',
    taskNumber: '#EC-006',
    assignee: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    dueDate: getDueDateString(15),
    priority: 'high',
    status: 'to-do',
    description: 'Build shopping cart functionality with add/remove items and quantity updates.',
    subtasks: [
      { id: 'st-41', title: 'Design cart UI', isCompleted: false },
      { id: 'st-42', title: 'Implement cart logic', isCompleted: false },
      { id: 'st-43', title: 'Add persistence', isCompleted: false },
    ],
    createdBy: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    createdAt: getDateString(8, true),
  },
  {
    id: '15',
    title: 'Set Up Payment Gateway',
    project: 'E-commerce Platform',
    projectId: '4',
    taskNumber: '#EC-010',
    assignee: {
      name: 'David Wilson',
      avatar: mockTeamMembers[7].avatar,
    },
    dueDate: getDueDateString(18),
    priority: 'critical',
    status: 'pending',
    description: 'Integrate payment gateway for secure transaction processing.',
    subtasks: [
      { id: 'st-44', title: 'Choose payment provider', isCompleted: false },
      { id: 'st-45', title: 'Implement payment API', isCompleted: false },
      { id: 'st-46', title: 'Test transactions', isCompleted: false },
    ],
    createdBy: {
      name: 'David Wilson',
      avatar: mockTeamMembers[7].avatar,
    },
    createdAt: getDateString(5, true),
  },
  // Brand Identity Tasks
  {
    id: '16',
    title: 'Design Logo Concepts',
    project: 'Brand Identity',
    projectId: '5',
    taskNumber: '#BI-001',
    assignee: {
      name: 'Emily Davis',
      avatar: mockTeamMembers[4].avatar,
    },
    dueDate: getDueDateString(20),
    priority: 'high',
    status: 'drafting',
    description: 'Create multiple logo concepts for client review and selection.',
    subtasks: [
      { id: 'st-47', title: 'Research brand values', isCompleted: true },
      { id: 'st-48', title: 'Create 5 concepts', isCompleted: false },
      { id: 'st-49', title: 'Prepare presentation', isCompleted: false },
    ],
    createdBy: {
      name: 'Emily Davis',
      avatar: mockTeamMembers[4].avatar,
    },
    createdAt: getDateString(11, true),
  },
  {
    id: '17',
    title: 'Develop Color Palette',
    project: 'Brand Identity',
    projectId: '5',
    taskNumber: '#BI-003',
    assignee: {
      name: 'Emily Davis',
      avatar: mockTeamMembers[4].avatar,
    },
    dueDate: getDueDateString(25),
    priority: 'medium',
    status: 'to-do',
    description: 'Define primary and secondary color palettes that reflect brand personality.',
    subtasks: [
      { id: 'st-50', title: 'Research color psychology', isCompleted: false },
      { id: 'st-51', title: 'Create color options', isCompleted: false },
      { id: 'st-52', title: 'Test accessibility', isCompleted: false },
    ],
    createdBy: {
      name: 'Emily Davis',
      avatar: mockTeamMembers[4].avatar,
    },
    createdAt: getDateString(9, true),
  },
  // Data Migration Tasks
  {
    id: '18',
    title: 'Backup Existing Data',
    project: 'Data Migration',
    projectId: '6',
    taskNumber: '#DM-001',
    assignee: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    dueDate: getDueDateString(3),
    priority: 'critical',
    status: 'done',
    isCompleted: true,
    description: 'Create full backup of existing database before migration begins.',
    subtasks: [
      { id: 'st-53', title: 'Export database', isCompleted: true },
      { id: 'st-54', title: 'Verify backup integrity', isCompleted: true },
      { id: 'st-55', title: 'Store backup securely', isCompleted: true },
    ],
    createdBy: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    createdAt: getDateString(14, true),
  },
  {
    id: '19',
    title: 'Migrate User Accounts',
    project: 'Data Migration',
    projectId: '6',
    taskNumber: '#DM-004',
    assignee: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    dueDate: getDueDateString(6),
    priority: 'high',
    status: 'in-progress',
    description: 'Migrate all user account data to new system with validation.',
    subtasks: [
      { id: 'st-56', title: 'Map data fields', isCompleted: true },
      { id: 'st-57', title: 'Run migration script', isCompleted: true },
      { id: 'st-58', title: 'Validate migrated data', isCompleted: false },
    ],
    createdBy: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    createdAt: getDateString(10, true),
  },
  {
    id: '20',
    title: 'Test Migration Process',
    project: 'Data Migration',
    projectId: '6',
    taskNumber: '#DM-007',
    assignee: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    dueDate: getDueDateString(9),
    priority: 'high',
    status: 'review',
    description: 'Comprehensive testing of migration process in staging environment.',
    subtasks: [
      { id: 'st-59', title: 'Set up test environment', isCompleted: true },
      { id: 'st-60', title: 'Run test migration', isCompleted: true },
      { id: 'st-61', title: 'Verify data integrity', isCompleted: false },
    ],
    createdBy: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    createdAt: getDateString(7, true),
  },
  // Customer Portal Tasks
  {
    id: '21',
    title: 'Design Dashboard UI',
    project: 'Customer Portal',
    projectId: '7',
    taskNumber: '#CP-001',
    assignee: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    dueDate: getDueDateString(14),
    priority: 'high',
    status: 'in-progress',
    description: 'Create dashboard interface with key metrics and quick actions.',
    subtasks: [
      { id: 'st-62', title: 'Define dashboard requirements', isCompleted: true },
      { id: 'st-63', title: 'Create wireframes', isCompleted: true },
      { id: 'st-64', title: 'Design mockups', isCompleted: false },
    ],
    createdBy: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    createdAt: getDateString(12, true),
  },
  {
    id: '22',
    title: 'Build User Profile Page',
    project: 'Customer Portal',
    projectId: '7',
    taskNumber: '#CP-003',
    assignee: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    dueDate: getDueDateString(16),
    priority: 'medium',
    status: 'to-do',
    description: 'Develop user profile page with edit capabilities.',
    subtasks: [
      { id: 'st-65', title: 'Design profile layout', isCompleted: false },
      { id: 'st-66', title: 'Implement edit form', isCompleted: false },
      { id: 'st-67', title: 'Add validation', isCompleted: false },
    ],
    createdBy: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    createdAt: getDateString(6, true),
  },
  {
    id: '23',
    title: 'Implement File Upload',
    project: 'Customer Portal',
    projectId: '7',
    taskNumber: '#CP-005',
    assignee: {
      name: 'David Wilson',
      avatar: mockTeamMembers[7].avatar,
    },
    dueDate: getDueDateString(19),
    priority: 'low',
    status: 'pending',
    description: 'Add file upload functionality for document management.',
    subtasks: [
      { id: 'st-68', title: 'Set up storage service', isCompleted: false },
      { id: 'st-69', title: 'Create upload component', isCompleted: false },
      { id: 'st-70', title: 'Add file validation', isCompleted: false },
    ],
    createdBy: {
      name: 'David Wilson',
      avatar: mockTeamMembers[7].avatar,
    },
    createdAt: getDateString(4, true),
  },
  // API Integration Tasks
  {
    id: '24',
    title: 'Design API Endpoints',
    project: 'API Integration',
    projectId: '8',
    taskNumber: '#API-001',
    assignee: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    dueDate: getDueDateString(-3),
    priority: 'high',
    status: 'done',
    isCompleted: true,
    description: 'Design RESTful API endpoints with proper documentation.',
    subtasks: [
      { id: 'st-71', title: 'Define endpoint structure', isCompleted: true },
      { id: 'st-72', title: 'Write API documentation', isCompleted: true },
      { id: 'st-73', title: 'Get team review', isCompleted: true },
    ],
    createdBy: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    createdAt: getDateString(13, true),
  },
  {
    id: '25',
    title: 'Implement Authentication',
    project: 'API Integration',
    projectId: '8',
    taskNumber: '#API-003',
    assignee: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    dueDate: getDueDateString(2),
    priority: 'critical',
    status: 'in-progress',
    description: 'Implement JWT-based authentication for API access.',
    subtasks: [
      { id: 'st-74', title: 'Set up JWT library', isCompleted: true },
      { id: 'st-75', title: 'Implement login endpoint', isCompleted: true },
      { id: 'st-76', title: 'Add token validation', isCompleted: false },
    ],
    createdBy: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    createdAt: getDateString(8, true),
  },
  {
    id: '26',
    title: 'Add Rate Limiting',
    project: 'API Integration',
    projectId: '8',
    taskNumber: '#API-005',
    assignee: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    dueDate: getDueDateString(5),
    priority: 'medium',
    status: 'to-do',
    description: 'Implement rate limiting to prevent API abuse.',
    subtasks: [
      { id: 'st-77', title: 'Choose rate limit strategy', isCompleted: false },
      { id: 'st-78', title: 'Implement middleware', isCompleted: false },
      { id: 'st-79', title: 'Test rate limits', isCompleted: false },
    ],
    createdBy: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    createdAt: getDateString(3, true),
  },
  // Additional tasks for better testing
  {
    id: '27',
    title: 'Fix Login Bug',
    project: 'Website Redesign',
    projectId: '1',
    taskNumber: '#WR-130',
    assignee: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    dueDate: getDueDateString(-1),
    priority: 'critical',
    status: 'overdue',
    description: 'Users are experiencing authentication failures when attempting to log in. The issue appears to be related to session token validation.',
    subtasks: [
      { id: 'st-80', title: 'Reproduce the bug', isCompleted: true },
      { id: 'st-81', title: 'Identify root cause', isCompleted: true },
      { id: 'st-82', title: 'Write unit tests', isCompleted: false },
      { id: 'st-83', title: 'Deploy fix to staging', isCompleted: false },
    ],
    comments: [
      {
        id: 'c-4',
        user: {
          name: 'Bob Smith',
          avatar: mockTeamMembers[3].avatar,
        },
        content: 'Found the issue in the token validation middleware. Fixing now.',
        time: getDateString(1, true),
      },
      {
        id: 'c-5',
        user: {
          name: 'Alice Johnson',
          avatar: mockTeamMembers[2].avatar,
        },
        content: 'Please prioritize this. Multiple users reported the issue.',
        time: getDateString(2, true),
      },
    ],
    createdBy: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    createdAt: getDateString(3, true),
  },
  {
    id: '28',
    title: 'Prepare Q2 Deck',
    project: 'Q1 Marketing Campaign',
    projectId: '3',
    taskNumber: '#MC-012',
    assignee: {
      name: 'Lisa James',
      avatar: '',
    },
    dueDate: getDueDateString(7),
    priority: 'low',
    status: 'drafting',
    description: 'Create comprehensive presentation deck for Q2 strategy review meeting.',
    subtasks: [
      { id: 'st-84', title: 'Gather Q1 metrics and data', isCompleted: false },
      { id: 'st-85', title: 'Create slide deck template', isCompleted: true },
      { id: 'st-86', title: 'Draft executive summary', isCompleted: false },
    ],
    createdBy: {
      name: 'Alex Morgan',
      avatar: mockUser.avatar,
    },
    createdAt: getDateString(1, true),
  },
  {
    id: '29',
    title: 'Q1 Financial Review',
    project: 'Data Migration',
    projectId: '6',
    taskNumber: '#DM-010',
    assignee: {
      name: 'Charlie Brown',
      avatar: mockTeamMembers[9].avatar,
    },
    dueDate: getDueDateString(11),
    priority: 'medium',
    status: 'pending',
    description: 'Conduct comprehensive review of Q1 financial performance.',
    subtasks: [
      { id: 'st-87', title: 'Compile revenue data', isCompleted: false },
      { id: 'st-88', title: 'Analyze expense reports', isCompleted: false },
      { id: 'st-89', title: 'Prepare variance analysis', isCompleted: false },
    ],
    comments: [
      {
        id: 'c-6',
        user: {
          name: 'Charlie Brown',
          avatar: mockTeamMembers[9].avatar,
        },
        content: 'Waiting on final numbers from accounting. Should have everything by end of week.',
        time: getDateString(2, true),
      },
    ],
    createdBy: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    createdAt: getDateString(5, true),
  },
  {
    id: '30',
    title: 'Update Homepage Hero',
    project: 'Website Redesign',
    projectId: '1',
    taskNumber: '#WR-135',
    assignee: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    dueDate: getDueDateString(4),
    priority: 'high',
    status: 'done',
    isCompleted: true,
    description: 'Refresh the homepage hero section with new imagery and updated messaging.',
    subtasks: [
      { id: 'st-90', title: 'Select new hero images', isCompleted: true },
      { id: 'st-91', title: 'Update headline text', isCompleted: true },
      { id: 'st-92', title: 'Test responsive layout', isCompleted: true },
    ],
    createdBy: {
      name: 'Alex Morgan',
      avatar: mockUser.avatar,
    },
    createdAt: getDateString(6, true),
  },
];

// Mock Notifications Data - Comprehensive set
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'comment',
    user: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    title: 'commented on',
    target: 'Website Redesign',
    message: 'Great work on the hero section!',
    time: '5 minutes ago',
    isRead: false,
    icon: 'comment',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
  },
  {
    id: '2',
    type: 'mention',
    user: {
      name: 'Sarah Wilson',
      avatar: '',
    },
    title: 'mentioned you in',
    target: 'Task #WR-102',
    message: 'Can you review this when you have a chance?',
    time: '1 hour ago',
    isRead: false,
    icon: 'alternate_email',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
  },
  {
    id: '3',
    type: 'overdue',
    title: 'Task overdue',
    target: 'Draft Landing Page Copy',
    message: 'This task was due 2 days ago',
    time: '3 hours ago',
    isRead: true,
    icon: 'schedule',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
  },
  {
    id: '4',
    type: 'assignment',
    user: {
      name: 'Lisa James',
      avatar: '',
    },
    title: 'assigned you to',
    target: 'User Interview Analysis',
    message: 'Please complete by end of week',
    time: 'Yesterday',
    isRead: true,
    icon: 'assignment_ind',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
  },
  {
    id: '5',
    type: 'comment',
    user: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    title: 'commented on',
    target: 'Homepage Hero Redesign',
    message: 'The new design looks fantastic!',
    time: '2 hours ago',
    isRead: false,
    icon: 'comment',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
  },
  {
    id: '6',
    type: 'mention',
    user: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    title: 'mentioned you in',
    target: 'Task #MA-007',
    message: 'Need your input on this design',
    time: '4 hours ago',
    isRead: false,
    icon: 'alternate_email',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
  },
  {
    id: '7',
    type: 'overdue',
    title: 'Task overdue',
    target: 'Launch Campaign Landing Page',
    message: 'This task was due yesterday',
    time: '5 hours ago',
    isRead: false,
    icon: 'schedule',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
  },
  {
    id: '8',
    type: 'assignment',
    user: {
      name: 'Bob Smith',
      avatar: mockTeamMembers[3].avatar,
    },
    title: 'assigned you to',
    target: 'Fix Login Bug',
    message: 'Urgent fix needed',
    time: '6 hours ago',
    isRead: true,
    icon: 'assignment_ind',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
  },
  {
    id: '9',
    type: 'comment',
    user: {
      name: 'Emily Davis',
      avatar: mockTeamMembers[4].avatar,
    },
    title: 'commented on',
    target: 'Design User Authentication Flow',
    message: 'I have some suggestions for improvement',
    time: '8 hours ago',
    isRead: true,
    icon: 'comment',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
  },
  {
    id: '10',
    type: 'mention',
    user: {
      name: 'David Wilson',
      avatar: mockTeamMembers[7].avatar,
    },
    title: 'mentioned you in',
    target: 'Task #EC-010',
    message: 'Can you help with the payment integration?',
    time: '10 hours ago',
    isRead: true,
    icon: 'alternate_email',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
  },
  {
    id: '11',
    type: 'assignment',
    user: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    title: 'assigned you to',
    target: 'Build Product Catalog',
    message: 'This is a high priority task',
    time: 'Yesterday',
    isRead: true,
    icon: 'assignment_ind',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
  },
  {
    id: '12',
    type: 'overdue',
    title: 'Task overdue',
    target: 'Fix Login Bug',
    message: 'This task was due 1 day ago',
    time: 'Yesterday',
    isRead: true,
    icon: 'schedule',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
  },
  {
    id: '13',
    type: 'comment',
    user: {
      name: 'John Doe',
      avatar: mockTeamMembers[5].avatar,
    },
    title: 'commented on',
    target: 'Implement Push Notifications',
    message: 'The implementation looks good!',
    time: '2 days ago',
    isRead: true,
    icon: 'comment',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
  },
  {
    id: '14',
    type: 'mention',
    user: {
      name: 'Michael Chen',
      avatar: mockTeamMembers[1].avatar,
    },
    title: 'mentioned you in',
    target: 'Task #DM-004',
    message: 'Migration is complete, please verify',
    time: '2 days ago',
    isRead: true,
    icon: 'alternate_email',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
  },
  {
    id: '15',
    type: 'assignment',
    user: {
      name: 'Alice Johnson',
      avatar: mockTeamMembers[2].avatar,
    },
    title: 'assigned you to',
    target: 'Design Dashboard UI',
    message: 'Let me know if you need any clarification',
    time: '3 days ago',
    isRead: true,
    icon: 'assignment_ind',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
  },
];

// Mock Activities Data
export const mockActivities: Activity[] = [
  {
    id: '1',
    user: 'Sam',
    action: 'completed',
    target: 'Homepage Mockup',
    time: '2 minutes ago',
    icon: 'check_circle',
    iconColor: 'text-primary',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: '2',
    user: 'Alex',
    action: 'commented on',
    target: 'User Flow',
    time: '1 hour ago',
    icon: 'comment',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    id: '3',
    user: 'Mia',
    action: 'created',
    target: 'Q1 Assets',
    time: '3 hours ago',
    icon: 'folder_open',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    id: '4',
    user: 'Jordan',
    action: 'added 3 tasks',
    target: '',
    time: 'Yesterday',
    icon: 'add_task',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
];

// Mock Activity Feed Data
export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: '1',
    user: {
      name: 'Alex Johnson',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDh8lD_ODeBnfOpqWdrlQnE2xxV2opGHR_DqSCV_9qRaqOP491qqADlYHipeFfLCmfUSMeNO53kIYjIU7eDAa5Aw2gJg2KkCiOvkDoxXCK5mi9z7LJOwO-hYHR2LvGL_6rgEtPgfyBu429cCsNwOKFpN27M9OO7z4Ojds_6aJCaolujQn4G-62NKJh6fKm4JoaH_z_gDSX_sXwEcEIKTe0tP_EHcuyQb1fVEjf7rk9ASJaSwgvVfgub_QxN6MkhtXRpJUrXaf5FhDc',
      role: 'Project Manager',
    },
    type: 'project',
    action: 'Created a new project',
    target: 'Mobile App Launch',
    details: `Kickoff meeting scheduled for ${formatProjectDueDate(3)}`,
    time: '45 mins ago',
    color: 'bg-primary',
  },
  {
    id: '2',
    type: 'system',
    action: 'Status updated automatically',
    target: 'Q1 Sales Deck',
    details: 'Status updated automatically after task "Draft Content" was marked complete.',
    time: '3 hours ago',
    color: 'bg-orange-400',
  },
  {
    id: '3',
    user: {
      name: 'Engineering Team',
      avatar: '',
    },
    type: 'team',
    action: 'Completed 5 tasks',
    target: 'Website Migration',
    details: 'Setup staging environment, Migrate database schema, + 3 more tasks',
    time: '5 hours ago',
    color: 'bg-green-500',
  },
  {
    id: '4',
    user: {
      name: 'Emily Blunt',
      avatar: '',
    },
    type: 'task',
    action: 'Updated task status',
    target: 'Design Review',
    details: 'Changed status from "In Progress" to "Review"',
    time: '1 day ago',
    color: 'bg-blue-500',
  },
  {
    id: '5',
    user: {
      name: 'Sarah Connor',
      avatar: mockTeamMembers[0].avatar,
    },
    type: 'task',
    action: 'Uploaded new assets to',
    target: 'Marketing Campaign 2026',
    attachments: [
      { name: 'Brief_v2.pdf', size: '2.4 MB', type: 'pdf' },
      { name: 'Banner_Main.png', size: '4.1 MB', type: 'image' },
    ],
    time: 'Yesterday',
    color: 'bg-purple-500',
  },
];

// Mock Dashboard Stats
export const mockDashboardStats = {
  completionPercentage: 78,
  activeProjects: 8,
  delayedProjects: 2,
  trendPercentage: 18,
  projectProgress: [
    { name: 'Website Redesign', progress: 75 },
    { name: 'Mobile App MVP', progress: 40 },
    { name: 'Q1 Marketing Campaign', progress: 90 },
    { name: 'E-commerce Platform', progress: 60 },
    { name: 'Brand Identity', progress: 25 },
    { name: 'Data Migration', progress: 55 },
    { name: 'Customer Portal', progress: 30 },
    { name: 'API Integration', progress: 85 },
  ],
};
