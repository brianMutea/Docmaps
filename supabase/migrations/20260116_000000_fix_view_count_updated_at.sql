-- Migration: Fix increment_map_view_count to not update updated_at
-- Date: 2026-01-16
-- Author: DocMaps Team
-- 
-- Description:
-- Updates the increment_map_view_count function to bypass the updated_at trigger.
-- Previously, incrementing view_count would trigger the update_updated_at_column
-- function, causing the timestamp to change every time someone viewed a map.
-- This fix ensures updated_at only changes when actual content is modified.
--
-- Rollback:
-- Run the original function from 20240107_143000_add_increment_view_count_function.sql

-- =====================================================
-- FUNCTION: Increment Map View Count (Fixed)
-- =====================================================
CREATE OR REPLACE FUNCTION increment_map_view_count(map_id UUID)
RETURNS void AS $$
BEGIN
  -- Use a direct UPDATE that preserves the existing updated_at value
  UPDATE maps
  SET 
    view_count = view_count + 1,
    updated_at = updated_at  -- Explicitly preserve the current value
  WHERE id = map_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION increment_map_view_count IS 'Atomically increments the view count for a map without modifying updated_at. Used by view tracking system.';
