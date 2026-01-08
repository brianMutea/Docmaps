import Link from 'next/link';
import { Logo } from '@docmaps/ui';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Map Not Found</h2>
        <p className="text-gray-600 mb-8">
          The map you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse All Maps
          </Link>
          <Link
            href="https://docmaps-editor.vercel.app/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Create a Map
          </Link>
        </div>
      </div>
    </div>
  );
}
