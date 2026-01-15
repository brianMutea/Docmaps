'use client';

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import {
  Bold, Italic, List, ListOrdered, Link as LinkIcon, Code,
  Heading1, Heading2, Heading3, GripVertical, Check, Unlink, X,
} from 'lucide-react';

// Create lowlight instance
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('js', javascript);
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript);
lowlight.register('python', python);
lowlight.register('json', json);
lowlight.register('bash', bash);
lowlight.register('sh', bash);
lowlight.register('css', css);
lowlight.register('html', xml);
lowlight.register('xml', xml);
lowlight.register('sql', sql);

export interface TextBlockNodeData {
  label: string;
  content: string;
  color?: string;
}

export const TextBlockNode = memo(({ id, data, selected }: NodeProps<TextBlockNodeData>) => {
  const { setNodes } = useReactFlow();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const color = data.color || '#f59e0b';

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: { HTMLAttributes: { class: 'tiptap-bullet-list' } },
        orderedList: { HTMLAttributes: { class: 'tiptap-ordered-list' } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline hover:text-blue-700 cursor-pointer' },
      }),
      Placeholder.configure({
        placeholder: 'Click here to add content...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: 'tiptap-code-block' },
      }),
    ],
    content: data.content || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content prose prose-sm max-w-none focus:outline-none min-h-[60px] p-2 text-xs',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Don't save empty paragraph as content
      const isEmpty = html === '<p></p>' || html === '';
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, content: isEmpty ? '' : html } } : node
        )
      );
    },
  });

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  }, [editor]);

  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor]);

  if (!editor) return null;

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
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white group-hover:!bg-amber-400 transition-colors"
      />

      {/* Header - THIS IS THE DRAG HANDLE (use custom-drag-handle class) */}
      <div className="custom-drag-handle flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-t-xl cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {data.label || 'Text Block'}
        </span>
      </div>

      {/* Toolbar - always visible for easy access */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />

        {/* Link Button */}
        <div className="relative">
          <ToolbarButton
            onClick={handleLinkClick}
            active={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2 w-56 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSetLink(); }
                    if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); }
                  }}
                  placeholder="https://..."
                  autoFocus
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={handleSetLink} className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700" type="button">
                  <Check className="h-3 w-3" />
                </button>
                {editor.isActive('link') && (
                  <button onClick={handleRemoveLink} className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200" type="button">
                    <Unlink className="h-3 w-3" />
                  </button>
                )}
                <button onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} className="p-1 rounded hover:bg-gray-100" type="button">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor Content - nodrag class prevents dragging from this area */}
      <div ref={editorRef} className="nodrag bg-white cursor-text">
        <EditorContent editor={editor} />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-gray-300 !border-2 !border-white group-hover:!bg-amber-400 transition-colors"
      />
    </div>
  );
});

TextBlockNode.displayName = 'TextBlockNode';

// Toolbar button component
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`nodrag p-1.5 rounded hover:bg-gray-200 transition-colors ${active ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}
