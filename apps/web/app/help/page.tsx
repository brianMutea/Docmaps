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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Documentation & Guides
          </div>

          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about creating and viewing DocMaps
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          <Link
            href="#getting-started"
            className="group bg-white rounded-2xl border border-gray-200/80 p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-blue-200 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Getting Started</h3>
                <p className="text-sm text-gray-500">Learn how to create your first map</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>

          <Link
            href="#editor-guide"
            className="group bg-white rounded-2xl border border-gray-200/80 p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-emerald-200 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Map className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">Editor Guide</h3>
                <p className="text-sm text-gray-500">Master the canvas editor tools</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>

          <Link
            href="#keyboard-shortcuts"
            className="group bg-white rounded-2xl border border-gray-200/80 p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-purple-200 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Keyboard className="h-7 w-7 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">Keyboard Shortcuts</h3>
                <p className="text-sm text-gray-500">Work faster with shortcuts</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>

          <Link
            href="#best-practices"
            className="group bg-white rounded-2xl border border-gray-200/80 p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-amber-200 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Lightbulb className="h-7 w-7 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">Best Practices</h3>
                <p className="text-sm text-gray-500">Tips for creating great maps</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </div>
          </Link>
        </div>

        {/* Getting Started */}
        <div id="getting-started" className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Getting Started</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">1</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create an Account</h3>
                <p className="text-gray-600">Sign up with your email or use Google OAuth to get started. Once signed in, you'll be redirected to your dashboard.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">2</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your First Map</h3>
                <p className="text-gray-600 mb-2">Click "Create Map" from your dashboard. Fill in the basic information:</p>
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" /><span>Map Title: A descriptive name for your map</span></li>
                  <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" /><span>Product Name: The product or project being documented</span></li>
                  <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" /><span>Product URL: Link to the official documentation (optional)</span></li>
                  <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" /><span>Description: Brief overview of what the map covers</span></li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">3</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Nodes</h3>
                <p className="text-gray-600 mb-2">Use the left sidebar to add three types of nodes:</p>
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" /><span>Product Node (Green): Top-level products or services</span></li>
                  <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" /><span>Feature Node (Blue): Major features or capabilities</span></li>
                  <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" /><span>Component Node (Purple): Individual components or modules</span></li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">4</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Nodes</h3>
                <p className="text-gray-600">Click and drag from one node's handle to another to create connections. This shows relationships and hierarchy.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">5</div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Publish Your Map</h3>
                <p className="text-gray-600">When ready, toggle the "Published" switch in the top bar to make your map public. Anyone with the link can view it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Guide */}
        <div id="editor-guide" className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Map className="h-5 w-5 text-emerald-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Editor Guide</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Canvas Controls
              </h3>
              <ul className="space-y-1.5 ml-1">
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Pan: Click and drag on empty canvas space</span></li>
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Zoom: Use mouse wheel or zoom controls</span></li>
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Select: Click on any node or edge</span></li>
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Multi-select: Hold Shift and click multiple items</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Node Editing
              </h3>
              <p className="text-gray-600 mb-2">Click a node to open the details panel on the right. You can edit:</p>
              <ul className="space-y-1.5 ml-1">
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Label: Node display name (max 60 characters)</span></li>
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Description: Rich text content with formatting</span></li>
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Icon: Emoji or symbol (max 2 characters)</span></li>
                <li className="flex items-start gap-2 text-gray-600"><ChevronRight className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" /><span>Status: Stable, Beta, Deprecated, or Experimental</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Saving
              </h3>
              <p className="text-gray-600">Your map auto-saves every 30 seconds. You can also manually save with Cmd/Ctrl+S or the Save button.</p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div id="keyboard-shortcuts" className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-violet-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <span className="text-gray-900 font-medium">Save</span>
                <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 shadow-sm">⌘/Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <span className="text-gray-900 font-medium">Delete Selected</span>
                <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 shadow-sm">Delete</kbd>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <span className="text-gray-900 font-medium">Deselect All</span>
                <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 shadow-sm">Esc</kbd>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                <span className="text-gray-900 font-medium">Zoom In/Out</span>
                <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 shadow-sm">Mouse Wheel</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div id="best-practices" className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden mb-8 shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-yellow-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Best Practices</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 rounded-xl border border-amber-100/50">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />Keep It Simple
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">Focus on the most important concepts. Too many nodes can overwhelm viewers. Aim for 10-30 nodes per map.</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 rounded-xl border border-amber-100/50">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />Use Clear Labels
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">Node labels should be concise and descriptive. Avoid abbreviations unless they're widely known.</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 rounded-xl border border-amber-100/50">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />Add Rich Descriptions
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">Use the description field to provide context, examples, and links to detailed documentation.</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 rounded-xl border border-amber-100/50">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />Link to Documentation
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">Always include links to official documentation. This makes your map a jumping-off point for deeper learning.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="pb-6 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Can I make my map private?</h3>
              <p className="text-gray-600">Yes! Maps are private (draft) by default. Only you can see them until you toggle the "Published" switch.</p>
            </div>
            <div className="pb-6 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-2">How many maps can I create?</h3>
              <p className="text-gray-600">There's no limit! Create as many maps as you need.</p>
            </div>
            <div className="pb-6 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Can I duplicate an existing map?</h3>
              <p className="text-gray-600">Yes! Use the "Duplicate" option in your dashboard to create a copy of any map.</p>
            </div>
            <div className="pb-6 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Can I embed a map on my website?</h3>
              <p className="text-gray-600">Yes! Published maps have an "Embed" button that provides iframe code for embedding.</p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Is DocMaps free to use?</h3>
              <p className="text-gray-600">Yes! DocMaps is completely free to use for creating and viewing maps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} DocMaps. Visual architectural maps of developer documentation.</p>
            <p className="mt-2">
              Need more help?{' '}
              <Link href="mailto:brianmuteak@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
