# Data Safety Guide

## 🔒 Will Running Scripts Remove or Update Existing Data?

### **Seed Script (`npx tsx scripts/seed-database.ts`)** ✅ **SAFE - Updates Only**

The seed script uses **`upsert`** with `onConflict: 'id'`, which means:

- ✅ **Updates existing records** that match the IDs in mock data
- ✅ **Creates new records** if they don't exist
- ✅ **Does NOT delete** any existing data
- ✅ **Preserves data** that's not in the mock data

**Example:**
- If you have a project with `id: '1'` already in the database, it will be **updated** with the mock data values
- If you have a project with `id: '999'` that's not in mock data, it will **remain untouched**

### **SQL Scripts** ⚠️ **Mostly Safe - Selective Updates**

#### `01_schema.sql` & `02_rls_and_auth.sql`
- ✅ **Safe** - Only creates tables, indexes, and policies
- ✅ **Does NOT modify existing data**

#### `06_performance_indexes.sql`
- ✅ **Completely Safe** - Only creates additional indexes and analyzes tables
- ✅ **Does NOT modify any data** - Indexes are database metadata only
- ✅ **Improves query performance** without changing any records
- ✅ **Can be run multiple times** - Uses `IF NOT EXISTS` to prevent duplicate indexes
- ✅ **ANALYZE command** only updates PostgreSQL query planner statistics (no data changes)

#### `03_link_user.sql`
- ✅ **Safe** - Only updates/links your specific user
- ✅ **Has DELETE** but only removes duplicates of YOUR email
- ✅ **Does NOT affect other users**

#### `05_link_owner.sql`
- ⚠️ **Selective DELETE** - Removes duplicate records for `dev.rusydi@gmail.com` only
- ✅ **Updates** existing owner record if it exists
- ✅ **Creates** owner record if it doesn't exist
- ✅ **Does NOT affect other team members**

#### `06_performance_indexes.sql`
- ✅ **Completely Safe** - Only creates indexes and analyzes tables
- ✅ **Does NOT modify any data** - Indexes are metadata only
- ✅ **Improves query performance** without changing data
- ✅ **Can be run multiple times** - Uses `IF NOT EXISTS` to prevent duplicates
- ✅ **ANALYZE command** only updates query planner statistics

## 📊 What Gets Updated?

### Seed Script Updates:
- **Team Members**: Updates records with IDs 1-11 (if they exist)
- **Projects**: Updates records with IDs 1-8 (if they exist)
- **Tasks**: Updates records with IDs 1-30 (if they exist)
- **Notifications**: Updates records with IDs 1-15 (if they exist)
- **Activities**: Updates records with IDs 1-4 (if they exist)

### What Stays Untouched:
- ✅ Records with different IDs (not in mock data)
- ✅ Your custom data that doesn't match mock IDs
- ✅ Other team members not in the mock data
- ✅ Other projects/tasks not in the mock data

## 🛡️ Best Practices

### Before Running Seed Script:
1. **Backup your database** if you have important custom data
2. **Check existing IDs** - if you have custom records with IDs 1-30, they will be overwritten
3. **Use different IDs** for your custom data (e.g., start from ID 1000)

### Safe Approach:
```bash
# 1. Check what data exists
# Run in Supabase SQL Editor:
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM team_members;

# 2. Run seed script (updates existing, creates missing)
npx tsx scripts/seed-database.ts

# 3. Verify results
SELECT COUNT(*) FROM projects; -- Should have at least 8
SELECT COUNT(*) FROM tasks;    -- Should have at least 30
```

## 🔄 To Completely Reset (Delete All Data)

If you want to **start fresh** and remove all existing data:

```sql
-- ⚠️ WARNING: This DELETES ALL DATA
DELETE FROM activities;
DELETE FROM notifications;
DELETE FROM tasks;
DELETE FROM project_memberships;
DELETE FROM projects;
DELETE FROM team_members WHERE email != 'dev.rusydi@gmail.com';
DELETE FROM users;

-- Then run seed script
-- npx tsx scripts/seed-database.ts
```

## 📝 Summary

| Script | Behavior | Affects Existing Data? |
|--------|----------|----------------------|
| `seed-database.ts` | Upsert (update/create) | ✅ Updates matching IDs only |
| `01_schema.sql` | Create tables | ❌ No data changes |
| `02_rls_and_auth.sql` | Create policies | ❌ No data changes |
| `03_link_user.sql` | Link user | ✅ Updates your user only |
| `05_link_owner.sql` | Link owner | ✅ Updates owner, removes duplicates |
| `06_performance_indexes.sql` | Create indexes | ❌ No data changes (metadata only) |

**Bottom Line**: The scripts are designed to be **safe** and **non-destructive**. They update existing records but don't delete data unless it's duplicate cleanup for specific users.
