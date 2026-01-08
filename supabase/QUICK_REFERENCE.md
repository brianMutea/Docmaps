# Database Migrations - Quick Reference

## Create New Migration

```bash
cd docs-maps/supabase
./create-migration.sh "your description here"
```

## Apply Migration to Production

### Copy-Paste Method (Easiest)
1. Open migration file
2. Copy the SQL
3. Go to Supabase Dashboard → SQL Editor
4. Paste and run
5. ✅ Done!

### CLI Method
```bash
supabase db execute --file supabase/migrations/YYYYMMDD_HHMMSS_file.sql
```

## Common SQL Patterns

### Add Column
```sql
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;
```

### Create Function
```sql
CREATE OR REPLACE FUNCTION function_name(param TYPE)
RETURNS TYPE AS $$
BEGIN
  -- logic here
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Add Index
```sql
CREATE INDEX IF NOT EXISTS idx_name 
ON table_name(column_name);
```

### Add RLS Policy
```sql
CREATE POLICY "policy_name"
  ON table_name FOR SELECT
  USING (condition);
```

## Safety Checklist

Before applying to production:
- [ ] Tested locally
- [ ] Uses `IF NOT EXISTS` / `IF EXISTS`
- [ ] Uses `CREATE OR REPLACE` for functions
- [ ] Includes rollback instructions
- [ ] Doesn't drop tables with data
- [ ] Doesn't add NOT NULL without defaults

## Current Migration

**Latest:** `20240107_143000_add_increment_view_count_function.sql`

**To apply:** Copy SQL from file → Supabase Dashboard → SQL Editor → Run

## Need Help?

See full documentation: `docs-maps/MIGRATIONS.md`
