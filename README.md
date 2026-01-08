# Docmaps

> Visual maps of developer documentation - Create, edit, and publish interactive documentation architecture diagrams

Docmaps is a platform for creating visual maps of developer documentation architectures. It helps developers and technical writers visualize complex documentation structures, making it easier to understand and navigate large documentation sets.

## ✨ Features

- **🎨 Visual Canvas Editor** - Drag-and-drop interface powered by React Flow
- **📝 Rich Text Support** - Add detailed descriptions with formatting, links, and code blocks
- **🔄 Auto-Layout** - Automatically organize nodes in vertical or horizontal layouts
- **🎯 Three Node Types** - Product, Feature, and Component nodes for hierarchical organization
- **🔗 Multiple Edge Types** - Hierarchy, Related, Depends-On, and Optional relationships
- **👁️ Public Viewing** - Share published maps with anyone via unique URLs
- **🔍 Search & Filter** - Find maps by title, product name, or description
- **📊 Analytics** - Track views and engagement on your maps
- **📤 SVG Export** - Export maps as high-quality vector graphics
- **🔐 Authentication** - Secure sign-up with email or Google OAuth
- **📱 Responsive Design** - Optimized for desktop (editor requires desktop, viewer is fully responsive)

## 🏗️ Project Structure

```
docs-maps/
├── apps/
│   ├── editor/              # Map creation and editing interface (Port 3000)
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities, stores, and helpers
│   └── web/                # Public viewing interface (Port 3001)
│       ├── app/            # Next.js app router pages
│       ├── components/     # React components
│       └── lib/            # Utilities and helpers
├── packages/
│   ├── ui/                 # Shared UI components (Logo, Dialog, etc.)
│   ├── database/           # Database types and client configuration
│   └── config/             # Shared configuration and constants
├── supabase/
│   └── migrations/         # Database migration files
├── turbo.json              # Turborepo configuration
└── package.json            # Root package.json with workspaces
```

## 🚀 Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/) - High-performance build system
- **Framework**: [Next.js 14](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Re-usable component library
- **Canvas**: [React Flow](https://reactflow.dev/) - Node-based graph visualization
- **Rich Text**: [Tiptap](https://tiptap.dev/) / ReactQuill - WYSIWYG editor
- **Database**: [Supabase](https://supabase.com/) - PostgreSQL + Authentication + Storage
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management
- **Auto-Layout**: [Dagre](https://github.com/dagrejs/dagre) - Graph layout algorithm
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) - Web vitals and custom events
- **Deployment**: [Vercel](https://vercel.com/) - Serverless deployment platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com/)) - Free tier available

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/docs-maps.git
cd docs-maps
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo, including all apps and packages.

### 3. Set Up Supabase

1. Create a new project in [Supabase Dashboard](https://app.supabase.com/)
2. Go to Project Settings > API to find your credentials
3. Run the migrations in `supabase/migrations/` in order using the Supabase SQL Editor

### 4. Configure Environment Variables

Create `.env.local` files in both apps using the provided examples:

**apps/editor/.env.local**
```bash
cp apps/editor/.env.example apps/editor/.env.local
```

Then edit `apps/editor/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**apps/web/.env.local**
```bash
cp apps/web/.env.example apps/web/.env.local
```

Then edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 5. Run Development Servers

```bash
npm run dev
```

This will start both applications:
- **Editor**: http://localhost:3000
- **Web**: http://localhost:3001

## 📝 Development Commands

```bash
# Start all apps in development mode
npm run dev

# Build all apps for production
npm run build

# Lint all apps
npm run lint

# Run type checking
npx tsc --noEmit

# Clean all build artifacts
npm run clean
```

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles** - User profile information
- **maps** - Documentation maps with nodes and edges (JSONB)
- **map_views** - View tracking for analytics
- **templates** - Pre-built map templates

See `supabase-schema.sql` for the complete schema.

## 🔐 Authentication

Docmaps supports two authentication methods:

1. **Email/Password** - Traditional email and password authentication
2. **Google OAuth** - Sign in with Google account

Authentication is handled by Supabase Auth with Row Level Security (RLS) policies ensuring users can only access their own maps.

## 📦 Packages

### @docmaps/ui
Shared UI components used across both apps:
- Logo component
- Dialog components
- Skeleton loaders

### @docmaps/database
Database types and client configuration:
- TypeScript types for all database tables
- Supabase client setup

### @docmaps/config
Shared configuration and constants:
- Max nodes/edges per map
- Default colors and settings

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Configure environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically detect the Turborepo setup and deploy both apps.

### Environment Variables for Production

Make sure to set all environment variables in your Vercel project settings, updating the `NEXT_PUBLIC_APP_URL` to your production URLs.

## 🐛 Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Supabase Connection Issues

- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

### Build Errors

```bash
# Clear all node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install

# Clear Next.js cache
rm -rf apps/*/.next
npm run build
```

### TypeScript Errors

```bash
# Run type checking to see all errors
npx tsc --noEmit

# Check specific app
cd apps/editor && npx tsc --noEmit
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the amazing graph visualization library
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting and deployment

## 📧 Support

For support, email support@docmaps.com or open an issue in the GitHub repository.

---

Made with ❤️ by the Docmaps team



'Perfect now move to task 6. open and start implementing task 6 appropriately, do not bother checking requirments or design files as we are only working with task list and the context you already have of what we are building. DO NOT TERMINATE or mark a task as completed when it has not really been completed, so double check to amake sure the task requirements have been implemented'