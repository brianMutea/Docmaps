'use client';

import { useEffect, useState, useRef } from 'react';
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
 * - Fixed positioning that stays within content bounds
 * 
 * @param headings - Array of heading objects extracted from MDX content
 */
export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isSticky, setIsSticky] = useState(false);
  const [stickyTop, setStickyTop] = useState(0);
  const [wasSticky, setWasSticky] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement | null>(null);

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

    // Handle scroll for sticky positioning
    const handleScroll = () => {
      if (!navRef.current) return;

      // Find the aside element (parent container)
      if (!asideRef.current) {
        asideRef.current = navRef.current.closest('aside');
      }

      if (!asideRef.current) return;

      const asideRect = asideRef.current.getBoundingClientRect();
      const navHeight = navRef.current.offsetHeight;
      const navbarHeight = 96; // top-24 = 6rem = 96px

      // Check if aside is in viewport
      const asideTop = asideRect.top;
      const asideBottom = asideRect.bottom;

      // If aside top is above navbar, make nav sticky
      if (asideTop <= navbarHeight) {
        if (!wasSticky) {
          setShowBounce(true);
          setWasSticky(true);
          // Clear bounce animation after it completes
          setTimeout(() => setShowBounce(false), 400);
        }
        setIsSticky(true);
        // Calculate how much space is available
        const availableSpace = asideBottom - navbarHeight;
        // Only stick if there's enough space
        if (availableSpace > navHeight) {
          setStickyTop(navbarHeight);
        } else {
          // If not enough space, position at bottom of aside
          setStickyTop(asideBottom - navHeight);
        }
      } else {
        setIsSticky(false);
        setWasSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once on mount to set initial state
    handleScroll();

    // Cleanup
    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings, wasSticky]);

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

  return (
    <nav 
      ref={navRef}
      className={`${
        isSticky ? 'fixed' : 'relative'
      } bg-neutral-800 rounded-xl border border-neutral-700 p-6 max-h-[calc(100vh-8rem)] overflow-y-auto transition-all duration-200 z-40 ${
        showBounce ? 'animate-toc-bounce' : ''
      }`}
      style={isSticky ? { top: `${stickyTop}px` } : {}}
    >
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
