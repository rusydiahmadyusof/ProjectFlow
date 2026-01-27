/**
 * Script to check and debug user role issues
 * Run with: npx tsx scripts/check_user_role.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserRole() {
  console.log('🔍 Checking user role...');
  console.log('');

  // Get current auth user
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    console.error('❌ Not authenticated. Please log in first.');
    console.error('   Error:', authError?.message);
    return;
  }

  console.log('✅ Authenticated as:');
  console.log(`   Email: ${authUser.email}`);
  console.log(`   Auth User ID: ${authUser.id}`);
  console.log('');

  // Check if linked to team_members
  const { data: teamMember, error: teamError } = await supabase
    .from('team_members')
    .select('*')
    .eq('authUserId', authUser.id)
    .maybeSingle();

  if (teamError) {
    console.error('❌ Error querying team_members:');
    console.error('   Error:', teamError.message);
    console.error('   Details:', teamError);
    return;
  }

  if (!teamMember) {
    console.log('⚠️  No team_members row found for this auth user!');
    console.log('');
    console.log('📝 To fix this, run this SQL in Supabase SQL Editor:');
    console.log('');
    console.log('   UPDATE team_members');
    console.log(`   SET "authUserId" = '${authUser.id}'::uuid`);
    console.log(`   WHERE email = '${authUser.email}';`);
    console.log('');
    console.log('   Or use the script: supabase/link_auth_user.sql');
    console.log('');
    return;
  }

  console.log('✅ Found team member:');
  console.log(`   Name: ${teamMember.name}`);
  console.log(`   Email: ${teamMember.email}`);
  console.log(`   Role: ${teamMember.role}`);
  console.log(`   Team Member ID: ${teamMember.id}`);
  console.log(`   Auth User ID: ${teamMember.authUserId}`);
  console.log('');

  if (!teamMember.authUserId) {
    console.log('⚠️  authUserId is NULL! Linking now...');
    console.log('');
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ authUserId: authUser.id })
      .eq('id', teamMember.id);

    if (updateError) {
      console.error('❌ Failed to link authUserId:');
      console.error('   Error:', updateError.message);
    } else {
      console.log('✅ Successfully linked authUserId!');
      console.log('   Refresh your app to see the updated role.');
      console.log('');
    }
  } else if (teamMember.authUserId !== authUser.id) {
    console.log('⚠️  authUserId mismatch!');
    console.log(`   Expected: ${authUser.id}`);
    console.log(`   Found: ${teamMember.authUserId}`);
    console.log('');
    console.log('📝 To fix, run this SQL:');
    console.log('');
    console.log('   UPDATE team_members');
    console.log(`   SET "authUserId" = '${authUser.id}'::uuid`);
    console.log(`   WHERE id = '${teamMember.id}';`);
    console.log('');
  } else {
    console.log('✅ Everything looks good!');
    console.log('   Your role is: ' + teamMember.role);
    console.log('');
  }
}

checkUserRole().catch(console.error);
