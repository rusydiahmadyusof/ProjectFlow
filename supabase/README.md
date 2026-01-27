# Supabase Setup Guide

This directory contains SQL scripts to set up your ProjectFlow database.

## 📋 Setup Order

Run these scripts **in order** in Supabase SQL Editor:

### 1. **01_schema.sql** (Required)
Creates all database tables, indexes, and triggers.
- Run this first
- Creates temporary "allow all" policies for development

### 2. **02_rls_and_auth.sql** (Required)
Sets up Row Level Security (RLS) and authentication policies.
- Run after schema.sql
- Removes temporary policies
- Creates proper RBAC policies

### 3. **03_link_user.sql** (Required)
Links your Supabase Auth user to a team_member record.
- Run after creating your user in Supabase Auth
- **IMPORTANT**: Replace `'your-email@example.com'` with your actual email
- This fixes the "Guest" role issue
- **Note**: For Testing Company owner (dev.rusydi@gmail.com), see `05_link_owner.sql`

### 4. **04_seed.sql** (Optional)
Seed data for testing.
- Run after linking your user
- Seeds: Users, Team Members, Projects, and Project Memberships
- Or use: `npx tsx scripts/seed-database.ts` for complete seeding (includes Tasks, Notifications, Activities)
- Seeds Testing Company data including owner (dev.rusydi@gmail.com)
- **Note**: Tasks, Notifications, and Activities are best seeded via the TypeScript script due to complex JSONB structures

### 5. **05_link_owner.sql** (Optional)
Links Testing Company owner (dev.rusydi@gmail.com) as owner role.
- Run after creating dev.rusydi@gmail.com in Supabase Auth
- Run after seeding database (step 4)
- Ensures owner role and auth user linking
- **Note**: Team member record is created automatically by seed script. You only need to create the auth user if you want to login with this email. See `OWNER_SETUP.md` for details.

## 🚀 Quick Setup

```sql
-- 1. Run 01_schema.sql
-- 2. Run 02_rls_and_auth.sql
-- 3. Create user in Supabase Auth Dashboard
-- 4. Run 03_link_user.sql (replace email)
-- 5. (Optional) Run seed script: npx tsx scripts/seed-database.ts
-- 6. (Optional) Run 05_link_owner.sql to link Testing Company owner
```

## 🔧 Troubleshooting

### Role shows "Guest" instead of "Admin"
- Run `03_link_user.sql` and verify `link_status` shows "✅ Linked"
- Check browser console for errors
- Hard refresh the app (Ctrl+Shift+R)

### RLS blocking queries
- Verify you've run `02_rls_and_auth.sql`
- Check that your `authUserId` is linked in `team_members` table
- Verify your role in `team_members` table matches expected role

### Multiple team_member records
- `03_link_user.sql` automatically deletes duplicates (keeps highest priority role)
- Priority: admin > owner > member > guest

## 📝 Old Files (Deprecated)

These files have been consolidated:
- ~~`schema.sql`~~ → `01_schema.sql`
- ~~`patch_roles.sql`~~ → Merged into `01_schema.sql`
- ~~`patch_activities.sql`~~ → Merged into `01_schema.sql`
- ~~`rls_and_auth_setup.sql`~~ → `02_rls_and_auth.sql`
- ~~`fix_auth_user_link_policy.sql`~~ → Merged into `02_rls_and_auth.sql`
- ~~`link_auth_user.sql`~~ → `03_link_user.sql`
- ~~`fix_user_role.sql`~~ → `03_link_user.sql`
- ~~`debug_and_fix_user_role.sql`~~ → `03_link_user.sql`
- ~~`seed.sql`~~ → `04_seed.sql`

## 🔐 Security Notes

- RLS policies enforce role-based access at the database level
- Owner/Admin: Full access to all data
- Member: CRUD on assigned projects only
- Guest: Read-only on assigned projects only
- Always test with different roles before production deployment

## 🛡️ Data Safety

**Will running scripts remove existing data?**

- ✅ **Seed script**: Uses UPSERT - updates existing records, doesn't delete
- ✅ **SQL scripts**: Mostly safe - only update specific records
- ⚠️ **05_link_owner.sql**: Removes duplicates for owner email only

**See `DATA_SAFETY.md` for detailed information about data handling.**
