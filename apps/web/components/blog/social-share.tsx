'use client';

import { useState } from 'react';
import { Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
}

/**
 * SocialShare component displays social media share buttons
 * 
 * Features:
 * - Share buttons for Twitter, LinkedIn, and Facebook
 * - Copy link button with visual feedback
 * - Uses lucide-react icons
 * - Hover effects matching DocMaps design system
 * - Responsive layout
 * 
 * @param title - The post title to share
 * @param url - The full URL of the post
 */
export function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Encode title and URL for use in share URLs
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  // Social media share URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  // Handle copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Handle social share button click
  const handleShare = (platform: string) => {
    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  return (
    <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
      {/* Header */}
      <h3 className="text-sm font-semibold text-white mb-4">
        Share this post
      </h3>

      {/* Share buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Twitter */}
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-neutral-300 hover:bg-blue-900/50 hover:border-blue-700 hover:text-blue-300 transition-all duration-200 hover:shadow-sm"
          aria-label="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
          <span className="text-sm font-medium">Twitter</span>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-neutral-300 hover:bg-blue-900/50 hover:border-blue-700 hover:text-blue-300 transition-all duration-200 hover:shadow-sm"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span className="text-sm font-medium">LinkedIn</span>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-neutral-300 hover:bg-blue-900/50 hover:border-blue-700 hover:text-blue-300 transition-all duration-200 hover:shadow-sm"
          aria-label="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
          <span className="text-sm font-medium">Facebook</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
            ${
              copied
                ? 'bg-green-900/50 border-green-700 text-green-300'
                : 'bg-neutral-700 border-neutral-600 text-neutral-300 hover:bg-neutral-600 hover:border-neutral-500 hover:shadow-sm'
            }
          `}
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span className="text-sm font-medium">Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
