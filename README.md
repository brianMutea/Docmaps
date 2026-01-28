# DocMaps

DocMaps is an experimental portfolio project exploring visual architecture mapping for complex developer documentation. It presents documentation as interactive, node-based diagrams to help teams quickly understand product structure and component relationships before diving into implementation details.


## What is DocMaps?

With the DocMaps editor you can map complex software documentation into visual, interactive maps. Rather than navigating text-heavy pages, users explore node-based diagrams that show how products, features, and components relate.

## When DocMaps Works Best

DocMaps is designed for platforms with a clear product structure and meaningful component relationships. It is **not** intended for documentation that is primarily task-based, tutorial-heavy, or lacks a coherent hierarchy.

DocMaps is **not a replacement** for official documentation. It is intended to complement existing docs by providing a high-level architectural view.

Well-suited documentation types include (Examples):

- **Cloud Platforms & Infrastructure**  
  Map services across platforms like AWS, Azure, and GCP to understand infrastructure components, deployment models, and integrations.

- **Databases & Data Platforms**  
  Visualize databases and data systems, including indexing, query engines, replication, and deployment options.

- **Developer Platforms & APIs**  
  Map Backend-as-a-Service platforms, API management tools, authentication systems, and their integration points.

- **AI / ML Platforms**  
  Understand ML and LLM platforms by visualizing training, serving, orchestration, and monitoring components.

- **Payments & FinTech**  
  Explore payment platforms and financial infrastructure, including billing, subscriptions, and fraud detection systems.

- **Security & DevOps**  
  Map CI/CD pipelines, security tools, monitoring systems, and observability layers.

- **Multi-Product Platforms**  
  Platforms offering multiple interconnected products (e.g., Stripe, Twilio, Firebase) where understanding scope and relationships is critical before implementation.

## Key Features

- **Visual Editor**: Drag-and-drop interface for creating documentation maps
- **Multiple Node Types**: Products, Features, Components, and Text Blocks
- **Smart Connections**: Different edge types for various relationships
- **Multi-View Maps**: Create interconnected views for complex products
- **Export & Embed**: SVG export and website embedding
- **Public Gallery**: Share and discover community maps

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
git clone https://github.com/yourusername/docs-maps.git
cd docs-maps
npm install
```

### Environment Setup

1. Copy environment templates:
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/editor/.env.example apps/editor/.env.local
```

2. Configure your Supabase credentials in the `.env.local` files

3. Set up the database:
```bash
npx supabase db reset
```

### Development

```bash
npm run dev
```

This starts both applications:
- **Web Viewer**: http://localhost:3001 (public maps)
- **Editor**: http://localhost:3000 (map creation)

## How It Works

DocMaps consists of two main applications:

1. **Editor** (`localhost:3000`): Authenticated workspace for creating and managing maps
2. **Web Viewer** (`localhost:3001`): Public interface for viewing and sharing published maps

The platform uses a visual node-based approach where:
- **Nodes** represent different elements (products, features, components)
- **Edges** show relationships between elements
- **Views** organize complex documentation into manageable sections

## Project Structure

This is a TypeScript monorepo built with Turborepo:

```
docs-maps/
├── apps/
│   ├── web/          # Public map viewer
│   └── editor/       # Map creation interface
├── packages/
│   ├── ui/           # Shared components
│   ├── database/     # Database types and utilities
│   ├── auth/         # Authentication
│   ├── graph/        # Graph algorithms and export
│   └── config/       # Shared configuration
└── supabase/         # Database migrations
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Graph Visualization**: React Flow
- **Build System**: Turborepo
- **Rich Text**: Tiptap

## Available Scripts

```bash
# Development
npm run dev          # Start both applications
npm run build        # Build all applications
npm run lint         # Lint all packages
npm run typecheck    # TypeScript checking

# Individual apps
npm run dev:web      # Start web viewer only
npm run dev:editor   # Start editor only
```

## Environment Configuration

### Editor App (`apps/editor/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEB_URL=http://localhost:3001
```

### Web App (`apps/web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Database Setup

The project uses Supabase with PostgreSQL. Key tables:

- `maps`: Documentation maps with JSONB node/edge data
- `product_views`: Multi-view map content
- `profiles`: User information
- `map_views`: Analytics tracking

Run migrations:
```bash
npx supabase db reset
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Commit using conventional commits: `git commit -m "feat: add new feature"`
5. Push and create a Pull Request

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Documentation

- [Architecture Documentation](./ARCHITECTURE.md) - Technical implementation details
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration
- [Migration Guide](./MIGRATIONS.md) - Database migrations
