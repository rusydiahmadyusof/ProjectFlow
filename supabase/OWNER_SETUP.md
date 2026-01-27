# Setting Up Testing Company Owner (dev.rusydi@gmail.com)

## 📋 Two-Step Process

The owner setup requires **two separate steps**:

### Step 1: Team Member Record (Automatic) ✅
- **Already handled** by the seed script
- When you run `npx tsx scripts/seed-database.ts`, it automatically creates:
  - Team member record with ID `11`
  - Name: `Rusydi`
  - Email: `dev.rusydi@gmail.com`
  - Role: `owner`
- **No action needed** - this happens automatically

### Step 2: Supabase Auth User (Manual) ⚠️
- **You need to create** the auth user if you want to login with this email
- This is separate from the team member record

## 🔐 Option A: Create Auth User Manually

### In Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **"Add User"** or **"Invite User"**
3. Enter email: `dev.rusydi@gmail.com`
4. Set a password (or use magic link)
5. Click **"Create User"**

### Then Link Them:
Run `supabase/05_link_owner.sql` in Supabase SQL Editor to link the auth user to the team member record.

## 🔐 Option B: Let User Sign Up Themselves

If `dev.rusydi@gmail.com` signs up through your app's login page:
1. They'll create their own auth user automatically
2. The `useUser` hook will try to auto-link them
3. Run `05_link_owner.sql` to ensure they get the `owner` role

## ✅ Quick Setup Checklist

- [ ] Run seed script: `npx tsx scripts/seed-database.ts` (creates team member)
- [ ] Create auth user in Supabase Dashboard (if you want to login)
- [ ] Run `supabase/05_link_owner.sql` (links auth user to team member)

## 🎯 What Happens If You Skip Auth User Creation?

- ✅ Team member record exists (from seed script)
- ❌ Cannot login with `dev.rusydi@gmail.com` (no auth user)
- ⚠️ App will show "Guest" role until auth user is created and linked

## 📝 Summary

| Component | Created By | Purpose |
|-----------|------------|---------|
| **Team Member Record** | Seed script | Stores user info, role, stats |
| **Auth User** | Supabase Auth | Enables login/authentication |
| **Link** | `05_link_owner.sql` | Connects auth user to team member |

**Answer: You only need to create the auth user if you want to login with that email. The team member record is created automatically by the seed script.**
