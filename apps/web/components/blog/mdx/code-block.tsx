'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface CodeBlockProps {
  children: React.ReactNode
  filename?: string
  highlightLines?: number[]
  className?: string
}

export function CodeBlock({ children, filename, highlightLines = [], className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    // Extract text content from children
    const code = extractTextContent(children)
    
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="relative my-6 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {filename}
          </span>
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-md bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        
        <pre className={`overflow-x-auto p-4 ${className || ''}`}>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  )
}

// Helper function to extract text content from React children
function extractTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  
  if (Array.isArray(children)) {
    return children.map(extractTextContent).join('')
  }
  
  if (children && typeof children === 'object' && 'props' in children) {
    return extractTextContent((children as any).props.children)
  }
  
  return ''
}
