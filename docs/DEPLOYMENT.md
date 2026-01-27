# ProjectFlow Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account (recommended) or other hosting platform
- Git repository

## Environment Variables

Create `.env.local` (development) and set environment variables in your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Setup

### 1. Database Setup

Run SQL scripts in order:

1. **Schema** (`supabase/01_schema.sql`)
   - Creates all tables
   - Sets up indexes
   - Creates triggers

2. **RLS Policies** (`supabase/02_rls_and_auth.sql`)
   - Enables Row Level Security
   - Creates RLS policies
   - Sets up authentication policies

3. **Link User** (`supabase/03_link_user.sql`)
   - Link your auth user to team_members
   - Replace email in script

4. **Performance Indexes** (`supabase/06_performance_indexes.sql`) - Optional
   - Adds performance optimization indexes

5. **Archiving & Reminders** (`supabase/08_add_archiving_and_reminders.sql`) - Optional
   - Adds isArchived to projects
   - Adds reminderDate to tasks

### 2. Storage Setup

Create storage buckets in Supabase Dashboard:

1. Go to **Storage** → **Create Bucket**
2. Create bucket: `task-attachments`
3. Set as **Public** (or configure RLS policies)
4. Set file size limit: 10MB (or desired limit)

### 3. Authentication Setup

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up redirect URLs:
   - Development: `http://localhost:3001`
   - Production: `https://yourdomain.com`

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all required variables

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Other Platforms

#### Netlify

1. Connect Git repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

#### Railway

1. Connect Git repository
2. Add environment variables
3. Railway auto-detects Next.js and deploys

#### Self-Hosted (Docker)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test authentication flow
- [ ] Verify database connections
- [ ] Test file uploads (if using)
- [ ] Check RLS policies are working
- [ ] Verify API routes are accessible
- [ ] Test all major features
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

## Monitoring & Maintenance

### Recommended Tools

- **Vercel Analytics** - Performance monitoring
- **Sentry** - Error tracking
- **Supabase Dashboard** - Database monitoring

### Database Maintenance

- Regularly check Supabase Dashboard for:
  - Database size
  - Query performance
  - Storage usage
  - API usage limits

### Backup Strategy

Supabase provides automatic backups. For additional safety:
- Export database regularly
- Backup storage files
- Keep SQL scripts versioned

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Restart deployment after adding variables
   - Check variable names match exactly

2. **Database Connection Errors**
   - Verify Supabase URL and keys
   - Check RLS policies allow access

3. **File Upload Failures**
   - Verify storage bucket exists
   - Check bucket permissions
   - Verify file size limits

4. **Authentication Issues**
   - Check redirect URLs in Supabase
   - Verify email provider is enabled
   - Check CORS settings

## Security Checklist

- [ ] Environment variables secured
- [ ] RLS policies enabled and tested
- [ ] File upload validation implemented
- [ ] Input sanitization enabled
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting considered
- [ ] Error messages don't leak sensitive info

## Performance Optimization

- [ ] Enable Next.js Image Optimization
- [ ] Configure CDN for static assets
- [ ] Enable compression
- [ ] Set up caching headers
- [ ] Monitor bundle size
- [ ] Use database indexes

## Support

For issues:
1. Check Supabase Dashboard logs
2. Check Vercel/Platform logs
3. Review browser console
4. Check network tab for API errors
