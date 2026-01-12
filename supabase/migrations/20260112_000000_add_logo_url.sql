-- Migration: Add logo_url column to maps table
-- Description: Allows users to upload a company/product logo for their documentation maps
-- Date: 2026-01-12

-- =====================================================
-- ADD LOGO_URL COLUMN
-- =====================================================
ALTER TABLE maps ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN maps.logo_url IS 'URL to the product/company logo image stored in Supabase Storage';

-- =====================================================
-- CREATE STORAGE BUCKET FOR LOGOS
-- =====================================================
-- Create bucket if it doesn't exist (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES (idempotent with DROP IF EXISTS)
-- =====================================================

-- Allow authenticated users to upload logos
DROP POLICY IF EXISTS "Users can upload logos" ON storage.objects;
CREATE POLICY "Users can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND
    auth.role() = 'authenticated'
  );

-- Allow public read access to logos
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
CREATE POLICY "Public can view logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

-- Allow users to update their own logos
DROP POLICY IF EXISTS "Users can update own logos" ON storage.objects;
CREATE POLICY "Users can update own logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own logos
DROP POLICY IF EXISTS "Users can delete own logos" ON storage.objects;
CREATE POLICY "Users can delete own logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
