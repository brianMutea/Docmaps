import React from 'react';
import { componentUtils, createClassFactory } from '../theme/component-utils';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  icon?: React.ReactNode;
}

const badgeClasses = createClassFactory(componentUtils.badge.base, {
  variant: componentUtils.badge.variant,
});

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', dot = false, icon, className, children, ...props }, ref) => {
    const baseClasses = badgeClasses({ variant });

    const dotColors: Record<BadgeVariant, string> = {
      primary: 'bg-primary-500',
      accent: 'bg-accent-500',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
      neutral: 'bg-neutral-500',
    };

    return (
      <span ref={ref} className={`${baseClasses} ${className || ''}`} {...props}>
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
        {icon && <span>{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
