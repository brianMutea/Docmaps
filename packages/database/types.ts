// Database type definitions

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
        Insert: Omit<Map, 'id' | 'created_at' | 'updated_at' | 'view_count'>;
        Update: Partial<Omit<Map, 'id' | 'user_id' | 'created_at'>>;
      };
      map_views: {
        Row: MapView;
        Insert: Omit<MapView, 'id' | 'viewed_at'>;
        Update: never;
      };
    };
  };
}

export interface Profile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Map {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  product_name: string;
  product_url: string | null;
  description: string | null;
  status: 'draft' | 'published';
  nodes: NodeData[];
  edges: EdgeData[];
  metadata: Record<string, any>;
  view_count: number;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MapView {
  id: string;
  map_id: string;
  user_id: string | null;
  viewed_at: string;
}

export interface NodeData {
  id: string;
  type: 'product' | 'feature' | 'component';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    icon?: string;
    color?: string;
    tags?: string[];
    status?: 'stable' | 'beta' | 'deprecated' | 'experimental';
    docUrl?: string;
    additionalLinks?: Array<{ title: string; url: string }>;
  };
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  type?: 'hierarchy' | 'related' | 'depends-on' | 'optional';
  label?: string;
  style?: {
    strokeDasharray?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  nodes: NodeData[];
  edges: EdgeData[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
