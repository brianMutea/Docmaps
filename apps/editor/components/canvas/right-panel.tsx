'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import type { Node, Edge } from 'reactflow';
import dynamic from 'next/dynamic';

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import('../tiptap-editor').then(mod => ({ default: mod.TiptapEditor })), { 
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-md p-4 text-sm text-gray-500">Loading editor...</div>
});

interface RightPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onUpdateNode: (nodeId: string, updates: any) => void;
  onUpdateEdge: (edgeId: string, updates: any) => void;
  onDeleteNode: () => void;
  onDeleteEdge: () => void;
  onClose: () => void;
}

export function RightPanel({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  onClose,
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

  // Edge state
  const [edgeType, setEdgeType] = useState<'hierarchy' | 'related' | 'depends-on' | 'optional'>('hierarchy');
  const [edgeLabel, setEdgeLabel] = useState('');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');

  // Update local state when selectedNode changes
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
    }
  }, [selectedNode]);

  // Update local state when selectedEdge changes
  useEffect(() => {
    if (selectedEdge) {
      setEdgeType(selectedEdge.data?.edgeType || 'hierarchy');
      setEdgeLabel(String(selectedEdge.label || ''));
      
      // Determine line style from strokeDasharray
      const dashArray = selectedEdge.style?.strokeDasharray;
      if (dashArray === '5,5') {
        setLineStyle('dashed');
      } else if (dashArray === '2,2') {
        setLineStyle('dotted');
      } else {
        setLineStyle('solid');
      }
    }
  }, [selectedEdge]);

  if (!selectedNode && !selectedEdge) return null;

  const handleUpdate = (field: string, value: any) => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { [field]: value });
    }
  };

  const handleEdgeUpdate = (updates: any) => {
    if (selectedEdge) {
      onUpdateEdge(selectedEdge.id, updates);
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

  // Render edge details if edge is selected
  if (selectedEdge) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Edge Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Edge Type Section */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Edge Type</h4>
            <select
              value={edgeType}
              onChange={(e) => {
                const newType = e.target.value as 'hierarchy' | 'related' | 'depends-on' | 'optional';
                setEdgeType(newType);
                handleEdgeUpdate({ edgeType: newType });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="hierarchy">Hierarchy</option>
              <option value="related">Related</option>
              <option value="depends-on">Depends On</option>
              <option value="optional">Optional</option>
            </select>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p><span className="font-medium">Hierarchy:</span> Solid gray arrow - parent/child relationships</p>
              <p><span className="font-medium">Related:</span> Dashed blue line - related components</p>
              <p><span className="font-medium">Depends On:</span> Bold red line - dependencies</p>
              <p><span className="font-medium">Optional:</span> Dotted gray line - optional connections</p>
            </div>
          </div>

          {/* Label Section */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Label</h4>
            <input
              type="text"
              value={edgeLabel}
              onChange={(e) => {
                setEdgeLabel(e.target.value);
                handleEdgeUpdate({ label: e.target.value });
              }}
              maxLength={20}
              placeholder="Optional label"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">{edgeLabel.length}/20 characters</p>
          </div>

          {/* Line Style Section */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Line Style</h4>
            <select
              value={lineStyle}
              onChange={(e) => {
                const newStyle = e.target.value as 'solid' | 'dashed' | 'dotted';
                setLineStyle(newStyle);
                
                const strokeDasharray = 
                  newStyle === 'dashed' ? '5,5' : 
                  newStyle === 'dotted' ? '2,2' : 
                  undefined;
                
                handleEdgeUpdate({ 
                  style: { 
                    ...selectedEdge.style,
                    strokeDasharray 
                  } 
                });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Visual style of the connection line</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onDeleteEdge}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Edge
          </button>
        </div>
      </div>
    );
  }

  // Render node details if node is selected
  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Node Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Basic Info</h4>
          
          {/* Label */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                handleUpdate('label', e.target.value);
              }}
              maxLength={60}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">{label.length}/60</p>
          </div>

          {/* Type */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value)}
              disabled
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 cursor-not-allowed"
            >
              <option value="product">Product</option>
              <option value="feature">Feature</option>
              <option value="component">Component</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Type cannot be changed after creation</p>
          </div>

          {/* Icon */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon (Emoji)
            </label>
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Max 2 characters</p>
          </div>

          {/* Color */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  handleUpdate('color', e.target.value);
                }}
                className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  handleUpdate('color', e.target.value);
                }}
                placeholder="#10b981"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Description</h4>
          <TiptapEditor
            content={description}
            onChange={(html) => {
              setDescription(html);
              handleUpdate('description', html);
            }}
            maxLength={5000}
          />
        </div>

        {/* Links Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Links</h4>
          
          {/* Documentation URL */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documentation URL
            </label>
            <input
              type="url"
              value={docUrl}
              onChange={(e) => {
                setDocUrl(e.target.value);
                handleUpdate('docUrl', e.target.value);
              }}
              placeholder="https://docs.example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Additional Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Links
              </label>
              <button
                onClick={handleAddLink}
                disabled={additionalLinks.length >= 5}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Link
              </button>
            </div>
            {additionalLinks.length > 0 ? (
              <div className="space-y-2">
                {additionalLinks.map((link, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-2">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleUpdateLink(index, 'title', e.target.value)}
                      placeholder="Link title"
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm mb-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                        placeholder="https://"
                        className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleRemoveLink(index)}
                        className="text-red-600 hover:text-red-700 px-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No additional links</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max 5 links</p>
          </div>
        </div>

        {/* Metadata Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">Metadata</h4>
          
          {/* Tags */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                disabled={tags.length >= 10}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleAddTag}
                disabled={tags.length >= 10 || !tagInput.trim()}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {tags.length}/10 tags • Press Enter to add
            </p>
          </div>

          {/* Status */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value as 'stable' | 'beta' | 'deprecated' | 'experimental';
                setStatus(newStatus);
                handleUpdate('status', newStatus);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="stable">Stable</option>
              <option value="beta">Beta</option>
              <option value="deprecated">Deprecated</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onDeleteNode}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
}
