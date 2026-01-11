'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
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
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Maximize2,
  Minimize2,
  X,
  Check,
  Unlink,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

// Create lowlight instance with essential languages
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

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  maxLength?: number;
}

export function TiptapEditor({
  content,
  onChange,
  maxLength = 5000,
}: TiptapEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: {
          HTMLAttributes: {
            class: 'tiptap-bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'tiptap-ordered-list',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700 cursor-pointer',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'tiptap-code-block',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      if (maxLength && text.length > maxLength) {
        return;
      }
      
      onChange(html);
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Handle link submission
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

  // Handle link button click
  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  }, [editor]);

  // Remove link
  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor]);

  if (!editor) {
    return null;
  }

  const charCount = editor.getText().length;
  const isMaxLength = maxLength && charCount >= maxLength;

  const renderToolbar = (showMinimize = false) => (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('bold') ? 'bg-gray-200' : ''
        }`}
        title="Bold"
        type="button"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('italic') ? 'bg-gray-200' : ''
        }`}
        title="Italic"
        type="button"
      >
        <Italic className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
        }`}
        title="Heading 1"
        type="button"
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
        }`}
        title="Heading 2"
        type="button"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
        }`}
        title="Heading 3"
        type="button"
      >
        <Heading3 className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('bulletList') ? 'bg-gray-200' : ''
        }`}
        title="Bullet List"
        type="button"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('orderedList') ? 'bg-gray-200' : ''
        }`}
        title="Ordered List"
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      
      {/* Link Button with Inline Input */}
      <div className="relative">
        <button
          onClick={handleLinkClick}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('link') ? 'bg-blue-100 text-blue-600' : ''
          }`}
          title="Add Link"
          type="button"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        
        {/* Link Input Popup */}
        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-72 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSetLink();
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }
                }}
                placeholder="https://example.com"
                autoFocus
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={handleSetLink}
                className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="Apply Link"
                type="button"
              >
                <Check className="h-4 w-4" />
              </button>
              {editor.isActive('link') && (
                <button
                  onClick={handleRemoveLink}
                  className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Remove Link"
                  type="button"
                >
                  <Unlink className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title="Cancel"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to apply, Escape to cancel
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('codeBlock') ? 'bg-gray-200' : ''
        }`}
        title="Code Block"
        type="button"
      >
        <Code className="h-4 w-4" />
      </button>
      <div className="flex-1" />
      {showMinimize ? (
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Minimize Editor"
          type="button"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Expand Editor"
          type="button"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const renderFooter = () => (
    <div className="border-t border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600 flex justify-between items-center">
      <span>Rich text with code blocks supported</span>
      <span className={isMaxLength ? 'text-red-600 font-medium' : ''}>
        {charCount}/{maxLength} characters
      </span>
    </div>
  );

  return (
    <>
      {/* Compact Editor */}
      {!isExpanded && (
        <div className="border border-gray-300 rounded-md overflow-hidden">
          {renderToolbar()}
          <div className="bg-white">
            <EditorContent editor={editor} />
          </div>
          {renderFooter()}
        </div>
      )}

      {/* Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsExpanded(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Description
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              {renderToolbar(true)}
              <div className="flex-1 bg-white overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <EditorContent editor={editor} />
                </div>
              </div>
              {renderFooter()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
