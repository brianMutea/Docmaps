'use client';

import Image from 'next/image';
import { Calendar, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/lib/blog/content';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardMeta, CardBadge, CardHoverIndicator } from '@docmaps/ui';

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
    <Card href={url}>
      {/* Featured Image */}
      {frontmatter.featuredImage && (
        <CardHeader className="h-48">
          <Image
            src={frontmatter.featuredImage.src}
            alt={frontmatter.featuredImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </CardHeader>
      )}

      <CardContent>
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-4 right-4">
            <CardBadge variant="featured">Featured</CardBadge>
          </div>
        )}

        {/* Tags */}
        {frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <CardBadge key={tag} variant="default">{tag}</CardBadge>
            ))}
            {frontmatter.tags.length > 3 && (
              <CardBadge variant="default">+{frontmatter.tags.length - 3}</CardBadge>
            )}
          </div>
        )}

        {/* Title */}
        <CardTitle>{frontmatter.title}</CardTitle>

        {/* Excerpt */}
        {frontmatter.excerpt && (
          <CardDescription>{frontmatter.excerpt}</CardDescription>
        )}

        {/* Meta information */}
        <CardMeta>
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
        </CardMeta>

        {/* Hover indicator */}
        <CardHoverIndicator text="Read More" />
      </CardContent>
    </Card>
  );
}
