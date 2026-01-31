// Database type definitions

export type ViewType = 'single' | 'multi';
export type MapStatus = 'draft' | 'published';
export type NodeType = 'product' | 'feature' | 'component';
export type NodeStatus = 'stable' | 'beta' | 'deprecated' | 'experimental';
export type EdgeType = 'hierarchy' | 'related' | 'depends-on' | 'optional';

// =====================================================
// NODE & EDGE DATA TYPES
// =====================================================

export interface NodeData {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    icon?: string;
    color?: string;
    tags?: string[];
    status?: NodeStatus;
    docUrl?: string;
    additionalLinks?: Array<{ title: string; url: string }>;
  };
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  type?: EdgeType;
  label?: string;
  floating?: boolean;
  style?: {
    strokeDasharray?: string;
  };
}

// =====================================================
// PROFILE TYPES
// =====================================================

export interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// MAP TYPES
// =====================================================

export interface Map {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  product_name: string;
  product_url: string | null;
  logo_url: string | null;
  description: string | null;
  status: MapStatus;
  view_type: ViewType;
  nodes: NodeData[];
  edges: EdgeData[];
  metadata: Record<string, unknown>;
  view_count: number;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type MapInsert = Omit<Map, 'id' | 'created_at' | 'updated_at' | 'view_count'>;
export type MapUpdate = Partial<Omit<Map, 'id' | 'user_id' | 'created_at'>>;

// =====================================================
// MAP VIEW TRACKING (Analytics)
// =====================================================

export interface MapViewTracking {
  id: string;
  map_id: string;
  user_id: string | null;
  viewed_at: string;
}

// Legacy alias for backward compatibility
export type MapView = MapViewTracking;

// =====================================================
// PRODUCT VIEW TYPES (Multi-View Maps)
// =====================================================

export interface ProductView {
  id: string;
  map_id: string;
  title: string;
  slug: string;
  order_index: number;
  nodes: NodeData[];
  edges: EdgeData[];
  created_at: string;
  updated_at: string;
}

export type ProductViewInsert = Omit<ProductView, 'id' | 'created_at' | 'updated_at'>;
export type ProductViewUpdate = Partial<Omit<ProductView, 'id' | 'map_id' | 'created_at'>>;

// =====================================================
// DATABASE INTERFACE (Supabase)
// =====================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      maps: {
        Row: Map;
        Insert: MapInsert;
        Update: MapUpdate;
      };
      map_views: {
        Row: MapViewTracking;
        Insert: Omit<MapViewTracking, 'id' | 'viewed_at'>;
        Update: never;
      };
      product_views: {
        Row: ProductView;
        Insert: ProductViewInsert;
        Update: ProductViewUpdate;
      };
    };
  };
}
