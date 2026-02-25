# Supabase setup

**Files:** `schema.sql` (run first) · `seed.sql` (optional)

1. Run **schema.sql** in Supabase SQL Editor.
2. Create your user in **Authentication → Users** (or sign up via the app).
3. (Optional) Run **seed.sql** or `npx tsx scripts/seed-database.ts` for sample data.
4. Link auth to team member:

```sql
UPDATE team_members
SET "authUserId" = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
WHERE email = 'your-email@example.com' AND "authUserId" IS NULL;
```

**Owner:** Seed creates a team member with role `owner`; create the auth user in Dashboard (or sign up), then run the same `UPDATE` with that email.

**Data:** schema.sql only creates/updates structure (no row deletes). seed.sql and seed-database.ts upsert by ID; seed.sql replaces project memberships for projects 1–8. Link query updates only the row for the email you use. Back up before seeding if you have important data.

**Troubleshooting:** Role shows "Guest" → run the link UPDATE. RLS errors → ensure schema.sql was run. Duplicates → delete extra rows for your email, keep one, then run the UPDATE.
