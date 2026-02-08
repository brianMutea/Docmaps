import { Feed } from 'feed';
import { getAllPosts } from '@/lib/blog/content';
import { blogConfig } from '@/lib/blog/config';

/**
 * Atom Feed Route Handler
 * 
 * Generates an Atom 1.0 feed for all published blog posts.
 * Accessible at /atom.xml
 * 
 * Features:
 * - Includes all published posts (drafts excluded)
 * - Sorted by date (newest first)
 * - Includes post metadata (title, description, author, date, tags)
 * - Includes featured images when available
 * - Proper XML content-type header
 */
export async function GET() {
  try {
    const { siteMetadata, rss } = blogConfig;
    
    // Fetch all published posts
    const posts = await getAllPosts({
      includeDrafts: false,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    
    // Create feed instance
    const feed = new Feed({
      title: rss.title,
      description: rss.description,
      id: rss.siteUrl,
      link: rss.siteUrl,
      language: siteMetadata.language,
      image: `${rss.siteUrl}/images/og-image.png`,
      favicon: `${rss.siteUrl}/favicon.ico`,
      copyright: rss.copyright,
      updated: posts.length > 0 ? new Date(posts[0].frontmatter.date) : new Date(),
      generator: 'DocMaps Blog',
      feedLinks: {
        rss2: rss.feedUrl,
        atom: `${rss.siteUrl}/atom.xml`,
      },
      author: {
        name: blogConfig.defaultAuthor.name,
        link: rss.siteUrl,
      },
    });
    
    // Add each post to the feed
    posts.forEach((post) => {
      const { frontmatter, url, content } = post;
      const postUrl = `${rss.siteUrl}${url}`;
      
      feed.addItem({
        title: frontmatter.title,
        id: postUrl,
        link: postUrl,
        description: frontmatter.excerpt,
        content: content,
        author: [
          {
            name: frontmatter.author.name,
            link: frontmatter.author.social?.twitter
              ? `https://twitter.com/${frontmatter.author.social.twitter}`
              : undefined,
          },
        ],
        date: new Date(frontmatter.date),
        image: frontmatter.featuredImage
          ? `${rss.siteUrl}${frontmatter.featuredImage.src}`
          : undefined,
        category: frontmatter.tags.map((tag) => ({
          name: tag,
        })),
      });
    });
    
    // Generate Atom 1.0 XML
    const atomXml = feed.atom1();
    
    // Return XML response with proper content-type
    return new Response(atomXml, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Atom feed:', error);
    
    // Return error response
    return new Response('Error generating Atom feed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
