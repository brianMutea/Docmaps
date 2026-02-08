'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/blog/content';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

/**
 * PostCard component displays a blog post preview card
 * 
 * Features:
 * - Post title, excerpt, date, author, and tags
 * - Featured image with Next.js Image optimization
 * - Reading time indicator
 * - Link to full post page
 * - Hover effects matching DocMaps design system
 * - Responsive layout
 * 
 * @param post - The blog post data
 * @param featured - Whether to display as a featured post (optional)
 */
export function PostCard({ post, featured = false }: PostCardProps) {
  const { frontmatter, readingTime, url } = post;

  return (
    <Link
      href={url}
      className="relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 cursor-pointer group"
    >
      {/* Featured Image */}
      {frontmatter.featuredImage && (
        <div className="relative h-48 bg-gray-50 border-b border-gray-100">
          <Image
            src={frontmatter.featuredImage.src}
            alt={frontmatter.featuredImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              Featured
            </span>
          </div>
        )}

        {/* Tags */}
        {frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {frontmatter.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                +{frontmatter.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          {frontmatter.title}
        </h3>

        {/* Excerpt */}
        {frontmatter.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {frontmatter.excerpt}
          </p>
        )}

        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
          {/* Author */}
          <div className="flex items-center gap-1.5">
            {frontmatter.author.avatar ? (
              <Image
                src={frontmatter.author.avatar}
                alt={frontmatter.author.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
            <span>{frontmatter.author.name}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDistanceToNow(new Date(frontmatter.date), { addSuffix: true })}
            </span>
          </div>

          {/* Reading time */}
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{readingTime.text}</span>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Read More
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
