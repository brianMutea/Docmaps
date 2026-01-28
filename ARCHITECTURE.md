# DocMaps Architecture Documentation

## Overview

DocMaps is a visual documentation platform that enables users to create interactive maps of software products, frameworks, and APIs. The system consists of two primary applications: a public web viewer for browsing published maps and a dedicated editor for creating and managing documentation maps.

The platform is built as a TypeScript monorepo using Turborepo, with Next.js 14 applications, Supabase for backend services, and React Flow for interactive graph visualization.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DocMaps Platform                         │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Applications                                          │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │   Web Viewer    │    │         Editor App                  │ │
│  │   (Port 3001)   │    │        (Port 3000)                  │ │
│  │                 │    │                                     │ │
│  │ • Map browsing  │    │ • Map creation/editing              │ │
│  │ • Public gallery│    │ • User authentication               │ │
│  │ • Embed support │    │ • Real-time canvas                  │ │
│  │ • Search/filter │    │ • Multi-view management             │ │
│  └─────────────────┘    └─────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Shared Packages                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │   UI    │ │Database │ │  Auth   │ │ Graph   │ │Analytics│  │
│  │Components│ │ Types   │ │Supabase │ │Algorithms│ │Tracking │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Backend Services (Supabase)                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ • PostgreSQL Database (RLS enabled)                        │ │
│  │ • Authentication (Email, OAuth)                            │ │
│  │ • File Storage (Logos, exports)                            │ │
│  │ • Real-time subscriptions                                  │ │
│  │ • Edge functions                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Application Structure

The monorepo follows a clear separation of concerns:

- **`apps/web`**: Public-facing website for viewing and browsing maps
- **`apps/editor`**: Authenticated application for creating and editing maps
- **`packages/`**: Shared libraries and utilities used across applications

## Applications

### Web Viewer Application (`apps/web`)

The web viewer serves as the public interface for DocMaps, running on port 3001.

**Purpose**: Display published documentation maps with rich viewing capabilities.

**Key Features**:
- Single and multi-view map rendering
- Interactive node exploration with detail panels
- Search and filtering capabilities
- Responsive design for mobile and desktop
- Embed support for external websites
- Public gallery with featured maps

**Architecture**:
- Next.js 14 with App Router
- Server-side rendering for SEO optimization
- React Flow for interactive graph visualization
- Tailwind CSS for styling
- Supabase client for data fetching

**Key Components**:
- `SingleMapViewer`: Renders maps with a single canvas view
- `MultiMapViewer`: Handles maps with multiple interconnected views
- `NodeDetailPanel`: Shows detailed information for selected nodes
- `ViewerHeader`: Navigation and map metadata display
- Node components: `ProductNode`, `FeatureNode`, `ComponentNode`, `TextBlockNode`, `GroupNode`
- Edge components: `HierarchyEdge`, `DependencyEdge`, `AlternativeEdge`, `IntegrationEdge`, `ExtensionEdge`

### Editor Application (`apps/editor`)

The editor is the authenticated workspace for creating and managing documentation maps, running on port 3000.

**Purpose**: Provide a comprehensive editing environment for documentation maps

**Key Features**:
- Visual node-based editor with drag-and-drop interface
- Multiple node types (Product, Feature, Component, Text Block, Group)
- Various edge types for different relationships
- Multi-view map support for complex products
- Auto-layout algorithms (vertical/horizontal)
- Advanced editing tools (alignment, distribution, grouping)
- Real-time saving with optimistic updates
- Rich text editing with Tiptap
- Export capabilities (SVG)
- User authentication and profile management

**Architecture**:
- Next.js 14 with App Router
- Zustand for client-side state management
- React Flow for the interactive canvas
- Tiptap for rich text editing
- Supabase for authentication and data persistence

**Key Components**:
- `EditorCanvas`: Main React Flow canvas with custom controls
- `LeftSidebar`: Tool palette and layout controls
- `RightPanel`: Property editor for selected nodes/edges
- `EditorTopBar`: Save status, view management, and export options
- `UnifiedEditor`: Manages both single and multi-view editing modes

**State Management**:
The editor uses Zustand for lightweight state management:

```typescript
interface EditorState {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  saving: boolean;
  hasChanges: boolean;
  // State setters...
}
```

## Shared Packages

### UI Package (`@docmaps/ui`)

Provides shared React components and design system utilities.

**Exports**:
- `Logo`: Configurable logo component
- `Dialog`, `ConfirmDialog`: Modal components
- `Skeleton`: Loading state components
- Utility functions for styling and class management

### Database Package (`@docmaps/database`)

Defines TypeScript types and database client utilities.

**Key Types**:
- `Map`: Core map entity with nodes, edges, and metadata
- `ProductView`: Individual views within multi-view maps
- `Profile`: User profile information
- `NodeData`, `EdgeData`: Graph element structures
- `Database`: Complete Supabase database interface

**Node Types**:
- `product`: Main products or services (green theme)
- `feature`: Product features or capabilities (blue theme)
- `component`: Technical components (purple theme)
- `textBlock`: Rich text annotations (amber theme)
- `group`: Container for grouping related nodes

**Edge Types**:
- `hierarchy`: Parent-child relationships (solid gray)
- `dependency`: Hard dependencies (solid red, thick)
- `integration`: Integration points (solid blue)
- `alternative`: Alternative options (dashed blue)
- `extension`: Extensions or plugins (dotted purple)

### Auth Package (`@docmaps/auth`)

Handles Supabase authentication for both client and server contexts.

**Exports**:
- `createClient`: Browser-safe Supabase client
- `createServerClient`: Server-side Supabase client with cookie handling

### Graph Package (`@docmaps/graph`)

Core graph processing, layout algorithms, and export functionality.

**Layout System**:
Uses Dagre for automatic graph layout with configurable directions:
- `TB` (Top-Bottom): Vertical hierarchy layout
- `LR` (Left-Right): Horizontal flow layout

**Export System**:
Professional SVG export that recreates the exact visual appearance:
- Pixel-perfect node rendering matching React components
- Proper edge styling with arrow markers
- Embedded fonts and styling
- Configurable backgrounds and padding

**Validation**:
Input sanitization and validation utilities:
- URL validation for external links
- HTML sanitization for rich text content
- Slug generation for SEO-friendly URLs

### Analytics Package (`@docmaps/analytics`)

Event tracking and analytics integration using Vercel Analytics.

**Tracked Events**:
- User actions: sign up, map creation, publishing
- Editor interactions: node addition, layout usage, exports
- Viewer engagement: map views, node clicks, searches

### Config Package (`@docmaps/config`)

Shared configuration constants and limits.

**Limits**:
- Maximum nodes per map: 100
- Maximum edges per map: 200
- Node description length: 5,000 characters
- Map description length: 500 characters
- Tags per node: 10
- Additional links per node: 5

## Data Model & Database

### Database Schema

The system uses PostgreSQL via Supabase with Row Level Security (RLS) enabled.

**Core Tables**:

1. **`profiles`**: User profile information
   - Links to Supabase auth.users
   - Display name, bio, avatar URL
   - Auto-created on user registration

2. **`maps`**: Primary map entities
   - User ownership via foreign key
   - JSONB storage for nodes and edges
   - Status: draft/published
   - View type: single/multi
   - Metadata: view count, featured flag

3. **`product_views`**: Multi-view map content
   - Belongs to parent map
   - Individual nodes/edges per view
   - Ordered navigation structure

4. **`map_views`**: Analytics tracking
   - View event logging
   - User association (optional)
   - Timestamp tracking

### Data Flow

**Map Creation Flow**:
1. User creates map in editor
2. Nodes and edges stored as JSONB in maps table
3. Auto-save triggers on canvas changes
4. Publishing updates status and sets published_at

**Multi-View Maps**:
1. Map created with view_type='multi'
2. Individual views stored in product_views table
3. Each view has independent nodes/edges
4. Navigation managed through order_index

**View Tracking**:
1. Page load triggers view tracking
2. Anonymous and authenticated views recorded
3. Map view_count incremented via database function

### Security Model

Row Level Security policies ensure data protection:

- **Maps**: Users can only modify their own maps; published maps are publicly readable
- **Product Views**: Access controlled through parent map ownership
- **Profiles**: Public read access; users can only modify their own profile
- **Map Views**: Public insert for tracking; owners can read their map analytics

## Feature Implementation

### Visual Node Editor

The core editing experience is built on React Flow with extensive customization.

**Canvas Features**:
- Drag-and-drop node positioning
- Multi-selection with Shift+click
- Keyboard shortcuts (Delete, Escape, Cmd+S)
- Zoom controls and fit-to-view
- Grid background and minimap
- Center line guide for alignment

**Node System**:
Each node type has distinct visual styling and data structure:

- **Product Nodes**: Large cards with color bars and subtitles
- **Feature Nodes**: Medium cards with left accent borders
- **Component Nodes**: Compact cards with color indicators
- **Text Blocks**: Rich text content with Tiptap editor
- **Group Nodes**: Container nodes for organizing related elements

**Edge System**:
Connections between nodes support multiple relationship types:
- Visual styling varies by type (solid, dashed, dotted)
- Arrow markers indicate direction
- Optional labels for additional context
- Smart connection point calculation

### Multi-View Maps

Complex products can be documented using multiple interconnected views.

**Implementation**:
- Parent map defines overall structure
- Individual views stored in product_views table
- Navigation sidebar shows all views
- Cross-view references via node referTo property
- Seamless view switching with transition animations

**Use Cases**:
- API documentation with multiple endpoints
- Software architecture with different layers
- Product walkthroughs with step-by-step flows

### Auto-Layout System

Automatic graph layout using Dagre algorithm with customization for DocMaps.

**Algorithm Configuration**:
- Node dimensions calculated based on content and type
- Configurable direction (top-bottom or left-right)
- Spacing optimized for readability
- Preserves manual positioning when possible

**Implementation Details**:
```typescript
function applyLayout(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR'): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ rankdir: direction });
  
  // Add nodes with calculated dimensions
  nodes.forEach(node => {
    const { width, height } = getNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });
  
  // Add edges and run layout
  edges.forEach(edge => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  
  // Apply calculated positions
  return nodes.map(node => ({
    ...node,
    position: {
      x: dagreGraph.node(node.id).x - width / 2,
      y: dagreGraph.node(node.id).y - height / 2,
    },
  }));
}
```

### Rich Text Editing

Text blocks support rich content using Tiptap editor.

**Features**:
- Standard formatting (bold, italic, underline)
- Headings and lists
- Code blocks with syntax highlighting
- Links with validation
- Placeholder text
- Character limits with visual feedback

**Implementation**:
- Dynamic import to reduce bundle size
- HTML sanitization for security
- Configurable toolbar based on context
- Auto-save integration with debouncing

### Export System

**TRUE DOM-to-SVG Conversion** - Professional-grade SVG export that captures the exact rendered React Flow canvas.

**Revolutionary Approach**:
Instead of hardcoded conversion or partial serialization, this implementation performs **direct DOM-to-SVG conversion** of the actual rendered React Flow canvas. This is the same approach used by professional tools like Figma and ensures pixel-perfect accuracy.

**Key Features**:
- **Direct DOM Conversion**: Captures the actual rendered HTML/SVG elements from React Flow
- **Zero Hardcoding**: No predefined node dimensions or styling - everything is read from the DOM
- **Automatic Edge Capture**: Edges are already SVG elements, so they're cloned directly with all styling
- **Perfect Node Rendering**: HTML nodes are converted to SVG with exact positioning and styling
- **Viewport Awareness**: Accounts for current zoom and pan state
- **Future-Proof**: ANY changes to components automatically work without code updates

**Technical Implementation**:

```typescript
// Core DOM-to-SVG conversion process
export function exportToSVG(nodes, edges, options) {
  // 1. Find the actual React Flow DOM elements
  const flowContainer = document.querySelector('.react-flow');
  const viewport = document.querySelector('.react-flow__viewport');
  
  // 2. Get current transform state (zoom/pan)
  const transform = reactFlowInstance.getViewport();
  
  // 3. Process edges (already SVG) - direct cloning
  const allEdges = viewport.querySelectorAll('.react-flow__edge');
  allEdges.forEach(edgeElement => {
    const svgContent = edgeElement.querySelector('svg');
    // Clone SVG content directly with all paths, markers, styling
    const clonedEdge = cloneSVGElement(svgContent, svgNS);
  });
  
  // 4. Process nodes (HTML to SVG conversion)
  const allNodes = viewport.querySelectorAll('.react-flow__node');
  allNodes.forEach(nodeElement => {
    // Convert HTML structure to SVG equivalents
    // - Background divs → SVG rectangles
    // - Text elements → SVG text with computed fonts/colors
    // - Color indicators → SVG rectangles with exact colors
    // - All positioning calculated from actual DOM bounds
  });
}
```

**Why This Approach is Superior**:

1. **True Pixel-Perfect Accuracy**: Captures exactly what the user sees
2. **Zero Maintenance**: No need to update export code when components change
3. **Automatic Edge Support**: All edge types and styling work automatically
4. **Real-Time State**: Captures current selection, hover effects, dynamic colors
5. **Professional Quality**: Same approach used by industry-leading design tools

**DOM Conversion Process**:

1. **Edge Processing**: React Flow edges are already SVG elements, so they're cloned directly with all their paths, markers, and styling preserved
2. **Node Processing**: HTML node elements are converted to SVG by:
   - Reading computed styles from `window.getComputedStyle()`
   - Converting background colors/borders to SVG rectangles
   - Converting text content to SVG text elements with exact fonts
   - Converting color indicators to SVG rectangles
   - Calculating all positions from actual DOM bounding rectangles
3. **Transform Application**: Current zoom/pan state is applied to all coordinates
4. **Bounds Calculation**: SVG dimensions calculated from actual rendered content

**Output Quality**:
- Clean, optimized SVG markup
- Exact visual reproduction of the canvas
- Proper XML structure with metadata
- Professional file naming and organization
- All styling embedded for portability

This approach ensures that the SVG export is always accurate and professional, regardless of future changes to the visual components or React Flow updates.

### Search and Discovery

The web viewer provides comprehensive search and filtering capabilities.

**Search Features**:
- Real-time node highlighting
- Auto-zoom to search results
- Query persistence across navigation
- Mobile-optimized interface

**Gallery Features**:
- Featured maps promotion
- Sorting by views, date, or title
- Responsive grid layout
- Infinite scroll loading

## Implementation Details

### Technology Stack

**Frontend Framework**: Next.js 14 with App Router
- Server-side rendering for SEO
- API routes for server-side operations
- Middleware for authentication
- Static generation for performance

**Styling**: Tailwind CSS with custom design system
- Utility-first approach
- Custom color palette
- Responsive design patterns
- Dark mode support (planned)

**State Management**: 
- Zustand for client-side state (editor)
- React Query for server state (planned)
- URL state for navigation and sharing

**Graph Visualization**: React Flow
- Custom node and edge components
- Extensive customization and theming
- Performance optimizations for large graphs
- Touch and mobile support

**Rich Text**: Tiptap editor
- Extensible architecture
- Custom extensions for DocMaps
- Collaborative editing ready (planned)
- Markdown import/export (planned)

**Backend**: Supabase
- PostgreSQL with JSONB for flexible schema
- Row Level Security for data protection
- Real-time subscriptions (planned)
- Edge functions for complex operations

### Performance Optimizations

**Bundle Optimization**:
- Dynamic imports for heavy components
- Tree shaking for unused code
- Code splitting by route
- Shared package optimization

**Runtime Performance**:
- React Flow virtualization for large graphs
- Debounced auto-save to reduce API calls
- Optimistic updates for better UX
- Image optimization for logos and assets

**Database Performance**:
- Indexed queries for common operations
- JSONB indexing for node/edge searches
- Connection pooling via Supabase
- Query optimization for complex joins

### Error Handling

**Client-Side Error Handling**:
- Toast notifications for user feedback
- Graceful degradation for network issues
- Error boundaries for component failures
- Retry mechanisms for failed operations

**Server-Side Error Handling**:
- Structured error responses
- Logging and monitoring integration
- Rate limiting for API protection
- Input validation and sanitization

**Data Validation**:
- TypeScript for compile-time safety
- Runtime validation for user inputs
- Database constraints for data integrity
- Sanitization for XSS prevention

### Security Considerations

**Authentication & Authorization**:
- Supabase Auth with email and OAuth
- Row Level Security for data access
- JWT token validation
- Session management

**Data Protection**:
- Input sanitization for all user content
- HTML sanitization for rich text
- URL validation for external links
- File upload restrictions

**API Security**:
- Rate limiting on sensitive endpoints
- CORS configuration
- Environment variable protection
- Secure cookie handling

## Code Navigation

### Key Directories

**Applications**:
- `apps/web/`: Public web viewer application
  - `app/`: Next.js App Router pages and layouts
  - `components/`: React components for viewing
  - `lib/`: Utilities and helpers
- `apps/editor/`: Editor application
  - `app/`: Next.js App Router with authentication
  - `components/`: Editor-specific components
  - `lib/`: Editor utilities and state management

**Shared Packages**:
- `packages/ui/`: Shared React components
- `packages/database/`: Types and database utilities
- `packages/auth/`: Authentication helpers
- `packages/graph/`: Graph algorithms and export
- `packages/analytics/`: Event tracking
- `packages/config/`: Configuration constants

**Infrastructure**:
- `supabase/`: Database migrations and functions
- `.github/`: CI/CD workflows
- Root configuration files

### Important Files

**Core Application Files**:
- `apps/editor/app/editor/maps/[id]/page.tsx`: Main editor interface
- `apps/web/app/maps/[slug]/page.tsx`: Map viewer page
- `apps/editor/components/editors/editor-canvas.tsx`: React Flow canvas
- `apps/web/components/viewers/`: Viewer components

**Shared Functionality**:
- `packages/graph/layout/index.ts`: Auto-layout algorithms
- `packages/graph/export/svg.ts`: SVG export system
- `packages/database/types.ts`: TypeScript definitions
- `packages/auth/supabase/`: Authentication clients

**Configuration**:
- `supabase-schema.sql`: Complete database schema
- `turbo.json`: Monorepo build configuration
- `package.json`: Root dependencies and scripts

### Component Hierarchy

**Editor Application**:
```
EditorLayout
├── EditorNav (authentication, user menu)
├── UnifiedEditor
    ├── EditorCanvas (React Flow)
    ├── LeftSidebar (tools, layout controls)
    ├── RightPanel (property editor)
    ├── EditorTopBar (save, export, view management)
    └── ViewManagementPanel (multi-view controls)
```

**Web Viewer**:
```
ViewerLayout
├── ConditionalNavbar
├── SingleMapViewer | MultiMapViewer
    ├── ViewerHeader (title, metadata, export)
    ├── ReactFlow (canvas with nodes/edges)
    ├── FloatingSidebar (search, controls)
    └── NodeDetailPanel (selected node info)
```

This architecture provides a scalable foundation for visual documentation creation and consumption, with clear separation of concerns and comprehensive feature coverage for both creators and consumers of documentation maps.