import { MetadataRoute } from 'next';
import { createServerClient } from '@docmaps/auth/server';
import { getAllPosts, getAllTags, getAllCategories } from '@/lib/blog/content';
import { blogConfig } from '@/lib/blog/config';

/**
 * Sitemap Generator
 * 
 * Generates a sitemap.xml file for the entire site including:
 * - Static pages (home, help, maps index, blog index)
 * - Published maps
 * - Published blog posts
 * - Blog tag pages
 * - Blog category pages
 * 
 * This improves SEO by helping search engines discover all pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = blogConfig.siteMetadata.siteUrl;
  const currentDate = new Date();
  
  const entries: MetadataRoute.Sitemap = [];
  
  // Static pages
  entries.push(
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/maps`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  );
  
  // Published maps
  try {
    const supabase = await createServerClient();
    const { data: maps } = await supabase
      .from('maps')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });
    
    if (maps && Array.isArray(maps)) {
      maps.forEach((map: { slug: string; updated_at: string }) => {
        entries.push({
          url: `${baseUrl}/maps/${map.slug}`,
          lastModified: new Date(map.updated_at),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error('Error fetching maps for sitemap:', error);
  }
  
  // Published blog posts
  try {
    const posts = await getAllPosts({
      includeDrafts: false,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    
    posts.forEach((post) => {
      const lastModified = post.frontmatter.updatedAt
        ? new Date(post.frontmatter.updatedAt)
        : new Date(post.frontmatter.date);
      
      entries.push({
        url: `${baseUrl}${post.url}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }
  
  // Blog tag pages
  try {
    const tags = await getAllTags(false);
    
    tags.forEach((tag) => {
      entries.push({
        url: `${baseUrl}/blog/tag/${encodeURIComponent(tag.name.toLowerCase())}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error('Error fetching tags for sitemap:', error);
  }
  
  // Blog category pages
  try {
    const categories = await getAllCategories(false);
    
    categories.forEach((category) => {
      entries.push({
        url: `${baseUrl}/blog/category/${encodeURIComponent(category.name.toLowerCase())}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }
  
  return entries;
}
