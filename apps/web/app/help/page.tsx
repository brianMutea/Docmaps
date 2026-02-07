/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import {
  BookOpen,
  Map,
  Keyboard,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-900">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="help-grid"
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
            <rect width="100%" height="100%" fill="url(#help-grid)" />
          </svg>
        </div>

        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-primary-500/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-info-500/10 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/50 border border-primary-800/50 text-primary-400 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Documentation & Guides
          </div>

          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/20">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto">
            Everything you need to know about creating and viewing DocMaps
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          <Link
            href="#getting-started"
            className="group bg-neutral-800 rounded-2xl border border-neutral-700 p-6 hover:shadow-xl hover:shadow-neutral-900/50 hover:border-primary-600 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-primary-800/50">
                <BookOpen className="h-7 w-7 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">Getting Started</h3>
                <p className="text-sm text-neutral-400">Learn how to create your first map</p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>

          <Link
            href="#editor-guide"
            className="group bg-neutral-800 rounded-2xl border border-neutral-700 p-6 hover:shadow-xl hover:shadow-neutral-900/50 hover:border-success-600 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-success-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-success-800/50">
                <Map className="h-7 w-7 text-success-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-success-400 transition-colors">Editor Guide</h3>
                <p className="text-sm text-neutral-400">Master the canvas editor tools</p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-success-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>

          <Link
            href="#keyboard-shortcuts"
            className="group bg-neutral-800 rounded-2xl border border-neutral-700 p-6 hover:shadow-xl hover:shadow-neutral-900/50 hover:border-info-600 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-info-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-info-800/50">
                <Keyboard className="h-7 w-7 text-info-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-info-400 transition-colors">Keyboard Shortcuts</h3>
                <p className="text-sm text-neutral-400">Work faster with shortcuts</p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-info-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>

          <Link
            href="#best-practices"
            className="group bg-neutral-800 rounded-2xl border border-neutral-700 p-6 hover:shadow-xl hover:shadow-neutral-900/50 hover:border-warning-600 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-warning-900/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-warning-800/50">
                <Lightbulb className="h-7 w-7 text-warning-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-warning-400 transition-colors">Best Practices</h3>
                <p className="text-sm text-neutral-400">Tips for creating great maps</p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-warning-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>
        </div>

        {/* Getting Started */}
        <div id="getting-started" className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-700 bg-gradient-to-r from-primary-900/30 to-primary-800/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-900/50 flex items-center justify-center border border-primary-800/50">
                <BookOpen className="h-5 w-5 text-primary-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Getting Started</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/20">1</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-white mb-2">Create an Account</h3>
                <p className="text-neutral-300">Sign up with your email or use Google OAuth to get started. Once signed in, you'll be redirected to your dashboard.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/20">2</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-white mb-2">Create Your First Map</h3>
                <p className="text-neutral-300 mb-2">Click "Create Map" from your dashboard. Fill in the basic information:</p>
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" /><span>Map Title: A descriptive name for your map</span></li>
                  <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" /><span>Product Name: The product or project being documented</span></li>
                  <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" /><span>Product URL: Link to the official documentation (optional)</span></li>
                  <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" /><span>Description: Brief overview of what the map covers</span></li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/20">3</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-white mb-2">Add Nodes</h3>
                <p className="text-neutral-300 mb-2">Use the left sidebar to add three types of nodes:</p>
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" /><span>Product Node (Green): Top-level products or services</span></li>
                  <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" /><span>Feature Node (Blue): Major features or capabilities</span></li>
                  <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" /><span>Component Node (Purple): Individual components or modules</span></li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/20">4</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-white mb-2">Connect Nodes</h3>
                <p className="text-neutral-300">Click and drag from one node's handle to another to create connections. This shows relationships and hierarchy.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary-500/20">5</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-white mb-2">Publish Your Map</h3>
                <p className="text-neutral-300">When ready, toggle the "Published" switch in the top bar to make your map public. Anyone with the link can view it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Guide */}
        <div id="editor-guide" className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-700 bg-gradient-to-r from-success-900/30 to-success-800/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success-900/50 flex items-center justify-center border border-success-800/50">
                <Map className="h-5 w-5 text-success-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Editor Guide</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400" />Canvas Controls
              </h3>
              <ul className="space-y-1.5 ml-1">
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Pan: Click and drag on empty canvas space</span></li>
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Zoom: Use mouse wheel or zoom controls</span></li>
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Select: Click on any node or edge</span></li>
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Multi-select: Hold Shift and click multiple items</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400" />Node Editing
              </h3>
              <p className="text-neutral-300 mb-2">Click a node to open the details panel on the right. You can edit:</p>
              <ul className="space-y-1.5 ml-1">
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Label: Node display name (max 60 characters)</span></li>
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Description: Rich text content with formatting</span></li>
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Icon: Emoji or symbol (max 2 characters)</span></li>
                <li className="flex items-start gap-2 text-neutral-300"><ChevronRight className="h-4 w-4 text-success-400 mt-0.5 flex-shrink-0" /><span>Status: Stable, Beta, Deprecated, or Experimental</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400" />Saving
              </h3>
              <p className="text-neutral-300">Your map auto-saves every 30 seconds. You can also manually save with Cmd/Ctrl+S or the Save button.</p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div id="keyboard-shortcuts" className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-700 bg-gradient-to-r from-info-900/30 to-info-800/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-info-900/50 flex items-center justify-center border border-info-800/50">
                <Keyboard className="h-5 w-5 text-info-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Keyboard Shortcuts</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-xl border border-neutral-600">
                <span className="text-white font-medium">Save</span>
                <kbd className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm font-mono text-neutral-300 shadow-sm">⌘/Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-xl border border-neutral-600">
                <span className="text-white font-medium">Delete Selected</span>
                <kbd className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm font-mono text-neutral-300 shadow-sm">Delete</kbd>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-xl border border-neutral-600">
                <span className="text-white font-medium">Deselect All</span>
                <kbd className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm font-mono text-neutral-300 shadow-sm">Esc</kbd>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-xl border border-neutral-600">
                <span className="text-white font-medium">Zoom In/Out</span>
                <kbd className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm font-mono text-neutral-300 shadow-sm">Mouse Wheel</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div id="best-practices" className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-700 bg-gradient-to-r from-warning-900/30 to-warning-800/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning-900/50 flex items-center justify-center border border-warning-800/50">
                <Lightbulb className="h-5 w-5 text-warning-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Best Practices</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-warning-900/20 rounded-xl border border-warning-800/30">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning-400" />Keep It Simple
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">Focus on the most important concepts. Too many nodes can overwhelm viewers. Aim for 10-30 nodes per map.</p>
              </div>
              <div className="p-5 bg-warning-900/20 rounded-xl border border-warning-800/30">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning-400" />Use Clear Labels
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">Node labels should be concise and descriptive. Avoid abbreviations unless they're widely known.</p>
              </div>
              <div className="p-5 bg-warning-900/20 rounded-xl border border-warning-800/30">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning-400" />Add Rich Descriptions
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">Use the description field to provide context, examples, and links to detailed documentation.</p>
              </div>
              <div className="p-5 bg-warning-900/20 rounded-xl border border-warning-800/30">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning-400" />Link to Documentation
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">Always include links to official documentation. This makes your map a jumping-off point for deeper learning.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-neutral-700 bg-gradient-to-r from-neutral-800 to-neutral-700/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-700 flex items-center justify-center border border-neutral-600">
                <MessageCircle className="h-5 w-5 text-neutral-300" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="pb-6 border-b border-neutral-700">
              <h3 className="text-base font-semibold text-white mb-2">Can I make my map private?</h3>
              <p className="text-neutral-300">Yes! Maps are private (draft) by default. Only you can see them until you toggle the "Published" switch.</p>
            </div>
            <div className="pb-6 border-b border-neutral-700">
              <h3 className="text-base font-semibold text-white mb-2">How many maps can I create?</h3>
              <p className="text-neutral-300">There's no limit! Create as many maps as you need.</p>
            </div>
            <div className="pb-6 border-b border-neutral-700">
              <h3 className="text-base font-semibold text-white mb-2">Can I duplicate an existing map?</h3>
              <p className="text-neutral-300">Yes! Use the "Duplicate" option in your dashboard to create a copy of any map.</p>
            </div>
            <div className="pb-6 border-b border-neutral-700">
              <h3 className="text-base font-semibold text-white mb-2">Can I embed a map on my website?</h3>
              <p className="text-neutral-300">Yes! Published maps have an "Embed" button that provides iframe code for embedding.</p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Is DocMaps free to use?</h3>
              <p className="text-neutral-300">Yes! DocMaps is completely free to use for creating and viewing maps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-neutral-900 border-t border-neutral-800 mt-16">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="help-footer-grid"
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
            <rect width="100%" height="100%" fill="url(#help-footer-grid)" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-neutral-400">
            <p>© {new Date().getFullYear()} DocMaps. Visual architectural maps of developer documentation.</p>
            <p className="mt-2">
              Need more help?{' '}
              <Link href="mailto:brianmuteak@gmail.com" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
