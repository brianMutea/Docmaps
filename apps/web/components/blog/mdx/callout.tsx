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
    containerClass: 'bg-blue-900/20 border-blue-500/30 shadow-lg shadow-blue-900/10',
    iconContainerClass: 'bg-blue-500/10 border-blue-500/20',
    iconClass: 'text-blue-400',
    titleClass: 'text-blue-300',
    contentClass: 'text-blue-200/90',
    accentClass: 'bg-gradient-to-r from-blue-500/50 to-transparent',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-yellow-900/20 border-yellow-500/30 shadow-lg shadow-yellow-900/10',
    iconContainerClass: 'bg-yellow-500/10 border-yellow-500/20',
    iconClass: 'text-yellow-400',
    titleClass: 'text-yellow-300',
    contentClass: 'text-yellow-200/90',
    accentClass: 'bg-gradient-to-r from-yellow-500/50 to-transparent',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-900/20 border-green-500/30 shadow-lg shadow-green-900/10',
    iconContainerClass: 'bg-green-500/10 border-green-500/20',
    iconClass: 'text-green-400',
    titleClass: 'text-green-300',
    contentClass: 'text-green-200/90',
    accentClass: 'bg-gradient-to-r from-green-500/50 to-transparent',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-red-900/20 border-red-500/30 shadow-lg shadow-red-900/10',
    iconContainerClass: 'bg-red-500/10 border-red-500/20',
    iconClass: 'text-red-400',
    titleClass: 'text-red-300',
    contentClass: 'text-red-200/90',
    accentClass: 'bg-gradient-to-r from-red-500/50 to-transparent',
  },
}

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={`relative rounded-xl border backdrop-blur-sm p-5 my-6 overflow-hidden ${config.containerClass}`}>
      {/* Accent gradient bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.accentClass}`} />
      
      <div className="flex gap-4">
        {/* Icon container with background */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${config.iconContainerClass}`}>
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-2 pt-0.5">
          {title && (
            <div className={`font-semibold text-base ${config.titleClass}`}>
              {title}
            </div>
          )}
          <div className={`text-sm leading-relaxed ${config.contentClass}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
