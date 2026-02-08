'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface CollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className="my-6 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <CollapsiblePrimitive.Trigger className="flex w-full items-center justify-between bg-gray-50 dark:bg-gray-900 px-4 py-3 text-left font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <span className="text-gray-900 dark:text-gray-100">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </CollapsiblePrimitive.Trigger>

      <CollapsiblePrimitive.Content className="px-4 py-3 text-gray-700 dark:text-gray-300">
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}
