# Development Guide

## Getting Started

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all dependencies for the monorepo and link workspace packages.

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` in both `apps/editor` and `apps/web`
   - Fill in your Supabase credentials (see SUPABASE_SETUP.md)

3. **Set up database:**
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Execute the SQL schema in your Supabase project

### Running the Apps

**Development mode (both apps):**
```bash
npm run dev
```

**Individual apps:**
```bash
# Editor app (port 3000)
cd apps/editor && npm run dev

# Web app (port 3001)
cd apps/web && npm run dev
```

### Building

```bash
# Build all apps
npm run build

# Build individual app
cd apps/editor && npm run build
```

## Monorepo Structure

```
docs-maps/
├── apps/
│   ├── editor/          # Map editor (localhost:3000)
│   └── web/             # Public viewer (localhost:3001)
├── packages/
│   ├── ui/              # Shared UI components
│   ├── database/        # Database types & client
│   └── config/          # Shared configuration
└── package.json         # Root workspace config
```

## Troubleshooting

### TypeScript Errors in IDE

If you see TypeScript errors in your IDE but the code compiles fine:

1. **Restart TypeScript Server:**
   - VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
   - Other IDEs: Restart the IDE or reload the window

2. **Verify compilation works:**
   ```bash
   # Check UI package
   npx tsc --noEmit --project packages/ui/tsconfig.json
   
   # Check database package
   npx tsc --noEmit --project packages/database/tsconfig.json
   
   # Check editor app
   cd apps/editor && npx tsc --noEmit
   ```

3. **Clear caches:**
   ```bash
   # Remove all build artifacts
   rm -rf .next .turbo node_modules/.cache
   
   # Reinstall if needed
   rm -rf node_modules package-lock.json
   npm install
   ```

### Module Resolution Issues

If imports from `@docmaps/*` packages don't resolve:

1. Ensure you ran `npm install` from the root
2. Check that `node_modules/@docmaps/` symlinks exist
3. Restart your IDE

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

## Code Quality

### Linting

```bash
# Lint all packages
npm run lint

# Lint specific app
cd apps/editor && npm run lint
```

### Type Checking

```bash
# Type check all packages
npx turbo run type-check

# Type check specific package
cd packages/ui && npx tsc --noEmit
```

## Adding Dependencies

### To a specific app:
```bash
cd apps/editor
npm install <package-name>
```

### To a shared package:
```bash
cd packages/ui
npm install <package-name>
```

### To the root (dev tools):
```bash
npm install -D <package-name> -w root
```

## Common Tasks

### Adding a new shared component:
1. Create component in `packages/ui/components/`
2. Export from `packages/ui/index.tsx`
3. Use in apps: `import { Component } from '@docmaps/ui'`

### Adding a new database type:
1. Add type to `packages/database/types.ts`
2. Export from `packages/database/index.ts`
3. Use in apps: `import { Type } from '@docmaps/database'`

### Updating Supabase schema:
1. Update `supabase-schema.sql`
2. Run the updated SQL in Supabase SQL Editor
3. Update types in `packages/database/types.ts`

## Performance

### Build times:
- First build: ~30-60 seconds
- Incremental builds: ~5-10 seconds (thanks to Turbo cache)

### Development server startup:
- Editor: ~3-5 seconds
- Web: ~3-5 seconds

## Next Steps

After setup, you can:
1. Start implementing authentication (Task 4)
2. Build the editor dashboard (Task 5)
3. Create the map creation flow (Task 6)

See `tasks.md` for the full implementation plan.
