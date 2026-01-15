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
      style={{ borderLeftColor: color, minWidth: '240px', maxWidth: '360px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors"
      />

      {/* Header - icon only, no text label */}
      <div className="flex items-center px-2.5 py-1.5 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-t-xl">
        <FileText className="h-3.5 w-3.5 text-amber-600" />
      </div>

      {/* Content - rendered as HTML with standardized smaller font sizes */}
      <div 
        className="max-w-none px-2.5 py-2 text-gray-700 text-xs leading-relaxed [&_p]:my-1 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-3 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-3 [&_ol]:my-1 [&_li]:my-0.5 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-[10px] [&_code]:text-[10px] [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:my-1 [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:my-1 [&_h3]:text-xs [&_h3]:font-medium [&_h3]:my-1"
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
