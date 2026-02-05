import React from 'react';
import { componentUtils, createClassFactory } from '../theme/component-utils';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const buttonClasses = createClassFactory(componentUtils.button.base, {
  size: componentUtils.button.size,
  variant: componentUtils.button.variant,
});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = buttonClasses({ size, variant });
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${widthClass} ${disabledClass} ${className || ''}`}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && (
            <span className={isLoading ? 'animate-spin' : ''}>
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={isLoading ? 'animate-spin' : ''}>
              {icon}
            </span>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';
