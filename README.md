# DocMaps

> Visual documentation architecture maps for developers

DocMaps is a platform for creating interactive visual maps of documentation architectures. It helps developers and technical writers visualize complex documentation structures, making it easier to understand and navigate large documentation sets.

## Features

- **Visual Canvas Editor** - Drag-and-drop interface powered by React Flow
- **Single & Multi-View Maps** - Create simple maps or complex multi-view documentation
- **Rich Text Descriptions** - Add detailed content with code syntax highlighting
- **Auto-Layout** - Automatically organize nodes using Dagre graph algorithms
- **Three Node Types** - Product, Feature, and Component nodes for hierarchy
- **Multiple Edge Types** - Hierarchy, Related, Depends-On, and Optional relationships
- **Logo Upload** - Custom product/company logos for maps
- **Public Sharing** - Share published maps via unique URLs
- **Embeddable** - Embed maps in external websites via iframe
- **SVG Export** - Export maps as high-quality vector graphics
- **Analytics** - Track views and engagement

## Architecture

```
docs-maps/
├── apps/
│   ├── editor/          # Map creation & editing (Port 3000)
│   └── web/             # Public viewing interface (Port 3001)
├── packages/
│   ├── ui/              # Shared UI components
│   ├── database/        # Database types & client
│   └── config/          # Shared configuration
└── supabase/
    └── migrations/      # Database migrations
```

### Apps

| App | Port | Purpose |
|-----|------|---------|
| `editor` | 3000 | Authenticated map creation, editing, dashboard |
| `web` | 3001 | Public map viewing, browsing, embedding |

### Packages

| Package | Purpose |
|---------|---------|
| `@docmaps/ui` | Logo, Dialog, ConfirmDialog, Skeleton components |
| `@docmaps/database` | TypeScript types, Supabase client configuration |
| `@docmaps/config` | Constants, limits, shared configuration |

## Tech Stack

| Category | Technology |
|----------|------------|
| Monorepo | [Turborepo](https://turbo.build/) |
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Canvas | [React Flow](https://reactflow.dev/) |
| Rich Text | [Tiptap](https://tiptap.dev/) with [highlight.js](https://highlightjs.org/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| Layout | [Dagre](https://github.com/dagrejs/dagre) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |
| Deployment | [Vercel](https://vercel.com/) |

### Key Libraries

- **React Flow** - Node-based graph visualization with pan, zoom, and connections
- **Tiptap** - Headless rich text editor framework
- **highlight.js / lowlight** - Syntax highlighting for code blocks in descriptions
- **Dagre** - Directed graph layout algorithm for auto-arranging nodes
- **html-to-image** - SVG/PNG export functionality
- **date-fns** - Date formatting utilities
- **Sonner** - Toast notifications
- **Radix UI** - Accessible dialog primitives

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/docs-maps.git
cd docs-maps

# Install dependencies
npm install

# Copy environment files
cp apps/editor/.env.example apps/editor/.env.local
cp apps/web/.env.example apps/web/.env.local
```

### Environment Variables

**apps/editor/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEB_URL=http://localhost:3001
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Database Setup

1. Create a Supabase project
2. Run migrations in `supabase/migrations/` in order via SQL Editor
3. Create a `logos` storage bucket (public) for logo uploads

### Development

```bash
# Start both apps
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run typecheck

# Clean build artifacts
npm run clean
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profile information |
| `maps` | Documentation maps with nodes/edges (JSONB) |
| `map_views` | Multi-view map views |
| `templates` | Pre-built map templates |

See `supabase-schema.sql` for complete schema.

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

Vercel auto-detects Turborepo and deploys both apps.

## Future Improvements

### Performance
- [ ] Implement virtual rendering for large maps (100+ nodes)
- [ ] Add React Query for server state caching
- [ ] Optimize bundle size with dynamic imports for heavy components
- [ ] Add service worker for offline viewing

### Architecture
- [ ] Extract shared node components to `@docmaps/ui` package
- [ ] Create shared hooks package for common logic
- [ ] Implement proper error boundaries per feature
- [ ] Add comprehensive E2E tests with Playwright

### Features
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Map versioning and history
- [ ] Team workspaces
- [ ] Custom node types and colors
- [ ] Map templates marketplace
- [ ] API for programmatic map creation
- [ ] Keyboard navigation in viewer

### Code Quality
- [ ] Add Storybook for component documentation
- [ ] Implement stricter ESLint rules
- [ ] Add pre-commit hooks with Husky
- [ ] Improve TypeScript strictness

## Troubleshooting

### Port in use
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Build errors
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
rm -rf apps/*/.next
npm run build
```

## License

MIT - see [LICENSE](LICENSE)

## Support

Email: brianmuteak@gmail.com
