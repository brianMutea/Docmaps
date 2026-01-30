import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DocMaps. Visual documentation made simple.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/maps"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Browse Maps
            </Link>
            <Link
              href="/help"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Help
            </Link>
            <Link
              href="https://docmaps-editor.vercel.app/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Create Map
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
