-- Migration: Add multi-view maps support
-- Date: 2026-01-10
-- 
-- Description:
-- Adds support for multi-view maps where each product gets its own canvas.
-- - Adds view_type column to maps table ('single' or 'multi')
-- - Creates product_views table to store individual views for multi-view maps
-- - Each view has its own nodes and edges
--
-- Rollback:
-- DROP TABLE IF EXISTS product_views;
-- ALTER TABLE maps DROP COLUMN IF EXISTS view_type;

-- =====================================================
-- ADD VIEW_TYPE COLUMN TO MAPS TABLE
-- =====================================================
ALTER TABLE maps 
ADD COLUMN IF NOT EXISTS view_type TEXT DEFAULT 'single' 
CHECK (view_type IN ('single', 'multi'));

-- Add comment for documentation
COMMENT ON COLUMN maps.view_type IS 'Type of map: single (one canvas) or multi (multiple product views)';

-- =====================================================
-- CREATE PRODUCT_VIEWS TABLE
-- =====================================================
-- Note: Named product_views to avoid conflict with existing map_views table (view tracking)
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique slug per map
  CONSTRAINT unique_product_view_slug UNIQUE(map_id, slug)
);

-- =====================================================
-- INDEXES FOR PRODUCT_VIEWS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_product_views_map_id ON product_views(map_id);
CREATE INDEX IF NOT EXISTS idx_product_views_order ON product_views(map_id, order_index);

-- =====================================================
-- RLS POLICIES FOR PRODUCT_VIEWS
-- =====================================================
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Views are readable if the parent map is readable (published or owned)
CREATE POLICY "Product views are viewable with parent map"
  ON product_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = product_views.map_id
      AND (maps.status = 'published' OR maps.user_id = auth.uid())
    )
  );

-- Users can insert views for their own maps
CREATE POLICY "Users can insert product views for own maps"
  ON product_views FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = product_views.map_id
      AND maps.user_id = auth.uid()
    )
  );

-- Users can update views for their own maps
CREATE POLICY "Users can update product views for own maps"
  ON product_views FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = product_views.map_id
      AND maps.user_id = auth.uid()
    )
  );

-- Users can delete views for their own maps
CREATE POLICY "Users can delete product views for own maps"
  ON product_views FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = product_views.map_id
      AND maps.user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_product_views_updated_at ON product_views;
CREATE TRIGGER update_product_views_updated_at
  BEFORE UPDATE ON product_views
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================
COMMENT ON TABLE product_views IS 'Individual product views for multi-view maps';
COMMENT ON COLUMN product_views.map_id IS 'Reference to parent map';
COMMENT ON COLUMN product_views.title IS 'Display title for this view';
COMMENT ON COLUMN product_views.slug IS 'URL-friendly identifier, unique per map';
COMMENT ON COLUMN product_views.order_index IS 'Display order in sidebar navigation';
COMMENT ON COLUMN product_views.nodes IS 'JSONB array of node objects for this view';
COMMENT ON COLUMN product_views.edges IS 'JSONB array of edge objects for this view';
