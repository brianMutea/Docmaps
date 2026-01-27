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
  Layers,
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Documentation & Guides
          </div>

          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Help Center</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to create professional documentation maps
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {[
            { href: '#getting-started', icon: BookOpen, color: 'blue', title: 'Getting Started', desc: 'Create your first map' },
            { href: '#editor-guide', icon: Map, color: 'emerald', title: 'Editor Guide', desc: 'Master the canvas tools' },
            { href: '#advanced-features', icon: Sparkles, color: 'indigo', title: 'Advanced Features', desc: 'Copy, paste & more' },
            { href: '#multi-view', icon: Layers, color: 'purple', title: 'Multi-View Maps', desc: 'Complex documentation' },
            { href: '#shortcuts', icon: Keyboard, color: 'amber', title: 'Shortcuts', desc: 'Work faster' },
            { href: '#best-practices', icon: Lightbulb, color: 'orange', title: 'Best Practices', desc: 'Tips for great maps' },
          ].map(({ href, icon: Icon, color, title, desc }) => (
            <Link
              key={href}
              href={href}
              className={`group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-${color}-200 transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-11 w-11 rounded-lg bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 text-${color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-0.5">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:translate-x-1 transition-transform mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Getting Started */}
        <Section id="getting-started" icon={BookOpen} color="blue" title="Getting Started">
          <div className="space-y-6">
            {[
              { step: 1, title: 'Create an Account', content: 'Sign up with email or Google OAuth. You\'ll be redirected to your dashboard.' },
              { step: 2, title: 'Create Your First Map', content: 'Click "Create Map" and fill in: Map Title, Product Name, Product URL (optional), and Description.' },
              { step: 3, title: 'Choose Map Type', content: 'Single View for simple maps, Multi-View for complex documentation with multiple perspectives.' },
              { step: 4, title: 'Add Nodes', content: 'Use the sidebar to add Product (green), Feature (blue), and Component (purple) nodes.' },
              { step: 5, title: 'Connect Nodes', content: 'Drag from one node\'s handle to another to create relationships.' },
              { step: 6, title: 'Publish', content: 'Toggle "Published" in the top bar to make your map public.' },
            ].map(({ step, title, content }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">{step}</div>
                <div className="flex-1 pt-0.5">
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm">{content}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Editor Guide */}
        <Section id="editor-guide" icon={Map} color="emerald" title="Editor Guide">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Canvas Controls</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Pan: Click and drag on empty space</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Zoom: Mouse wheel or zoom controls</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Select: Click any node or edge</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Multi-select: Shift + click or drag selection box</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Move nodes: Drag selected nodes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Selection Behaviors</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Select multiple nodes to access alignment tools</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Align: Left, Right, Top, Bottom, Center (horizontal/vertical)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Distribute: Even spacing horizontally or vertically</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Group: Press 'G' to create a group from selected nodes</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Copy/Paste: Works with single or multiple nodes</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Delete: Removes all selected nodes and their connections</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Groups</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Create: Select 2+ nodes and press 'G' or use sidebar button</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Collapse/Expand: Click the group header to toggle visibility</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Move: Drag group to move all contained nodes together</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Child nodes are constrained within group boundaries</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Node Properties</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Label: Display name (max 60 chars)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Description: Rich text with code highlighting</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Icon: Emoji or symbol (max 2 chars)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Status: Stable, Beta, Deprecated, Experimental</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Tags: Add up to 10 searchable tags</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Auto-Save & History</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Maps auto-save every 30 seconds</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Manual save: Cmd/Ctrl+S</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-emerald-400" />Unlimited undo/redo with Cmd/Ctrl+Z</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Multi-View Maps */}
        <Section id="multi-view" icon={Layers} color="purple" title="Multi-View Maps">
          <div className="space-y-4 text-sm text-gray-600">
            <p>Multi-view maps allow you to create complex documentation with multiple perspectives:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-purple-400" />Create separate views for different aspects (Architecture, API, Guides)</li>
              <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-purple-400" />Each view has its own canvas with independent nodes and edges</li>
              <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-purple-400" />Viewers can switch between views using the sidebar</li>
              <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-purple-400" />Great for large products with multiple documentation areas</li>
            </ul>
          </div>
        </Section>

        {/* Advanced Features */}
        <Section id="advanced-features" icon={Sparkles} color="indigo" title="Advanced Features">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Copy & Paste</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Copy nodes with Cmd/Ctrl+C (preserves connections between copied nodes)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Paste with Cmd/Ctrl+V (automatically offsets position)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Duplicate with Cmd/Ctrl+D (copy + paste in one action)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Works with single nodes or multiple selections</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Edge Types & Connections</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Hierarchy: Parent-child relationships (solid line)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Dependency: Required connections (dashed line)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Integration: System integrations (dotted line)</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Extension: Plugin/extension relationships</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Alternative: Alternative options or paths</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Text Blocks</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Add rich text annotations anywhere on the canvas</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Support for formatting, links, and code snippets</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-indigo-400" />Perfect for explanations, notes, and documentation</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* Keyboard Shortcuts */}
        <Section id="shortcuts" icon={Keyboard} color="amber" title="Keyboard Shortcuts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { action: 'Save', key: '⌘/Ctrl + S' },
              { action: 'Undo', key: '⌘/Ctrl + Z' },
              { action: 'Redo', key: '⌘/Ctrl + Shift + Z' },
              { action: 'Copy', key: '⌘/Ctrl + C' },
              { action: 'Paste', key: '⌘/Ctrl + V' },
              { action: 'Duplicate', key: '⌘/Ctrl + D' },
              { action: 'Delete Selected', key: 'Delete / Backspace' },
              { action: 'Deselect All', key: 'Escape' },
              { action: 'Group Selected', key: 'G' },
              { action: 'Zoom', key: 'Mouse Wheel' },
            ].map(({ action, key }) => (
              <div key={action} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900 font-medium text-sm">{action}</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-gray-600">{key}</kbd>
              </div>
            ))}
          </div>
        </Section>

        {/* Best Practices */}
        <Section id="best-practices" icon={Lightbulb} color="orange" title="Best Practices">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Keep It Simple', desc: 'Aim for 10-30 nodes per map. Too many overwhelms viewers.' },
              { title: 'Clear Labels', desc: 'Use concise, descriptive names. Avoid unknown abbreviations.' },
              { title: 'Rich Descriptions', desc: 'Add context, examples, and code snippets to nodes.' },
              { title: 'Link Documentation', desc: 'Include links to official docs for deeper learning.' },
              { title: 'Use Groups Wisely', desc: 'Group related nodes to reduce visual complexity.' },
              { title: 'Consistent Naming', desc: 'Follow consistent naming patterns across your maps.' },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 bg-orange-50/50 rounded-lg border border-orange-100/50">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
                <p className="text-xs text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" icon={MessageCircle} color="gray" title="FAQ">
          <div className="space-y-4">
            {[
              { q: 'Can I make my map private?', a: 'Yes! Maps are private (draft) by default until you publish them.' },
              { q: 'How many maps can I create?', a: 'Unlimited! Create as many maps as you need.' },
              { q: 'Can I duplicate a map?', a: 'Yes, use the "Duplicate" option in your dashboard.' },
              { q: 'Can I embed maps?', a: 'Yes! Published maps have an embed button with iframe code.' },
              { q: 'Is DocMaps free?', a: 'Yes, completely free for creating and viewing maps.' },
            ].map(({ q, a }) => (
              <div key={q} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{q}</h3>
                <p className="text-sm text-gray-600">{a}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>
    </div>
  );
}

function Section({ id, icon: Icon, color, title, children }: {
  id: string;
  icon: React.ElementType;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className={`px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-${color}-50/50 to-transparent`}>
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg bg-${color}-100 flex items-center justify-center`}>
            <Icon className={`h-4 w-4 text-${color}-600`} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
