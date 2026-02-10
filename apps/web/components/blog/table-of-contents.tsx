'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import type { Heading } from '@/lib/blog/mdx';

interface TableOfContentsProps {
  headings: Heading[];
}

/**
 * TableOfContents component displays a navigable list of headings
 * 
 * Features:
 * - Nested list based on heading levels (h2-h6)
 * - Smooth scroll to anchors on click
 * - Highlights current section based on scroll position
 * - Responsive design matching DocMaps style
 * - Sticky positioning for easy navigation
 * 
 * @param headings - Array of heading objects extracted from MDX content
 */
export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Get all heading elements in the document
    const headingElements = headings.map(({ slug }) => {
      return document.getElementById(slug);
    }).filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // Track which headings are currently visible
    const visibleHeadings = new Set<string>();

    // Intersection Observer to track which headings are currently visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleHeadings.add(entry.target.id);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        });

        // Find the topmost visible heading
        if (visibleHeadings.size > 0) {
          // Get the first visible heading in document order
          const firstVisibleHeading = headingElements.find(
            (el) => visibleHeadings.has(el.id)
          );
          if (firstVisibleHeading) {
            setActiveId(firstVisibleHeading.id);
          }
        }
      },
      {
        rootMargin: '-100px 0px -66% 0px', // Trigger when heading is near top of viewport
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    // Observe all heading elements
    headingElements.forEach((element) => {
      observer.observe(element);
    });

    // Cleanup observer on unmount
    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, [headings]);

  // Handle smooth scroll to heading
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    
    const element = document.getElementById(slug);
    if (element) {
      // Get the element's position
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 120; // Offset for fixed header
      
      // Smooth scroll to the calculated position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update URL hash without jumping
      window.history.pushState(null, '', `#${slug}`);
      
      // Update active state immediately
      setActiveId(slug);
    }
  };

  // Filter out h1 headings (typically the post title)
  const tocHeadings = headings.filter((h) => h.level > 1);

  if (tocHeadings.length === 0) {
    return null;
  }

  // Calculate indentation level based on heading hierarchy
  const getIndentClass = (level: number) => {
    // h2 = no indent, h3 = 1 level, h4 = 2 levels, etc.
    const indent = level - 2;
    return indent > 0 ? `ml-${indent * 4}` : '';
  };

  return (
    <nav className="sticky top-24 bg-neutral-800 rounded-xl border border-neutral-700 p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-700">
        <List className="h-4 w-4 text-neutral-400" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Table of Contents
        </h2>
      </div>

      {/* Headings list */}
      <ul className="space-y-2 text-sm">
        {tocHeadings.map((heading) => {
          const isActive = activeId === heading.slug;
          const indentLevel = heading.level - 2;
          
          return (
            <li
              key={heading.slug}
              style={{ paddingLeft: `${indentLevel * 1}rem` }}
            >
              <a
                href={`#${heading.slug}`}
                onClick={(e) => handleClick(e, heading.slug)}
                className={`
                  block py-1 px-2 rounded-md transition-all duration-150
                  hover:bg-neutral-700 hover:text-blue-400
                  ${
                    isActive
                      ? 'text-blue-400 font-medium bg-blue-900/30 border-l-2 border-blue-500 -ml-0.5 pl-1.5'
                      : 'text-neutral-300 border-l-2 border-transparent'
                  }
                `}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
