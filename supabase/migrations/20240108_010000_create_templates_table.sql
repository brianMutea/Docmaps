-- Create templates table for starter map templates
-- Migration: Add templates table

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read active templates
CREATE POLICY "Active templates are viewable by everyone"
  ON templates FOR SELECT
  USING (is_active = true);

-- Create index for active templates
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- Trigger for templates table
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE templates IS 'Starter templates for creating new maps';
COMMENT ON COLUMN templates.nodes IS 'JSONB array of node objects';
COMMENT ON COLUMN templates.edges IS 'JSONB array of edge objects';

-- Insert starter templates
INSERT INTO templates (name, description, category, nodes, edges) VALUES
(
  'Basic Hierarchy',
  'A simple hierarchical structure with product, features, and components',
  'Getting Started',
  '[
    {"id":"node-1","type":"product","position":{"x":250,"y":50},"data":{"label":"Product","description":"Main product or service","icon":"📦","color":"#10b981","tags":[],"status":"stable"}},
    {"id":"node-2","type":"feature","position":{"x":100,"y":200},"data":{"label":"Feature 1","description":"First major feature","icon":"⚡","color":"#3b82f6","tags":[],"status":"stable"}},
    {"id":"node-3","type":"feature","position":{"x":400,"y":200},"data":{"label":"Feature 2","description":"Second major feature","icon":"⚡","color":"#3b82f6","tags":[],"status":"stable"}},
    {"id":"node-4","type":"component","position":{"x":50,"y":350},"data":{"label":"Component A","description":"Sub-component","icon":"🔧","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-5","type":"component","position":{"x":150,"y":350},"data":{"label":"Component B","description":"Sub-component","icon":"🔧","color":"#8b5cf6","tags":[],"status":"stable"}}
  ]'::jsonb,
  '[
    {"id":"edge-1","source":"node-1","target":"node-2","type":"hierarchy"},
    {"id":"edge-2","source":"node-1","target":"node-3","type":"hierarchy"},
    {"id":"edge-3","source":"node-2","target":"node-4","type":"hierarchy"},
    {"id":"edge-4","source":"node-2","target":"node-5","type":"hierarchy"}
  ]'::jsonb
),
(
  'Feature Comparison',
  'Compare multiple features side by side',
  'Documentation',
  '[
    {"id":"node-1","type":"product","position":{"x":250,"y":50},"data":{"label":"Product","description":"Main product","icon":"📦","color":"#10b981","tags":[],"status":"stable"}},
    {"id":"node-2","type":"feature","position":{"x":100,"y":200},"data":{"label":"Free Plan","description":"Basic features","icon":"💰","color":"#3b82f6","tags":["free"],"status":"stable"}},
    {"id":"node-3","type":"feature","position":{"x":250,"y":200},"data":{"label":"Pro Plan","description":"Advanced features","icon":"⭐","color":"#3b82f6","tags":["paid"],"status":"stable"}},
    {"id":"node-4","type":"feature","position":{"x":400,"y":200},"data":{"label":"Enterprise","description":"Full features","icon":"🏢","color":"#3b82f6","tags":["enterprise"],"status":"stable"}}
  ]'::jsonb,
  '[
    {"id":"edge-1","source":"node-1","target":"node-2","type":"hierarchy"},
    {"id":"edge-2","source":"node-1","target":"node-3","type":"hierarchy"},
    {"id":"edge-3","source":"node-1","target":"node-4","type":"hierarchy"}
  ]'::jsonb
),
(
  'API Documentation',
  'Document your API endpoints and resources',
  'API',
  '[
    {"id":"node-1","type":"product","position":{"x":250,"y":50},"data":{"label":"API","description":"REST API","icon":"🌐","color":"#10b981","tags":[],"status":"stable"}},
    {"id":"node-2","type":"feature","position":{"x":100,"y":200},"data":{"label":"Authentication","description":"Auth endpoints","icon":"🔐","color":"#3b82f6","tags":["security"],"status":"stable"}},
    {"id":"node-3","type":"feature","position":{"x":400,"y":200},"data":{"label":"Resources","description":"Data endpoints","icon":"📊","color":"#3b82f6","tags":[],"status":"stable"}},
    {"id":"node-4","type":"component","position":{"x":50,"y":350},"data":{"label":"POST /login","description":"User login","icon":"🔑","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-5","type":"component","position":{"x":150,"y":350},"data":{"label":"POST /register","description":"User registration","icon":"✍️","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-6","type":"component","position":{"x":350,"y":350},"data":{"label":"GET /users","description":"List users","icon":"👥","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-7","type":"component","position":{"x":450,"y":350},"data":{"label":"POST /users","description":"Create user","icon":"➕","color":"#8b5cf6","tags":[],"status":"stable"}}
  ]'::jsonb,
  '[
    {"id":"edge-1","source":"node-1","target":"node-2","type":"hierarchy"},
    {"id":"edge-2","source":"node-1","target":"node-3","type":"hierarchy"},
    {"id":"edge-3","source":"node-2","target":"node-4","type":"hierarchy"},
    {"id":"edge-4","source":"node-2","target":"node-5","type":"hierarchy"},
    {"id":"edge-5","source":"node-3","target":"node-6","type":"hierarchy"},
    {"id":"edge-6","source":"node-3","target":"node-7","type":"hierarchy"}
  ]'::jsonb
),
(
  'Component Library',
  'Document UI components and their relationships',
  'UI/UX',
  '[
    {"id":"node-1","type":"product","position":{"x":250,"y":50},"data":{"label":"Component Library","description":"UI Components","icon":"🎨","color":"#10b981","tags":[],"status":"stable"}},
    {"id":"node-2","type":"feature","position":{"x":100,"y":200},"data":{"label":"Forms","description":"Form components","icon":"📝","color":"#3b82f6","tags":[],"status":"stable"}},
    {"id":"node-3","type":"feature","position":{"x":400,"y":200},"data":{"label":"Navigation","description":"Nav components","icon":"🧭","color":"#3b82f6","tags":[],"status":"stable"}},
    {"id":"node-4","type":"component","position":{"x":50,"y":350},"data":{"label":"Input","description":"Text input","icon":"⌨️","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-5","type":"component","position":{"x":150,"y":350},"data":{"label":"Button","description":"Action button","icon":"🔘","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-6","type":"component","position":{"x":350,"y":350},"data":{"label":"Menu","description":"Dropdown menu","icon":"☰","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-7","type":"component","position":{"x":450,"y":350},"data":{"label":"Tabs","description":"Tab navigation","icon":"📑","color":"#8b5cf6","tags":[],"status":"stable"}}
  ]'::jsonb,
  '[
    {"id":"edge-1","source":"node-1","target":"node-2","type":"hierarchy"},
    {"id":"edge-2","source":"node-1","target":"node-3","type":"hierarchy"},
    {"id":"edge-3","source":"node-2","target":"node-4","type":"hierarchy"},
    {"id":"edge-4","source":"node-2","target":"node-5","type":"hierarchy"},
    {"id":"edge-5","source":"node-3","target":"node-6","type":"hierarchy"},
    {"id":"edge-6","source":"node-3","target":"node-7","type":"hierarchy"}
  ]'::jsonb
),
(
  'Microservices Architecture',
  'Document microservices and their dependencies',
  'Architecture',
  '[
    {"id":"node-1","type":"product","position":{"x":250,"y":50},"data":{"label":"System","description":"Microservices system","icon":"🏗️","color":"#10b981","tags":[],"status":"stable"}},
    {"id":"node-2","type":"feature","position":{"x":100,"y":200},"data":{"label":"API Gateway","description":"Entry point","icon":"🚪","color":"#3b82f6","tags":[],"status":"stable"}},
    {"id":"node-3","type":"feature","position":{"x":400,"y":200},"data":{"label":"Services","description":"Backend services","icon":"⚙️","color":"#3b82f6","tags":[],"status":"stable"}},
    {"id":"node-4","type":"component","position":{"x":300,"y":350},"data":{"label":"Auth Service","description":"Authentication","icon":"🔐","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-5","type":"component","position":{"x":400,"y":350},"data":{"label":"User Service","description":"User management","icon":"👤","color":"#8b5cf6","tags":[],"status":"stable"}},
    {"id":"node-6","type":"component","position":{"x":500,"y":350},"data":{"label":"Data Service","description":"Data processing","icon":"💾","color":"#8b5cf6","tags":[],"status":"stable"}}
  ]'::jsonb,
  '[
    {"id":"edge-1","source":"node-1","target":"node-2","type":"hierarchy"},
    {"id":"edge-2","source":"node-1","target":"node-3","type":"hierarchy"},
    {"id":"edge-3","source":"node-2","target":"node-4","type":"depends-on"},
    {"id":"edge-4","source":"node-3","target":"node-4","type":"hierarchy"},
    {"id":"edge-5","source":"node-3","target":"node-5","type":"hierarchy"},
    {"id":"edge-6","source":"node-3","target":"node-6","type":"hierarchy"},
    {"id":"edge-7","source":"node-5","target":"node-4","type":"depends-on"}
  ]'::jsonb
);
