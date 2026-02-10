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
    containerClass: 'bg-blue-500/10 border-blue-500',
    iconClass: 'text-blue-400',
    titleClass: 'text-blue-300',
    contentClass: 'text-neutral-300',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-amber-500/10 border-amber-500',
    iconClass: 'text-amber-400',
    titleClass: 'text-amber-300',
    contentClass: 'text-neutral-300',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'bg-emerald-500/10 border-emerald-500',
    iconClass: 'text-emerald-400',
    titleClass: 'text-emerald-300',
    contentClass: 'text-neutral-300',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-rose-500/10 border-rose-500',
    iconClass: 'text-rose-400',
    titleClass: 'text-rose-300',
    contentClass: 'text-neutral-300',
  },
}

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={`rounded-lg border-l-4 p-4 my-4 ${config.containerClass}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
        </div>
        <div className="flex-1">
          {title && (
            <div className={`font-semibold text-sm mb-1 ${config.titleClass}`}>
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
