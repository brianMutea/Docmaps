# Database Migrations

This directory contains incremental database migrations for the DocMaps project.

## Migration Naming Convention

Migrations should be named using the following format:
```
YYYYMMDD_HHMMSS_description_of_change.sql
```

Example: `20240107_143000_add_increment_view_count_function.sql`

## How to Create a New Migration

1. **Create a new file** in this directory with the timestamp and description
2. **Write your SQL** - only include the changes, not the entire schema
3. **Test locally** - run the migration on your local Supabase instance first
4. **Apply to production** - run in Supabase SQL Editor or use Supabase CLI

## How to Apply Migrations

### Option 1: Supabase SQL Editor (Recommended for small teams)
1. Go to Supabase Dashboard → SQL Editor
2. Copy the migration SQL
3. Paste and run it
4. Mark the migration as applied in your tracking system

### Option 2: Supabase CLI (Recommended for teams)
```bash
# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db execute --file supabase/migrations/YYYYMMDD_HHMMSS_description.sql
```

## Migration Best Practices

### ✅ DO:
- Use `CREATE OR REPLACE` for functions
- Use `IF NOT EXISTS` for tables/indexes
- Use `ALTER TABLE IF EXISTS` for table modifications
- Include rollback instructions in comments
- Test on development database first
- Keep migrations small and focused
- Document what changed and why

### ❌ DON'T:
- Don't modify existing migrations after they've been applied
- Don't use `DROP TABLE` without a backup strategy
- Don't make breaking changes without a migration path
- Don't skip testing migrations

## Migration Template

```sql
-- Migration: [Brief description]
-- Date: YYYY-MM-DD
-- Author: [Your name]
-- 
-- Description:
-- [Detailed description of what this migration does]
--
-- Rollback:
-- [SQL commands to undo this migration if needed]

-- Your SQL here
```

## Current Migrations

| Date | File | Description | Status |
|------|------|-------------|--------|
| 2024-01-07 | `20240107_143000_add_increment_view_count_function.sql` | Add atomic view count increment function | ✅ Applied |

## Troubleshooting

### Migration fails with "already exists" error
- Check if the migration was already applied
- Use `CREATE OR REPLACE` for functions
- Use `IF NOT EXISTS` for tables

### Need to rollback a migration
- Check the rollback instructions in the migration file
- Create a new migration to undo the changes
- Never modify applied migrations

### Migration works locally but fails in production
- Check Supabase version compatibility
- Verify RLS policies don't block the migration
- Check for data that might violate new constraints
