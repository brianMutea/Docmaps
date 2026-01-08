'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
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
} from 'lucide-react';
import { useEffect, useState } from 'react';

const lowlight = createLowlight(common);

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
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-md p-4 font-mono text-sm overflow-x-auto',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      // Enforce max length
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

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

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
      <button
        onClick={setLink}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('link') ? 'bg-gray-200' : ''
        }`}
        title="Add Link"
        type="button"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
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
      {/* Compact Editor - Only show when not expanded */}
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
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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
