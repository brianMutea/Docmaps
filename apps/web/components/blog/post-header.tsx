'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import type { PostFrontmatter } from '@/lib/blog/schema';
import type { ReadingTime } from '@/lib/blog/mdx';

interface PostHeaderProps {
  frontmatter: PostFrontmatter;
  readingTime: ReadingTime;
}

/**
 * PostHeader component displays the header section of a blog post
 * 
 * Features:
 * - Post title (h1) for proper heading hierarchy
 * - Author information with avatar
 * - Publication date and reading time
 * - Tags as clickable links
 * - Featured image if available
 * - Responsive design matching DocMaps style
 * 
 * Requirements: 5.7, 6.7
 * 
 * @param frontmatter - Post frontmatter metadata
 * @param readingTime - Calculated reading time data
 */
export function PostHeader({ frontmatter, readingTime }: PostHeaderProps) {
  const { title, excerpt, author, date, tags, featuredImage } = frontmatter;

  return (
    <header className="mb-8">
      {/* Featured Image */}
      {featuredImage && (
        <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden bg-neutral-800">
          <Image
            src={featuredImage.src}
            alt={featuredImage.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
              className="inline-block px-3 py-1 text-sm font-medium rounded-md bg-blue-900/50 text-blue-300 hover:bg-blue-900/70 border border-blue-800/50 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
        {title}
      </h1>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-lg text-neutral-300 mb-6 leading-relaxed">
          {excerpt}
        </p>
      )}

      {/* Meta information */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-400 pb-6 border-b border-neutral-700">
        {/* Author */}
        <div className="flex items-center gap-3">
          {author.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-neutral-400" />
            </div>
          )}
          <div className="flex flex-col max-w-md">
            <span className="font-medium text-white">{author.name}</span>
            {author.bio && (
              <span className="text-xs text-neutral-400 line-clamp-2">{author.bio}</span>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <time dateTime={date}>
            {format(new Date(date), 'MMMM d, yyyy')}
          </time>
        </div>

        {/* Reading time */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{readingTime.text}</span>
        </div>
      </div>

      {/* Author social links (if available) */}
      {author.social && (
        <div className="flex items-center gap-4 mt-4 text-sm">
          {author.social.twitter && (
            <a
              href={`https://x.com/${author.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-primary-400 transition-colors"
            >
              X
            </a>
          )}
          {author.social.github && (
            <a
              href={`https://github.com/${author.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-primary-400 transition-colors"
            >
              GitHub
            </a>
          )}
          {author.social.linkedin && (
            <a
              href={`https://linkedin.com/in/${author.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-primary-400 transition-colors"
            >
              LinkedIn
            </a>
          )}
        </div>
      )}
    </header>
  );
}
