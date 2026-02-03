'use client';

import { memo, useMemo } from 'react';
import { type NodeProps } from 'reactflow';
import { HandleRenderer } from '@docmaps/ui';
import { getHandlesForNodeType } from '@docmaps/graph/handle-config';

export interface TextBlockNodeData {
  label: string;
  content: string;
  color?: string;
}

export const TextBlockNode = memo(({ data, selected }: NodeProps<TextBlockNodeData>) => {
  const color = data.color || '#f59e0b';
  const hasContent = data.content && data.content !== '<p></p>' && data.content !== '';
  const handles = useMemo(() => getHandlesForNodeType('textBlock'), []);

  return (
    <div
      className={`group relative rounded-lg bg-white shadow-sm border border-gray-200 transition-all duration-200 ${
        selected ? 'ring-2 ring-blue-500 ring-offset-1 shadow-blue-50' : 'cursor-pointer hover:shadow-md'
      }`}
      style={{ 
        minWidth: hasContent ? '200px' : '200px',
        maxWidth: hasContent ? '400px' : '260px',
        width: hasContent ? 'auto' : '260px'
      }}
    >
      <HandleRenderer 
        handles={handles}
        handleClassName="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white transition-colors"
      />

      <div className="p-4">
        {/* Content - rendered as HTML with text wrapping */}
        <div 
          className="text-sm text-gray-700 leading-relaxed break-words [&_p]:my-1 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_li]:my-0.5 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-xs [&_code]:text-xs [&_h1]:text-base [&_h1]:font-semibold [&_h1]:my-1.5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:my-1 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:my-1"
          dangerouslySetInnerHTML={{ __html: hasContent ? data.content : '<p class="text-gray-400 italic">No content</p>' }}
        />
      </div>
    </div>
  );
});

TextBlockNode.displayName = 'TextBlockNode';
