-- Migration: Add floating edge field documentation
-- Description: Updates schema comments to document the new 'floating' field in edge objects
-- Date: 2026-01-31

-- Update comment for maps.edges to include floating field
COMMENT ON COLUMN maps.edges IS 'JSONB array of edge objects with structure: {id, source, target, type, label, floating, style}';

-- Update comment for product_views.edges to include floating field
COMMENT ON COLUMN product_views.edges IS 'JSONB array of edge objects with structure: {id, source, target, type, label, floating, style}';

-- Update comment for templates.edges to include floating field (if templates table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
    EXECUTE 'COMMENT ON COLUMN templates.edges IS ''JSONB array of edge objects with structure: {id, source, target, type, label, floating, style}''';
  END IF;
END $$;
