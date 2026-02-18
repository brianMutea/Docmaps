-- Migration: Add generation metadata to maps table
-- Date: 2026-02-18
-- Author: DocMaps Team
-- 
-- Description:
-- Adds a generation_metadata JSONB column to the maps table to store metadata
-- about auto-generated maps from documentation URLs. This includes the source URL,
-- generation strategy used, confidence score, warnings, and statistics about the
-- generation process.
--
-- Dependencies:
-- Requires the maps table to exist (created in initial schema)
--
-- Rollback:
-- DROP INDEX IF EXISTS idx_maps_generation_source_url;
-- ALTER TABLE maps DROP COLUMN IF EXISTS generation_metadata;

-- =====================================================
-- ADD GENERATION METADATA COLUMN
-- =====================================================

-- Add generation_metadata JSONB column to maps table
ALTER TABLE maps ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT NULL;

-- Create index on source_url within generation_metadata for efficient lookups
CREATE INDEX IF NOT EXISTS idx_maps_generation_source_url 
  ON maps ((generation_metadata->>'source_url'));

-- Add comment documenting the metadata structure
COMMENT ON COLUMN maps.generation_metadata IS 
'Metadata about auto-generated maps. Structure:
{
  "source_url": "https://docs.example.com",
  "generated_at": "2026-02-18T10:30:00Z",
  "strategy": "template|schema|html|heuristic",
  "confidence": 0.85,
  "warnings": ["warning1", "warning2"],
  "stats": {
    "nodes_extracted": 50,
    "nodes_final": 45,
    "edges_extracted": 60,
    "nodes_deduplicated": 3,
    "nodes_filtered": 2,
    "duration_ms": 1500
  },
  "auto_generated_node_ids": ["product-api", "feature-auth"],
  "manually_added_node_ids": ["component-custom"]
}';

