'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';

export interface TextBlockNodeData {
  label: string;
  content: string;
  color?: string;
}

export const TextBlockNode = memo(({ data, selected }: NodeProps<TextBlockNodeData>) => {
  const color = data.color || '#f59e0b';

  return (
    <div
      className={`group relative rounded-xl bg-white shadow-md border-l-4 transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-blue-100' : 'hover:shadow-lg'
      }`}
      style={{ borderLeftColor: color, minWidth: '280px', maxWidth: '400px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors"
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-t-xl">
        <FileText className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {data.label || 'Text Block'}
        </span>
      </div>

      {/* Content - rendered as HTML */}
      <div 
        className="prose prose-sm max-w-none p-3 text-gray-700 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:text-sm [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold"
        dangerouslySetInnerHTML={{ __html: data.content || '<p class="text-gray-400 italic">No content</p>' }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors"
      />
    </div>
  );
});

TextBlockNode.displayName = 'TextBlockNode';
