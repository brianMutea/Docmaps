import Link from 'next/link';
import { Rss } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-neutral-900 border-t border-neutral-800">
      {/* Subtle grid pattern - same as DarkHero */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="footer-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="rgb(148, 163, 184)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} DocMaps. Visual documentation made simple.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/maps"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Browse Maps
            </Link>
            <Link
              href="/blog"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/help"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Help
            </Link>
            <Link
              href="https://docmaps-editor.vercel.app/"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Contribute
            </Link>
            <Link
              href="/feed.xml"
              className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1"
              title="RSS Feed"
            >
              <Rss className="h-4 w-4" />
              <span className="sr-only">RSS Feed</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
