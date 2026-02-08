'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Error Boundary for Blog Post Pages
 * 
 * This component catches errors during blog post rendering and displays
 * a user-friendly error message with recovery options.
 * 
 * Requirements: 12.4
 */
export default function BlogPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Blog post error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              We encountered an error while loading this blog post.
            </p>
            <p className="text-sm text-gray-500">
              This could be due to a temporary issue or invalid content.
            </p>
          </div>

          {/* Development Error Details */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <summary className="cursor-pointer font-medium text-gray-900 mb-2">
                Error Details (Development Only)
              </summary>
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Error Message:
                </p>
                <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto mb-3">
                  {error.message}
                </pre>
                {error.digest && (
                  <>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Error Digest:
                    </p>
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto mb-3">
                      {error.digest}
                    </pre>
                  </>
                )}
                {error.stack && (
                  <>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Stack Trace:
                    </p>
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-64">
                      {error.stack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
