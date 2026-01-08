-- Add featured flag to maps table
-- Migration: Add featured flag for highlighting maps on home page

ALTER TABLE maps ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create index for featured maps queries
CREATE INDEX IF NOT EXISTS idx_maps_featured ON maps(featured) WHERE featured = true;

-- Add comment
COMMENT ON COLUMN maps.featured IS 'Flag to mark maps as featured on home page (admin only in future)';
