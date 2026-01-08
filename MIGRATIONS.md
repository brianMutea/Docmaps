# Database Migrations Guide

This document explains how to manage database schema changes for the DocMaps project.

## Overview

We use a migration-based approach to manage database schema changes. This ensures:
- **Version control** - All schema changes are tracked in git
- **Reproducibility** - Anyone can recreate the database from migrations
- **Safety** - Changes are tested before applying to production
- **Rollback capability** - We can undo changes if needed

## File Structure

```
docs-maps/
├── supabase-schema.sql          # Full schema (source of truth)
└── supabase/
    ├── migrations/
    │   ├── README.md            # Migration documentation
    │   ├── TEMPLATE.sql         # Template for new migrations
    │   ├── 20240107_143000_add_increment_view_count_function.sql
    │   └── ...                  # Future migrations
    └── create-migration.sh      # Helper script to create migrations
```

## Creating a New Migration

### Method 1: Using the Helper Script (Recommended)

```bash
cd docs-maps/supabase
./create-migration.sh "add user preferences table"
```

This will create a new migration file with:
- Timestamp prefix
- Your description in snake_case
- Pre-filled template with current date

### Method 2: Manual Creation

1. Create a new file in `supabase/migrations/`
2. Name it: `YYYYMMDD_HHMMSS_description.sql`
3. Copy content from `TEMPLATE.sql`
4. Fill in your SQL changes

## Applying Migrations

### Development (Local Supabase)

**Option 1: Supabase SQL Editor**
1. Go to http://localhost:54323 (or your Supabase Studio URL)
2. Navigate to SQL Editor
3. Copy migration SQL
4. Run it

**Option 2: Supabase CLI**
```bash
supabase db execute --file supabase/migrations/YYYYMMDD_HHMMSS_description.sql
```

### Production (Hosted Supabase)

**Option 1: Supabase Dashboard (Recommended for small changes)**
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to SQL Editor
4. Copy migration SQL from the file
5. Run it
6. Verify the change worked

**Option 2: Supabase CLI (Recommended for teams)**
```bash
# Link to your project (first time only)
supabase link --project-ref your-project-ref

# Push all pending migrations
supabase db push
```

## Migration Best Practices

### Writing Safe Migrations

✅ **DO:**
```sql
-- Use CREATE OR REPLACE for functions (idempotent)
CREATE OR REPLACE FUNCTION my_function() ...

-- Use IF NOT EXISTS for tables
CREATE TABLE IF NOT EXISTS my_table ...

-- Use IF EXISTS for drops
DROP TABLE IF EXISTS old_table;

-- Add columns with defaults for existing data
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Create indexes concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_name ON table(column);
```

❌ **DON'T:**
```sql
-- Don't use plain CREATE (will fail if exists)
CREATE FUNCTION my_function() ...

-- Don't drop tables without backup
DROP TABLE important_data;

-- Don't add NOT NULL columns without defaults
ALTER TABLE users ADD COLUMN email TEXT NOT NULL;

-- Don't modify applied migrations
-- (Create a new migration instead)
```

### Testing Migrations

1. **Test locally first**
   ```bash
   # Apply to local database
   supabase db execute --file supabase/migrations/new_migration.sql
   
   # Verify it worked
   supabase db diff
   ```

2. **Test rollback**
   ```bash
   # Run the rollback SQL from migration comments
   supabase db execute --file rollback.sql
   ```

3. **Test with real data**
   - Create test data that matches production patterns
   - Verify migration doesn't break existing functionality
   - Check performance with realistic data volumes

## Common Migration Patterns

### Adding a New Column

```sql
-- Add column with default value
ALTER TABLE maps 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add index for the new column
CREATE INDEX IF NOT EXISTS idx_maps_featured 
ON maps(featured) WHERE featured = true;

-- Update RLS policies if needed
CREATE POLICY "Anyone can view featured maps"
  ON maps FOR SELECT
  USING (featured = true OR status = 'published');
```

### Creating a New Function

```sql
-- Create or replace function (safe to run multiple times)
CREATE OR REPLACE FUNCTION calculate_popularity_score(map_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT view_count * 2 + (SELECT COUNT(*) FROM map_views WHERE map_id = $1)
    FROM maps
    WHERE id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION calculate_popularity_score IS 
  'Calculates a popularity score based on views and engagement';
```

### Adding a New Table

```sql
-- Create table with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Modifying Existing Data

```sql
-- Update data in batches to avoid locks
DO $$
DECLARE
  batch_size INTEGER := 1000;
  offset_val INTEGER := 0;
BEGIN
  LOOP
    UPDATE maps
    SET metadata = metadata || '{"version": "2.0"}'::jsonb
    WHERE id IN (
      SELECT id FROM maps
      WHERE metadata->>'version' IS NULL
      LIMIT batch_size
      OFFSET offset_val
    );
    
    EXIT WHEN NOT FOUND;
    offset_val := offset_val + batch_size;
    
    -- Add delay to avoid overwhelming database
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

## Rollback Strategy

Every migration should include rollback instructions in comments:

```sql
-- Rollback:
-- DROP FUNCTION IF EXISTS my_new_function(UUID);
-- ALTER TABLE maps DROP COLUMN IF EXISTS new_column;
-- DROP TABLE IF EXISTS new_table;
```

To rollback:
1. Copy the rollback SQL from migration comments
2. Create a new migration file with the rollback SQL
3. Apply it like any other migration

## Troubleshooting

### "Function already exists" error
- Use `CREATE OR REPLACE FUNCTION` instead of `CREATE FUNCTION`

### "Table already exists" error
- Use `CREATE TABLE IF NOT EXISTS` instead of `CREATE TABLE`

### Migration works locally but fails in production
- Check Supabase version compatibility
- Verify RLS policies don't block the migration
- Check for data that violates new constraints
- Test with production-like data volumes

### Need to modify an applied migration
- **Never modify applied migrations**
- Create a new migration to make the change
- Document why the change was needed

## Current Migration Status

| Date | Migration | Status | Notes |
|------|-----------|--------|-------|
| 2024-01-07 | `20240107_143000_add_increment_view_count_function.sql` | ✅ Applied | Atomic view count increment |

## Resources

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [PostgreSQL CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html)
