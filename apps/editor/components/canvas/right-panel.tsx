'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, X, Link as LinkIcon, Tag, Info, Palette, Layers } from 'lucide-react';
import type { Node, Edge } from 'reactflow';
import dynamic from 'next/dynamic';
import { FloatingSidebar } from './floating-sidebar';
import type { ProductView } from '@docmaps/database';

const TiptapEditor = dynamic(() => import('../tiptap-editor').then(mod => ({ default: mod.TiptapEditor })), { 
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )
});

interface RightPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  selectedNodes?: Node[];
  onUpdateNode: (nodeId: string, updates: Record<string, unknown>) => void;
  onUpdateEdge: (edgeId: string, updates: Record<string, unknown>) => void;
  onDeleteNode: () => void;
  onDeleteEdge: () => void;
  onClose: () => void;
  availableViews?: ProductView[];
}

export function RightPanel({
  selectedNode,
  selectedEdge,
  selectedNodes = [],
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onClose,
  availableViews = [],
}: RightPanelProps) {
  const [label, setLabel] = useState('');
  const [nodeType, setNodeType] = useState('product');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#10b981');
  const [description, setDescription] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [additionalLinks, setAdditionalLinks] = useState<Array<{ title: string; url: string }>>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'stable' | 'beta' | 'deprecated' | 'experimental'>('stable');
  const [referTo, setReferTo] = useState<{ slug: string; title: string } | null>(null);

  const [edgeType, setEdgeType] = useState<'hierarchy' | 'related' | 'depends-on' | 'optional'>('hierarchy');
  const [edgeLabel, setEdgeLabel] = useState('');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setNodeType(selectedNode.type || 'product');
      setIcon(selectedNode.data.icon || '');
      setColor(selectedNode.data.color || '#10b981');
      setDescription(selectedNode.data.description || '');
      setDocUrl(selectedNode.data.docUrl || '');
      setAdditionalLinks(selectedNode.data.additionalLinks || []);
      setTags(selectedNode.data.tags || []);
      setStatus(selectedNode.data.status || 'stable');
      setReferTo(selectedNode.data.referTo || null);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedEdge) {
      setEdgeType(selectedEdge.data?.edgeType || 'hierarchy');
      setEdgeLabel(String(selectedEdge.label || ''));
      const dashArray = selectedEdge.style?.strokeDasharray;
      setLineStyle(dashArray === '5,5' ? 'dashed' : dashArray === '2,2' ? 'dotted' : 'solid');
    }
  }, [selectedEdge]);

  // Show multi-select panel if multiple nodes selected
  if (selectedNodes.length > 1) {
    return (
      <FloatingSidebar isOpen={true} onClose={onClose} title={`${selectedNodes.length} Nodes Selected`}>
        <div className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Bulk Actions Available</p>
            <p className="text-xs text-blue-600">
              Use toolbar buttons for alignment, distribution, copy, and delete operations.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Nodes</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {selectedNodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.data.color || '#10b981' }} />
                  <span className="flex-1 truncate">{node.data.label || 'Untitled'}</span>
                  <span className="text-xs text-gray-400 capitalize">{node.type}</span>
                </div>
              ))}
            </div>
          </div>

          <DeleteButton onClick={onDeleteNode} label={`Delete ${selectedNodes.length} Nodes`} />
        </div>
      </FloatingSidebar>
    );
  }

  if (!selectedNode && !selectedEdge) return null;

  const handleUpdate = (field: string, value: unknown) => {
    if (selectedNode) onUpdateNode(selectedNode.id, { [field]: value });
  };

  const handleEdgeUpdate = (updates: Record<string, unknown>) => {
    if (selectedEdge) {
      // Merge updates with existing edge data to preserve all properties
      const mergedUpdates = {
        ...updates,
        data: {
          ...selectedEdge.data,
          ...updates,
        },
      };
      onUpdateEdge(selectedEdge.id, mergedUpdates);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10 && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      handleUpdate('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    handleUpdate('tags', newTags);
  };

  const handleAddLink = () => {
    if (additionalLinks.length < 5) {
      const newLinks = [...additionalLinks, { title: '', url: '' }];
      setAdditionalLinks(newLinks);
      handleUpdate('additionalLinks', newLinks);
    }
  };

  const handleUpdateLink = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...additionalLinks];
    newLinks[index][field] = value;
    setAdditionalLinks(newLinks);
    handleUpdate('additionalLinks', newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = additionalLinks.filter((_, i) => i !== index);
    setAdditionalLinks(newLinks);
    handleUpdate('additionalLinks', newLinks);
  };

  if (selectedEdge) {
    return (
      <FloatingSidebar isOpen={true} onClose={onClose} title="Edge Properties">
        <div className="p-5 space-y-6">
          <FormSection title="Connection Type" icon={<Info className="h-4 w-4" />}>
            <Select
              value={edgeType}
              onChange={(value) => {
                setEdgeType(value as typeof edgeType);
                handleEdgeUpdate({ edgeType: value });
              }}
              options={[
                { value: 'hierarchy', label: 'Hierarchy' },
                { value: 'related', label: 'Related' },
                { value: 'depends-on', label: 'Depends On' },
                { value: 'optional', label: 'Optional' },
              ]}
            />
            <EdgeTypeHint type={edgeType} />
          </FormSection>

          <FormSection title="Label">
            <Input
              value={edgeLabel}
              onChange={(value) => {
                setEdgeLabel(value);
                handleEdgeUpdate({ label: value });
              }}
              placeholder="Optional label"
              maxLength={20}
              hint={`${edgeLabel.length}/20`}
            />
          </FormSection>

          <FormSection title="Line Style">
            <Select
              value={lineStyle}
              onChange={(value) => {
                setLineStyle(value as typeof lineStyle);
                const strokeDasharray = value === 'dashed' ? '5,5' : value === 'dotted' ? '2,2' : undefined;
                handleEdgeUpdate({ style: { ...selectedEdge.style, strokeDasharray } });
              }}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' },
              ]}
            />
          </FormSection>

          <DeleteButton onClick={onDeleteEdge} label="Delete Edge" />
        </div>
      </FloatingSidebar>
    );
  }

  return (
    <FloatingSidebar isOpen={true} onClose={onClose} title="Node Properties">
      <div className="p-5 space-y-6">
        {/* Group nodes have simpler editing */}
        {nodeType === 'group' ? (
          <>
            <FormSection title="Basic Info" icon={<Info className="h-4 w-4" />}>
              <Input
                label="Label"
                value={label}
                onChange={(value) => { setLabel(value); handleUpdate('label', value); }}
                maxLength={60}
                hint={`${label.length}/60`}
              />
              
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
                <div className="px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-500 capitalize">
                  Group Container
                </div>
              </div>
            </FormSection>

            <FormSection title="Appearance" icon={<Palette className="h-4 w-4" />}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); handleUpdate('color', e.target.value); }}
                  className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); handleUpdate('color', e.target.value); }}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </FormSection>

            <FormSection title="Description">
              <TiptapEditor
                content={description}
                onChange={(html) => { setDescription(html); handleUpdate('description', html); }}
                maxLength={500}
              />
            </FormSection>

            <DeleteButton onClick={onDeleteNode} label="Delete Group" />
          </>
        ) : (
          <>
            <FormSection title="Basic Info" icon={<Info className="h-4 w-4" />}>
          <Input
            label="Label"
            value={label}
            onChange={(value) => { setLabel(value); handleUpdate('label', value); }}
            maxLength={60}
            hint={`${label.length}/60`}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
              <div className="px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-500 capitalize">
                {nodeType}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Icon</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 2);
                  setIcon(value);
                  handleUpdate('icon', value);
                }}
                maxLength={2}
                placeholder="📦"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-center text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Appearance" icon={<Palette className="h-4 w-4" />}>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); handleUpdate('color', e.target.value); }}
              className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => { setColor(e.target.value); handleUpdate('color', e.target.value); }}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          
          <label className="block text-xs font-medium text-gray-600 mb-1.5 mt-4">Status</label>
          <Select
            value={status}
            onChange={(value) => { setStatus(value as typeof status); handleUpdate('status', value); }}
            options={[
              { value: 'stable', label: '✓ Stable' },
              { value: 'beta', label: '🧪 Beta' },
              { value: 'experimental', label: '⚡ Experimental' },
              { value: 'deprecated', label: '⚠️ Deprecated' },
            ]}
          />
        </FormSection>

        <FormSection title="Description">
          <TiptapEditor
            content={description}
            onChange={(html) => { setDescription(html); handleUpdate('description', html); }}
            maxLength={5000}
          />
        </FormSection>

        <FormSection title="Links" icon={<LinkIcon className="h-4 w-4" />}>
          <Input
            label="Documentation URL"
            value={docUrl}
            onChange={(value) => { setDocUrl(value); handleUpdate('docUrl', value); }}
            placeholder="https://docs.example.com"
            type="url"
          />
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">Additional Links</label>
              <button
                onClick={handleAddLink}
                disabled={additionalLinks.length >= 5}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            {additionalLinks.length > 0 ? (
              <div className="space-y-2">
                {additionalLinks.map((link, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleUpdateLink(index, 'title', e.target.value)}
                      placeholder="Title"
                      className="w-full px-2.5 py-1.5 text-sm rounded border border-gray-200 mb-2 focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                        placeholder="https://"
                        className="flex-1 px-2.5 py-1.5 text-sm rounded border border-gray-200 focus:border-blue-500 outline-none"
                      />
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center bg-gray-50 rounded-lg">No additional links</p>
            )}
          </div>
        </FormSection>

        <FormSection title="Tags" icon={<Tag className="h-4 w-4" />}>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              placeholder="Add tag..."
              disabled={tags.length >= 10}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-gray-50"
            />
            <button
              onClick={handleAddTag}
              disabled={tags.length >= 10 || !tagInput.trim()}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">{tags.length}/10 tags</p>
        </FormSection>

        {availableViews.length > 0 && (
          <FormSection title="Refer to" icon={<Layers className="h-4 w-4" />}>
            <ViewReferenceInput
              value={referTo}
              onChange={(value) => {
                setReferTo(value);
                handleUpdate('referTo', value);
              }}
              availableViews={availableViews}
            />
            {referTo && (
              <p className="text-xs text-gray-500 mt-2">
                Links to: <span className="font-medium text-blue-600">{referTo.title}</span>
              </p>
            )}
          </FormSection>
        )}

        <DeleteButton onClick={onDeleteNode} label="Delete Node" />
          </>
        )}
      </div>
    </FloatingSidebar>
  );
}

function FormSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, maxLength, hint, type = 'text' }: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
      />
      {hint && <p className="text-xs text-gray-400 mt-1 text-right">{hint}</p>}
    </div>
  );
}

function Select({ value, onChange, options }: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function EdgeTypeHint({ type }: { type: string }) {
  const hints: Record<string, { color: string; desc: string }> = {
    hierarchy: { color: 'gray', desc: 'Parent/child relationship' },
    related: { color: 'blue', desc: 'Related components' },
    'depends-on': { color: 'red', desc: 'Hard dependency' },
    optional: { color: 'gray', desc: 'Optional connection' },
  };
  const hint = hints[type] || hints.hierarchy;
  return (
    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full bg-${hint.color}-400`} />
      {hint.desc}
    </p>
  );
}

function DeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="pt-4 border-t border-gray-100">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        {label}
      </button>
    </div>
  );
}

function ViewReferenceInput({ 
  value, 
  onChange, 
  availableViews 
}: { 
  value: { slug: string; title: string } | null;
  onChange: (value: { slug: string; title: string } | null) => void;
  availableViews: ProductView[];
}) {
  const [inputValue, setInputValue] = useState(value ? `/${value.slug}` : '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredViews, setFilteredViews] = useState<ProductView[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value ? `/${value.slug}` : '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.startsWith('/')) {
      const searchTerm = val.slice(1).toLowerCase();
      const filtered = availableViews.filter(view => 
        view.slug.toLowerCase().includes(searchTerm) ||
        view.title.toLowerCase().includes(searchTerm)
      );
      setFilteredViews(filtered);
      setShowDropdown(true);
    } else if (val === '') {
      setFilteredViews(availableViews);
      setShowDropdown(false);
      onChange(null);
    } else {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '/') {
      if (inputValue === '') {
        setFilteredViews(availableViews);
        setShowDropdown(true);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === 'Enter' && filteredViews.length > 0) {
      e.preventDefault();
      handleSelectView(filteredViews[0]);
    }
  };

  const handleSelectView = (view: ProductView) => {
    setInputValue(`/${view.slug}`);
    onChange({ slug: view.slug, title: view.title });
    setShowDropdown(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange(null);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.startsWith('/') || inputValue === '') {
              setFilteredViews(availableViews);
              if (inputValue.startsWith('/')) {
                setShowDropdown(true);
              }
            }
          }}
          placeholder="Type / to link to a view"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all pr-8"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {showDropdown && filteredViews.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredViews.map((view) => (
            <button
              key={view.id}
              onClick={() => handleSelectView(view)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <span className="text-blue-600 font-mono text-xs">/{view.slug}</span>
              <span className="text-gray-600 text-sm truncate">{view.title}</span>
            </button>
          ))}
        </div>
      )}
      
      {showDropdown && filteredViews.length === 0 && inputValue.startsWith('/') && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
        >
          <p className="text-sm text-gray-500 text-center">No matching views found</p>
        </div>
      )}
    </div>
  );
}
