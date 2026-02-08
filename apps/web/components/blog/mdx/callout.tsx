import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'

type CalloutVariant = 'info' | 'warning' | 'success' | 'error'

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
}

const variantConfig = {
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-900 dark:text-blue-100',
    contentClass: 'text-blue-800 dark:text-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    titleClass: 'text-yellow-900 dark:text-yellow-100',
    contentClass: 'text-yellow-800 dark:text-yellow-200',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    iconClass: 'text-green-600 dark:text-green-400',
    titleClass: 'text-green-900 dark:text-green-100',
    contentClass: 'text-green-800 dark:text-green-200',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-900 dark:text-red-100',
    contentClass: 'text-red-800 dark:text-red-200',
  },
}

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={`rounded-lg border p-4 my-6 ${config.containerClass}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
        </div>
        <div className="flex-1 space-y-2">
          {title && (
            <div className={`font-semibold ${config.titleClass}`}>
              {title}
            </div>
          )}
          <div className={`text-sm ${config.contentClass}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
