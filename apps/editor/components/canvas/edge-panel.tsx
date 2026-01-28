'use client';

import { useState, useEffect } from 'react';
import { Trash2, Info, Palette } from 'lucide-react';
import type { Edge } from 'reactflow';
import { EdgeType, getAllEdgeTypes, getEdgeTypeConfig } from '@docmaps/graph/edge-types';
import { FloatingSidebar } from './floating-sidebar';

interface EdgePanelProps {
  selectedEdge: Edge | null;
  onUpdateEdge: (edgeId: string, updates: Record<string, unknown>) => void;
  onDeleteEdge: () => void;
  onClose: () => void;
}

export function EdgePanel({
  selectedEdge,
  onUpdateEdge,
  onDeleteEdge,
  onClose,
}: EdgePanelProps) {
  const [edgeType, setEdgeType] = useState<EdgeType>(EdgeType.HIERARCHY);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeDescription, setEdgeDescription] = useState('');
  const [direction, setDirection] = useState<'one-way' | 'two-way'>('one-way');

  useEffect(() => {
    if (selectedEdge) {
      setEdgeType(selectedEdge.data?.edgeType || EdgeType.HIERARCHY);
      setEdgeLabel(String(selectedEdge.label || ''));
      setEdgeDescription(selectedEdge.data?.description || '');
      
      // Since we no longer use arrows, direction is determined by edge data
      setDirection(selectedEdge.data?.direction || 'one-way');
    }
  }, [selectedEdge]);

  if (!selectedEdge) return null;

  const handleEdgeUpdate = (updates: Record<string, unknown>) => {
    onUpdateEdge(selectedEdge.id, updates);
  };

  const handleTypeChange = (newType: EdgeType) => {
    setEdgeType(newType);
    handleEdgeUpdate({ edgeType: newType });
  };

  const handleLabelChange = (value: string) => {
    setEdgeLabel(value);
    handleEdgeUpdate({ label: value });
  };

  const handleDescriptionChange = (value: string) => {
    setEdgeDescription(value);
    handleEdgeUpdate({ description: value });
  };

  const handleDirectionChange = (newDirection: 'one-way' | 'two-way') => {
    setDirection(newDirection);
    handleEdgeUpdate({ direction: newDirection });
  };

  const edgeTypeConfig = getEdgeTypeConfig(edgeType);
  const allEdgeTypes = getAllEdgeTypes();

  return (
    <FloatingSidebar isOpen={true} onClose={onClose} title="Edge Properties">
      <div className="p-5 space-y-6">
        <FormSection title="Connection Type" icon={<Info className="h-4 w-4" />}>
          <Select
            value={edgeType}
            onChange={handleTypeChange}
            options={allEdgeTypes.map(type => {
              const config = getEdgeTypeConfig(type);
              return {
                value: type,
                label: config.label,
              };
            })}
          />
          <EdgeTypeHint config={edgeTypeConfig} />
        </FormSection>

        <FormSection title="Label">
          <Input
            value={edgeLabel}
            onChange={handleLabelChange}
            placeholder="Optional label"
            maxLength={30}
            hint={`${edgeLabel.length}/30`}
          />
        </FormSection>

        <FormSection title="Description">
          <textarea
            value={edgeDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Describe this connection..."
            maxLength={200}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{edgeDescription.length}/200</p>
        </FormSection>

        <FormSection title="Direction" icon={<Palette className="h-4 w-4" />}>
          <Select
            value={direction}
            onChange={handleDirectionChange}
            options={[
              { value: 'one-way', label: 'One-way →' },
              { value: 'two-way', label: 'Two-way ↔' },
            ]}
          />
          <p className="text-xs text-gray-500 mt-2">
            {direction === 'one-way' 
              ? 'Connection flows from source to target' 
              : 'Bidirectional connection between nodes'}
          </p>
        </FormSection>

        <FormSection title="Style Preview">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <svg width="100%" height="40" className="overflow-visible">
              <line
                x1="10"
                y1="20"
                x2="90%"
                y2="20"
                stroke={edgeTypeConfig.style.stroke}
                strokeWidth={edgeTypeConfig.style.strokeWidth}
                strokeDasharray={edgeTypeConfig.style.strokeDasharray}
              />
            </svg>
            <p className="text-xs text-gray-500 text-center mt-2">
              {edgeTypeConfig.label} style
            </p>
          </div>
        </FormSection>

        <DeleteButton onClick={onDeleteEdge} label="Delete Edge" />
      </div>
    </FloatingSidebar>
  );
}

function FormSection({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon?: React.ReactNode; 
  children: React.ReactNode;
}) {
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

function Input({ 
  value, 
  onChange, 
  placeholder, 
  maxLength, 
  hint 
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <input
        type="text"
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

function Select<T extends string>({ 
  value, 
  onChange, 
  options 
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function EdgeTypeHint({ config }: { config: ReturnType<typeof getEdgeTypeConfig> }) {
  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
      <p className="text-xs text-blue-900 font-medium mb-1">{config.label}</p>
      <p className="text-xs text-blue-700">{config.description}</p>
    </div>
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
