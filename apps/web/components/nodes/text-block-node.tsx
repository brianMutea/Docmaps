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
      className={`group relative rounded-lg bg-white shadow-sm border border-gray-200 transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 ring-offset-1 shadow-blue-50' : 'hover:shadow-md'
      }`}
      style={{ minWidth: '160px', maxWidth: '220px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors"
      />

      <div className="p-3">
        <div className="flex items-center gap-2.5 mb-2">
          <FileText className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <h3 className="font-medium text-gray-900 text-sm leading-tight break-words flex-1">
            {data.label || 'Text Block'}
          </h3>
        </div>

      {/* Content - rendered as HTML with standardized smaller font sizes */}
      <div 
        className="text-xs text-gray-600 leading-relaxed break-words [&_p]:my-0.5 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-3 [&_ul]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-3 [&_ol]:my-0.5 [&_li]:my-0 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-1.5 [&_pre]:rounded [&_pre]:text-[10px] [&_code]:text-[10px] [&_h1]:text-xs [&_h1]:font-semibold [&_h1]:my-0.5 [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:my-0.5 [&_h3]:text-xs [&_h3]:font-medium [&_h3]:my-0.5"
        dangerouslySetInnerHTML={{ __html: data.content || '<p class="text-gray-400 italic">No content</p>' }}
      />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors"
      />
    </div>
  );
});

TextBlockNode.displayName = 'TextBlockNode';
