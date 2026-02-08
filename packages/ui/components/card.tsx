import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

/**
 * Reusable card component with consistent styling
 * Used for map cards, blog post cards, and other content cards
 */
export function Card({ children, href, className = '' }: CardProps) {
  const cardClasses = `
    relative bg-white rounded-xl border border-gray-200 overflow-hidden 
    transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5 
    shadow-[0_2px_8px_rgba(0,0,0,0.04)]
    ${href ? 'cursor-pointer group' : ''}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {children}
      </Link>
    );
  }

  return <div className={cardClasses}>{children}</div>;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`relative h-24 bg-gray-50 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 line-clamp-3 mb-4 ${className}`}>
      {children}
    </p>
  );
}

interface CardMetaProps {
  children: React.ReactNode;
  className?: string;
}

export function CardMeta({ children, className = '' }: CardMetaProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

interface CardBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'featured' | 'primary';
  className?: string;
}

export function CardBadge({ children, variant = 'default', className = '' }: CardBadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    featured: 'bg-blue-100 text-blue-700',
    primary: 'bg-blue-600 text-white',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

/**
 * Card hover indicator - shows "Read More" or "View" text on hover
 */
export function CardHoverIndicator({ text = 'Read More' }: { text?: string }) {
  return (
    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
      {text}
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}
