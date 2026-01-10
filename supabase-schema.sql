-- DocMaps Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- MAPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  view_type TEXT DEFAULT 'single' CHECK (view_type IN ('single', 'multi')),
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  view_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for maps
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

-- Published maps are viewable by everyone
CREATE POLICY "Published maps are viewable by everyone"
  ON maps FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

-- Users can insert their own maps
CREATE POLICY "Users can insert own maps"
  ON maps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own maps
CREATE POLICY "Users can update own maps"
  ON maps FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own maps
CREATE POLICY "Users can delete own maps"
  ON maps FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- MAP_VIEWS TABLE (View Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS map_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for map_views
ALTER TABLE map_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for tracking)
CREATE POLICY "Anyone can insert map views"
  ON map_views FOR INSERT
  WITH CHECK (true);

-- Map owners can read views of their maps
CREATE POLICY "Map owners can read their map views"
  ON map_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM maps
      WHERE maps.id = map_views.map_id
      AND maps.user_id = auth.uid()
    )
  );

-- =====================================================
-- PRODUCT_VIEWS TABLE (Multi-View Map Content)
-- =====================================================
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
  CONSTRAINT unique_product_view_slug UNIQUE(map_id, slug)
);

-- RLS Policies for product_views
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Views are readable if the parent map is readable
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
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_maps_slug ON maps(slug);
CREATE INDEX IF NOT EXISTS idx_maps_user_id ON maps(user_id);
CREATE INDEX IF NOT EXISTS idx_maps_status ON maps(status);
CREATE INDEX IF NOT EXISTS idx_maps_view_type ON maps(view_type);
CREATE INDEX IF NOT EXISTS idx_maps_created_at ON maps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maps_updated_at ON maps(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_maps_view_count ON maps(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_map_views_map_id ON map_views(map_id);
CREATE INDEX IF NOT EXISTS idx_map_views_viewed_at ON map_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_views_map_id ON product_views(map_id);
CREATE INDEX IF NOT EXISTS idx_product_views_order ON product_views(map_id, order_index);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for maps table
DROP TRIGGER IF EXISTS update_maps_updated_at ON maps;
CREATE TRIGGER update_maps_updated_at
  BEFORE UPDATE ON maps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for product_views table
DROP TRIGGER IF EXISTS update_product_views_updated_at ON product_views;
CREATE TRIGGER update_product_views_updated_at
  BEFORE UPDATE ON product_views
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

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

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================
COMMENT ON TABLE profiles IS 'User profiles with display information';
COMMENT ON TABLE maps IS 'Documentation maps created by users';
COMMENT ON TABLE map_views IS 'Tracking table for map views (analytics)';
COMMENT ON TABLE product_views IS 'Individual product views for multi-view maps';

COMMENT ON COLUMN maps.view_type IS 'Type of map: single (one canvas) or multi (multiple product views)';
COMMENT ON COLUMN maps.nodes IS 'JSONB array of node objects with structure: {id, type, position, data}';
COMMENT ON COLUMN maps.edges IS 'JSONB array of edge objects with structure: {id, source, target, type, label, style}';
COMMENT ON COLUMN maps.metadata IS 'Additional metadata for the map';

COMMENT ON COLUMN product_views.map_id IS 'Reference to parent map';
COMMENT ON COLUMN product_views.title IS 'Display title for this view';
COMMENT ON COLUMN product_views.slug IS 'URL-friendly identifier, unique per map';
COMMENT ON COLUMN product_views.order_index IS 'Display order in sidebar navigation';
COMMENT ON COLUMN product_views.nodes IS 'JSONB array of node objects for this view';
COMMENT ON COLUMN product_views.edges IS 'JSONB array of edge objects for this view';
