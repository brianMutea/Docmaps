'use client';

import { useState } from 'react';
import { Box, Zap, Wrench, FileText, Layout, LayoutGrid, Grid3x3, Map, ChevronLeft, ChevronRight, Keyboard, Menu, X, AlignLeft, AlignRight, AlignCenterHorizontal, AlignVerticalJustifyCenter, MoveHorizontal, MoveVertical } from 'lucide-react';
import type { AlignmentType } from '@docmaps/graph/alignment';

interface LeftSidebarProps {
  onAddNode: (type: 'product' | 'feature' | 'component' | 'textBlock') => void;
  onAutoLayout: (direction: 'TB' | 'LR') => void;
  showGrid: boolean;
  showMiniMap: boolean;
  onToggleGrid: () => void;
  onToggleMiniMap: () => void;
  selectedNodesCount?: number;
  onAlign?: (type: AlignmentType) => void;
  onDistribute?: (direction: 'horizontal' | 'vertical') => void;
}

export function LeftSidebar({
  onAddNode,
  onAutoLayout,
  showGrid,
  showMiniMap,
  onToggleGrid,
  onToggleMiniMap,
  selectedNodesCount = 0,
  onAlign,
  onDistribute,
}: LeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Mobile floating toolbar
  const MobileToolbar = () => (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 transition-all active:scale-95"
        aria-label="Toggle tools"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile tools panel */}
      {isMobileOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="lg:hidden fixed bottom-20 right-4 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="p-4 space-y-4">
              {/* Add Nodes */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Nodes</h3>
                <div className="space-y-1.5">
                  <MobileNodeButton
                    onClick={() => { onAddNode('product'); setIsMobileOpen(false); }}
                    icon={<Box className="h-4 w-4" />}
                    label="Product"
                    color="emerald"
                  />
                  <MobileNodeButton
                    onClick={() => { onAddNode('feature'); setIsMobileOpen(false); }}
                    icon={<Zap className="h-4 w-4" />}
                    label="Feature"
                    color="blue"
                  />
                  <MobileNodeButton
                    onClick={() => { onAddNode('component'); setIsMobileOpen(false); }}
                    icon={<Wrench className="h-4 w-4" />}
                    label="Component"
                    color="purple"
                  />
                  <MobileNodeButton
                    onClick={() => { onAddNode('textBlock'); setIsMobileOpen(false); }}
                    icon={<FileText className="h-4 w-4" />}
                    label="Text Block"
                    color="amber"
                  />
                </div>
              </div>

              {/* Layout */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { onAutoLayout('TB'); setIsMobileOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Layout className="h-4 w-4" />
                    <span className="text-xs font-medium">Vertical</span>
                  </button>
                  <button
                    onClick={() => { onAutoLayout('LR'); setIsMobileOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="text-xs font-medium">Horizontal</span>
                  </button>
                </div>
              </div>

              {/* View Options */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">View</h3>
                <div className="space-y-1">
                  <MobileToggle
                    checked={showGrid}
                    onChange={onToggleGrid}
                    icon={<Grid3x3 className="h-4 w-4" />}
                    label="Grid"
                  />
                  <MobileToggle
                    checked={showMiniMap}
                    onChange={onToggleMiniMap}
                    icon={<Map className="h-4 w-4" />}
                    label="Mini Map"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  // Desktop collapsed sidebar
  if (isCollapsed) {
    return (
      <>
        <MobileToolbar />
        <div className="hidden lg:flex w-12 border-r border-gray-200 bg-white flex-col items-center py-3 gap-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="w-6 h-px bg-gray-200 my-1" />
          
          <NodeButton
            onClick={() => onAddNode('product')}
            icon={<Box className="h-4 w-4" />}
            color="emerald"
            tooltip="Add Product Node"
            collapsed
          />
          <NodeButton
            onClick={() => onAddNode('feature')}
            icon={<Zap className="h-4 w-4" />}
            color="blue"
            tooltip="Add Feature Node"
            collapsed
          />
          <NodeButton
            onClick={() => onAddNode('component')}
            icon={<Wrench className="h-4 w-4" />}
            color="purple"
            tooltip="Add Component Node"
            collapsed
          />
          <NodeButton
            onClick={() => onAddNode('textBlock')}
            icon={<FileText className="h-4 w-4" />}
            color="amber"
            tooltip="Add Text Block"
            collapsed
          />
          
          <div className="w-6 h-px bg-gray-200 my-1" />
          
          <button
            onClick={() => onAutoLayout('TB')}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Vertical Layout"
          >
            <Layout className="h-4 w-4" />
          </button>
          <button
            onClick={() => onAutoLayout('LR')}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Horizontal Layout"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileToolbar />
      <div className="hidden lg:flex w-64 border-r border-gray-200 bg-white flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</span>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Add Nodes Section */}
          <Section title="Add Nodes">
            <div className="space-y-2">
              <NodeButton
                onClick={() => onAddNode('product')}
                icon={<Box className="h-4 w-4" />}
                label="Product Node"
                color="emerald"
                description="Main product or service"
              />
              <NodeButton
                onClick={() => onAddNode('feature')}
                icon={<Zap className="h-4 w-4" />}
                label="Feature Node"
                color="blue"
                description="Feature or capability"
              />
              <NodeButton
                onClick={() => onAddNode('component')}
                icon={<Wrench className="h-4 w-4" />}
                label="Component Node"
                color="purple"
                description="Technical component"
              />
              <NodeButton
                onClick={() => onAddNode('textBlock')}
                icon={<FileText className="h-4 w-4" />}
                label="Text Block"
                color="amber"
                description="Rich text annotation"
              />
            </div>
          </Section>

          {/* Layout Section */}
          <Section title="Auto Layout">
            <div className="grid grid-cols-2 gap-2">
              <LayoutButton
                onClick={() => onAutoLayout('TB')}
                icon={<Layout className="h-4 w-4" />}
                label="Vertical"
              />
              <LayoutButton
                onClick={() => onAutoLayout('LR')}
                icon={<LayoutGrid className="h-4 w-4" />}
                label="Horizontal"
              />
            </div>
          </Section>

          {/* View Options Section */}
          <Section title="View Options">
            <div className="space-y-2">
              <ToggleOption
                checked={showGrid}
                onChange={onToggleGrid}
                icon={<Grid3x3 className="h-4 w-4" />}
                label="Show Grid"
              />
              <ToggleOption
                checked={showMiniMap}
                onChange={onToggleMiniMap}
                icon={<Map className="h-4 w-4" />}
                label="Mini Map"
              />
            </div>
          </Section>

          {/* Alignment Tools - Show when multiple nodes selected */}
          {selectedNodesCount >= 2 && onAlign && (
            <Section title={`Align (${selectedNodesCount} selected)`}>
              <div className="grid grid-cols-3 gap-1.5">
                <AlignButton
                  onClick={() => onAlign('left')}
                  icon={<AlignLeft className="h-4 w-4" />}
                  tooltip="Align Left"
                />
                <AlignButton
                  onClick={() => onAlign('center-horizontal')}
                  icon={<AlignCenterHorizontal className="h-4 w-4" />}
                  tooltip="Align Center"
                />
                <AlignButton
                  onClick={() => onAlign('right')}
                  icon={<AlignRight className="h-4 w-4" />}
                  tooltip="Align Right"
                />
                <AlignButton
                  onClick={() => onAlign('top')}
                  icon={<AlignLeft className="h-4 w-4 rotate-90" />}
                  tooltip="Align Top"
                />
                <AlignButton
                  onClick={() => onAlign('center-vertical')}
                  icon={<AlignVerticalJustifyCenter className="h-4 w-4" />}
                  tooltip="Align Middle"
                />
                <AlignButton
                  onClick={() => onAlign('bottom')}
                  icon={<AlignRight className="h-4 w-4 rotate-90" />}
                  tooltip="Align Bottom"
                />
              </div>
            </Section>
          )}

          {/* Distribute Tools - Show when 3+ nodes selected */}
          {selectedNodesCount >= 3 && onDistribute && (
            <Section title="Distribute">
              <div className="grid grid-cols-2 gap-2">
                <DistributeButton
                  onClick={() => onDistribute('horizontal')}
                  icon={<MoveHorizontal className="h-4 w-4" />}
                  label="Horizontal"
                />
                <DistributeButton
                  onClick={() => onDistribute('vertical')}
                  icon={<MoveVertical className="h-4 w-4" />}
                  label="Vertical"
                />
              </div>
            </Section>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shortcuts</span>
          </div>
          <div className="space-y-2">
            <ShortcutRow label="Save" keys={['⌘', 'S']} />
            <ShortcutRow label="Delete" keys={['Del']} />
            <ShortcutRow label="Deselect" keys={['Esc']} />
          </div>
        </div>
      </div>
    </>
  );
}

function MobileNodeButton({
  onClick,
  icon,
  label,
  color,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${colorClasses[color]}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function MobileToggle({
  checked,
  onChange,
  icon,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function NodeButton({
  onClick,
  icon,
  label,
  color,
  description,
  tooltip,
  collapsed,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
  description?: string;
  tooltip?: string;
  collapsed?: boolean;
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 ring-emerald-200',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 ring-blue-200',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 ring-purple-200',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 ring-amber-200',
  };

  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${colorClasses[color]}`}
        title={tooltip}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:ring-1 ${colorClasses[color]}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="text-left min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs opacity-70 truncate">{description}</p>}
      </div>
    </button>
  );
}

function LayoutButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function ToggleOption({
  checked,
  onChange,
  icon,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
}

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px] border border-gray-200"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function AlignButton({ onClick, icon, tooltip }: { onClick: () => void; icon: React.ReactNode; tooltip: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className="flex items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
    >
      {icon}
    </button>
  );
}

function DistributeButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
