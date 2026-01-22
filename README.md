# DocMaps

> A visual documentation platform for creating interactive maps of software products, frameworks, and APIs.

[![CI](https://github.com/yourusername/docs-maps/workflows/CI/badge.svg)](https://github.com/yourusername/docs-maps/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ Features

- **🎨 Visual Node Editor**: Intuitive drag-and-drop interface for creating documentation maps
- **🧩 Multiple Node Types**: Products, Features, Components, and Text Blocks with rich customization
- **🔗 Smart Connections**: Various edge types (hierarchy, dependency, integration, alternative, extension)
- **👁️ Multi-View Support**: Create multiple interconnected views for complex products
- **⚡ Real-time Collaboration**: Share and collaborate on documentation maps with team members
- **📤 Export Options**: Export maps as SVG/PNG or embed them in websites
- **🌍 Public Gallery**: Browse and discover community-created maps
- **🎯 Advanced Features**: Grouping, alignment, auto-layout, undo/redo, keyboard shortcuts

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Supabase** account ([Sign up](https://supabase.com/))

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/docs-maps.git
cd docs-maps
npm install
```

### 2. Environment Setup

```bash
# Copy environment templates
cp apps/web/.env.example apps/web/.env.local
cp apps/editor/.env.example apps/editor/.env.local

# Edit the .env.local files with your Supabase credentials
```

### 3. Database Setup

```bash
# Run Supabase migrations
npx supabase db reset

# Or manually run migrations from supabase/migrations/
```

### 4. Start Development

```bash
npm run dev
```

🎉 **You're ready!**
- **Web App**: http://localhost:3001 (Public maps and gallery)
- **Editor**: http://localhost:3000 (Map creation and editing)

## 🏗️ Architecture

### Monorepo Structure

```
docs-maps/
├── 📱 apps/
│   ├── web/              # Public website & map viewer (Port 3001)
│   │   ├── app/          # Next.js 14 App Router
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   └── editor/           # Map editor application (Port 3000)
│       ├── app/          # Next.js 14 App Router
│       ├── components/   # Editor-specific components
│       └── lib/          # Editor utilities
├── 📦 packages/
│   ├── ui/               # Shared UI components & design system
│   ├── database/         # Database types & client utilities
│   ├── auth/             # Supabase authentication
│   ├── graph/            # Graph processing, layout & algorithms
│   ├── analytics/        # Event tracking & analytics
│   └── config/           # Shared configuration & constants
├── 🗄️ supabase/
│   ├── migrations/       # Database schema migrations
│   └── functions/        # Edge functions
└── 📋 Configuration files
```

### Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Modern React framework with App Router |
| **Styling** | Tailwind CSS, Radix UI | Utility-first CSS with accessible components |
| **Backend** | Supabase | PostgreSQL database, authentication, storage |
| **Graph Engine** | React Flow | Interactive node-based editor |
| **Rich Text** | Tiptap, highlight.js | Rich text editing with syntax highlighting |
| **Layout** | Dagre | Automatic graph layout algorithms |
| **Build System** | Turborepo | Monorepo build orchestration |
| **Deployment** | Vercel | Serverless deployment platform |

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start all apps in development mode
npm run dev:web      # Start web app only (Port 3001)
npm run dev:editor   # Start editor app only (Port 3000)

# Building
npm run build        # Build all apps and packages
npm run build:web    # Build web app only
npm run build:editor # Build editor app only

# Code Quality
npm run lint         # Lint all packages
npm run lint:fix     # Fix linting issues
npm run typecheck    # TypeScript type checking
npm run format       # Format code with Prettier

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Utilities
npm run clean        # Clean build artifacts
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

### Code Style & Standards

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Configured with React, TypeScript, and accessibility rules
- **Prettier**: Consistent code formatting across the project
- **Husky**: Pre-commit hooks for linting and formatting
- **Conventional Commits**: Standardized commit message format

### Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profile information |
| `maps` | Documentation maps with nodes/edges (JSONB) |
| `product_views` | Multi-view map views for complex products |
| `map_views` | Analytics tracking for map views |

See `supabase-schema.sql` for complete schema and `supabase/migrations/` for migration history.

### Database Migrations

```bash
# Create a new migration
./supabase/create-migration.sh "add_new_feature"

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import project in Vercel**
3. **Configure environment variables**
4. **Deploy**

Vercel auto-detects Turborepo and deploys both apps with proper routing.

### Manual Deployment

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t docs-maps .
docker run -p 3000:3000 -p 3001:3001 docs-maps
```

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/docs-maps.git
cd docs-maps
git checkout -b feature/your-feature-name
```

### 2. Development Setup

Follow the [Quick Start](#-quick-start) guide to set up your development environment.

### 3. Make Changes

- Write tests for new features
- Follow existing code patterns
- Update documentation as needed
- Ensure all tests pass

### 4. Submit PR

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

### Contribution Guidelines

- **Code Style**: Follow existing patterns and use provided linting rules
- **Commits**: Use [Conventional Commits](https://conventionalcommits.org/)
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update relevant documentation
- **Performance**: Consider performance implications of changes

### Good First Issues

Look for issues labeled `good first issue` to get started contributing.

## 📚 Documentation

- **[Supabase Setup](./SUPABASE_SETUP.md)** - Database configuration guide
- **[Migrations Guide](./MIGRATIONS.md)** - Database migration instructions
- **[Logo Setup](./packages/config/LOGO_SETUP.md)** - Logo upload configuration
- **[Contributing Guide](./CONTRIBUTING.md)** - Detailed contribution guidelines

## 🐛 Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
# Kill processes on ports 3000/3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
rm -rf apps/*/.next
npm run build
```

**Database Connection:**
```bash
# Check Supabase credentials in .env.local
# Verify database is running and accessible
# Run migrations if schema is outdated
```

### Performance Optimization

For large maps (100+ nodes):
- Enable virtual rendering in React Flow
- Use React Query for server state caching
- Implement dynamic imports for heavy components

### Getting Help

- 📖 Check the [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/yourusername/docs-maps/issues)
- 💬 [Join Discussions](https://github.com/yourusername/docs-maps/discussions)
- 📧 Email: brianmuteak@gmail.com

## 🔮 Roadmap

### Upcoming Features
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Map versioning and history
- [ ] Team workspaces
- [ ] Custom node types and colors
- [ ] Map templates marketplace
- [ ] API for programmatic map creation
- [ ] Keyboard navigation in viewer

### Performance Improvements
- [ ] Virtual rendering for large maps
- [ ] React Query integration
- [ ] Bundle size optimization
- [ ] Service worker for offline viewing

### Developer Experience
- [ ] Storybook for component documentation
- [ ] Comprehensive E2E tests with Playwright
- [ ] Stricter TypeScript configuration
- [ ] Pre-commit hooks with Husky

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) - For the excellent graph visualization library
- [Supabase](https://supabase.com/) - For the backend infrastructure
- [Vercel](https://vercel.com/) - For seamless deployment
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Tiptap](https://tiptap.dev/) - For the rich text editing capabilities

---

<div align="center">

**[🌐 Website](https://docmaps.io)** • **[📝 Editor](https://editor.docmaps.io)** • **[📚 Docs](./docs/)** • **[🐛 Issues](https://github.com/yourusername/docs-maps/issues)**

Made with ❤️ by the DocMaps team

</div>
