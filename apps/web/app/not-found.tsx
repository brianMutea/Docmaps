'use client';

import Link from 'next/link';
import { Logo } from '@docmaps/ui';
import { Search, ArrowLeft, Map, Sparkles, ExternalLink } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>

        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 transform -rotate-6">
            <Map className="h-16 w-16 text-white" />
          </div>
          <div className="absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg transform rotate-12">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-600 text-sm font-semibold">
            404
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Map Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
          The map you&apos;re looking for doesn&apos;t exist or has been removed by its creator.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/maps"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
          >
            <Search className="h-4 w-4" />
            Browse All Maps
          </Link>
          <Link
            href="https://docmaps-editor.vercel.app/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Create a Map
          </Link>
        </div>

        {/* Go Back */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back to previous page
        </button>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-400">
          Think this is a mistake?{' '}
          <a href="mailto:support@docmaps.io" className="text-blue-600 hover:text-blue-700 font-medium">
            Let us know
          </a>
        </p>
      </div>
    </div>
  );
}
