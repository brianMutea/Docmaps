# Supabase Setup Guide

This guide will help you set up Supabase for the DocMaps project.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: DocMaps (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need three values:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **anon/public key**: Under "Project API keys" → "anon public"
   - **service_role key**: Under "Project API keys" → "service_role" (keep this secret!)

## Step 3: Configure Environment Variables

### For the Editor App (`apps/editor/.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For the Web App (`apps/web/.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Step 4: Execute the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from the project root
4. Paste it into the SQL Editor
5. Click "Run" or press `Ctrl/Cmd + Enter`
6. Verify that all tables were created successfully

You should see:
- ✅ `profiles` table created
- ✅ `maps` table created
- ✅ `map_views` table created
- ✅ Indexes created
- ✅ RLS policies enabled
- ✅ Trigger functions created

## Step 5: Configure Authentication (Optional - for Task 4)

### Email Authentication (Default - Already Enabled)
Email authentication is enabled by default in Supabase.

### Google OAuth (Optional)
1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Find "Google" and click to configure
3. You'll need to create OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
4. Paste the Client ID and Client Secret into Supabase
5. Enable the provider

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see three tables:
   - `profiles`
   - `maps`
   - `map_views`
3. Click on each table to verify the columns match the schema

## Troubleshooting

### "relation already exists" errors
If you see errors about relations already existing, you can either:
- Drop the existing tables first (if safe to do so)
- Or modify the SQL to use `CREATE TABLE IF NOT EXISTS`

### RLS Policy errors
If you get RLS policy errors, make sure:
- RLS is enabled on all tables
- The policies are created after the tables
- You're using the correct user context

### Trigger errors
If triggers fail to create:
- Make sure the trigger functions are created first
- Check that the `auth.users` table exists (it should by default)

## Next Steps

After completing this setup:
1. Test the connection by running the Next.js apps
2. Try signing up a test user
3. Verify the profile is auto-created
4. Continue with Task 3 to set up the UI packages

## Security Notes

⚠️ **Important Security Reminders:**
- Never commit `.env.local` files to git (they're in `.gitignore`)
- Keep your `service_role` key secret - it bypasses RLS
- Only use `service_role` key on the server side
- The `anon` key is safe to use in the browser
- Always test RLS policies thoroughly before going to production
