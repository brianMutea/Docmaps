-- Migration: [Brief description of the change]
-- Date: YYYY-MM-DD
-- Author: [Your name or team name]
-- 
-- Description:
-- [Detailed description of what this migration does and why it's needed]
-- [Include any context about the feature or bug fix]
--
-- Dependencies:
-- [List any migrations this depends on, if applicable]
--
-- Rollback:
-- [SQL commands to undo this migration if needed]
-- Example: DROP FUNCTION IF EXISTS function_name(param_types);
-- Example: ALTER TABLE table_name DROP COLUMN IF EXISTS column_name;

-- =====================================================
-- YOUR SQL MIGRATION HERE
-- =====================================================

-- Example: Adding a new column
-- ALTER TABLE maps ADD COLUMN IF NOT EXISTS new_column TEXT;

-- Example: Creating a new function
-- CREATE OR REPLACE FUNCTION function_name(param UUID)
-- RETURNS void AS $$
-- BEGIN
--   -- Function logic here
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Creating a new index
-- CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);

-- Example: Adding RLS policy
-- CREATE POLICY "policy_name"
--   ON table_name FOR SELECT
--   USING (auth.uid() = user_id);

-- Add comments for documentation
-- COMMENT ON FUNCTION function_name IS 'Description of what this function does';
-- COMMENT ON COLUMN table_name.column_name IS 'Description of what this column stores';
