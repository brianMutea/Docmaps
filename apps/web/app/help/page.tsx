/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import { Logo } from '@docmaps/ui';
import { 
  BookOpen, 
  Map, 
  Keyboard, 
  Lightbulb, 
  HelpCircle,
  ArrowRight,
  Home
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Logo size="md" />
              <span className="text-xl font-bold text-gray-900">DocMaps</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 mb-4 sm:mb-6">
          <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Help Center
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600">
          Everything you need to know about creating and viewing DocMaps
        </p>
      </section>

      {/* Quick Links */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Link
            href="#getting-started"
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Getting Started
                </h3>
                <p className="text-sm text-gray-600">
                  Learn how to create your first map
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <Link
            href="#editor-guide"
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Map className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Editor Guide
                </h3>
                <p className="text-sm text-gray-600">
                  Master the canvas editor tools
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </Link>

          <Link
            href="#keyboard-shortcuts"
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Keyboard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Keyboard Shortcuts
                </h3>
                <p className="text-sm text-gray-600">
                  Work faster with shortcuts
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </Link>

          <Link
            href="#best-practices"
            className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                  Best Practices
                </h3>
                <p className="text-sm text-gray-600">
                  Tips for creating great maps
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Getting Started */}
        <div id="getting-started" className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Getting Started</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">1. Create an Account</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Sign up with your email or use Google OAuth to get started. Once signed in, you&apos;ll be redirected to your dashboard.
              </p>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">2. Create Your First Map</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Click "Create New Map" from your dashboard. Fill in the basic information:
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-1 ml-2 sm:ml-4">
                <li>Map Title: A descriptive name for your map</li>
                <li>Product Name: The product or project being documented</li>
                <li>Product URL: Link to the official documentation (optional)</li>
                <li>Description: Brief overview of what the map covers</li>
                <li>Slug: URL-friendly identifier (auto-generated)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Add Nodes</h3>
              <p className="text-gray-600 mb-2">
                Use the left sidebar to add three types of nodes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li><strong>Product Node</strong> (Green): Top-level products or services</li>
                <li><strong>Feature Node</strong> (Blue): Major features or capabilities</li>
                <li><strong>Component Node</strong> (Purple): Individual components or modules</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Connect Nodes</h3>
              <p className="text-gray-600 mb-2">
                Click and drag from one node&apos;s handle to another to create connections. This shows relationships and hierarchy.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Publish Your Map</h3>
              <p className="text-gray-600 mb-2">
                When ready, toggle the &quot;Published&quot; switch in the top bar to make your map public. Anyone with the link can view it.
              </p>
            </div>
          </div>
        </div>

        {/* Editor Guide */}
        <div id="editor-guide" className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Map className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Editor Guide</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Canvas Controls</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Pan: Click and drag on empty canvas space</li>
                <li>Zoom: Use mouse wheel or zoom controls</li>
                <li>Select: Click on any node or edge</li>
                <li>Multi-select: Hold Shift and click multiple items</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Node Editing</h3>
              <p className="text-gray-600 mb-2">
                Click a node to open the details panel on the right. You can edit:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Label: Node display name (max 60 characters)</li>
                <li>Description: Rich text content with formatting</li>
                <li>Icon: Emoji or symbol (max 2 characters)</li>
                <li>Color: Custom color picker</li>
                <li>Links: Documentation URLs and additional resources</li>
                <li>Tags: Categorization labels (max 10)</li>
                <li>Status: Stable, Beta, Deprecated, or Experimental</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Auto-Layout</h3>
              <p className="text-gray-600 mb-2">
                Use the auto-layout buttons in the left sidebar to automatically organize your nodes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Vertical Layout: Top-to-bottom hierarchy</li>
                <li>Horizontal Layout: Left-to-right flow</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">View Options</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Grid: Toggle background grid for alignment</li>
                <li>Mini Map: Show/hide overview map</li>
                <li>Preview: See how your map looks to viewers</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Saving</h3>
              <p className="text-gray-600 mb-2">
                Your map auto-saves every 30 seconds. You can also manually save with Cmd/Ctrl+S or the Save button.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div id="keyboard-shortcuts" className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900 font-medium">Save</span>
              <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                ⌘/Ctrl + S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900 font-medium">Delete Selected</span>
              <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                Delete
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900 font-medium">Deselect All</span>
              <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                Esc
              </kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-900 font-medium">Zoom In/Out</span>
              <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                Mouse Wheel
              </kbd>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div id="best-practices" className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Best Practices</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Keep It Simple</h3>
              <p className="text-gray-600">
                Focus on the most important concepts. Too many nodes can overwhelm viewers. Aim for 10-30 nodes per map.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Use Clear Labels</h3>
              <p className="text-gray-600">
                Node labels should be concise and descriptive. Avoid abbreviations unless they&apos;re widely known.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Rich Descriptions</h3>
              <p className="text-gray-600">
                Use the description field to provide context, examples, and links to detailed documentation.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Organize Hierarchically</h3>
              <p className="text-gray-600">
                Use Product nodes for top-level concepts, Feature nodes for major capabilities, and Component nodes for specific implementations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Link to Documentation</h3>
              <p className="text-gray-600">
                Always include links to official documentation. This makes your map a jumping-off point for deeper learning.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Use Status Indicators</h3>
              <p className="text-gray-600">
                Mark nodes as Beta, Deprecated, or Experimental to help users understand the maturity of features.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I make my map private?
              </h3>
              <p className="text-gray-600">
                Yes! Maps are private (draft) by default. Only you can see them until you toggle the &quot;Published&quot; switch.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How many maps can I create?
              </h3>
              <p className="text-gray-600">
                There's no limit! Create as many maps as you need.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I duplicate an existing map?
              </h3>
              <p className="text-gray-600">
                Yes! Use the &quot;Duplicate&quot; option in your dashboard to create a copy of any map.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I export my map?
              </h3>
              <p className="text-gray-600">
                Yes! Use the &quot;Export SVG&quot; button in the editor to download your map as a high-quality vector image.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I embed a map on my website?
              </h3>
              <p className="text-gray-600">
                Yes! Published maps have an &quot;Embed&quot; button that provides iframe code for embedding.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is DocMaps free to use?
              </h3>
              <p className="text-gray-600">
                Yes! DocMaps is completely free to use for creating and viewing maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 DocMaps. Visual maps of developer documentation.</p>
            <p className="mt-2">
              Need more help?{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-500">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
