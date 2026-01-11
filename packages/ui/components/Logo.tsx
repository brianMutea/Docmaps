import Image from 'next/image';
import { LOGO_IMAGE_PATH, LOGO_ALT_TEXT } from '@docmaps/config';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}

export function Logo({ className = '', size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const imageSizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
  };

  // If a centralized logo image is configured, render the image
  if (LOGO_IMAGE_PATH) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`relative ${imageSizeClasses[size]}`}>
          <Image
            src={LOGO_IMAGE_PATH}
            alt={LOGO_ALT_TEXT}
            width={200}
            height={200}
            className="h-full w-auto object-contain"
            priority
          />
        </div>
      </div>
    );
  }

  // Default text logo with variant support
  const textColors = variant === 'light' 
    ? { primary: 'text-white', secondary: 'text-white/90' }
    : { primary: 'text-blue-600', secondary: 'text-gray-900' };

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className={textColors.primary}>Doc</span>
      <span className={textColors.secondary}>Maps</span>
    </div>
  );
}
