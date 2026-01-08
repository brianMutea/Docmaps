-- Migration: Add increment_map_view_count function
-- Date: 2024-01-07
-- Author: DocMaps Team
-- 
-- Description:
-- Adds a database function to atomically increment the view_count on maps.
-- This prevents race conditions when multiple users view a map simultaneously.
-- Used by the ViewTracker component for client-side view tracking with
-- localStorage-based deduplication (24-hour window).
--
-- Rollback:
-- DROP FUNCTION IF EXISTS increment_map_view_count(UUID);

-- =====================================================
-- FUNCTION: Increment Map View Count
-- =====================================================
CREATE OR REPLACE FUNCTION increment_map_view_count(map_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE maps
  SET view_count = view_count + 1
  WHERE id = map_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION increment_map_view_count IS 'Atomically increments the view count for a map. Used by view tracking system.';
