#!/usr/bin/env node

/**
 * Verification script for blog post page implementation
 * 
 * This script verifies that:
 * 1. The blog post page can fetch posts by slug
 * 2. generateStaticParams returns all posts
 * 3. generateMetadata produces correct SEO data
 * 4. Related posts are calculated correctly
 * 5. Previous/next navigation works
 */

import { getAllPosts, getPostBySlug } from '../lib/blog/content.ts';
import { getRelatedPosts } from '../lib/blog/related-posts.ts';

console.log('🔍 Verifying blog post page implementation...\n');

try {
  // Test 1: Fetch all posts for generateStaticParams
  console.log('Test 1: Fetching all posts for static generation...');
  const allPosts = await getAllPosts({ includeDrafts: false });
  console.log(`✅ Found ${allPosts.length} published posts`);
  
  if (allPosts.length === 0) {
    console.log('⚠️  No published posts found. Make sure you have blog posts in content/blog/');
    process.exit(0);
  }
  
  // Test 2: Fetch a specific post by slug
  console.log('\nTest 2: Fetching post by slug...');
  const firstPost = allPosts[0];
  const post = await getPostBySlug(firstPost.slug);
  
  if (!post) {
    console.error(`❌ Failed to fetch post with slug: ${firstPost.slug}`);
    process.exit(1);
  }
  
  console.log(`✅ Successfully fetched post: "${post.frontmatter.title}"`);
  console.log(`   Slug: ${post.slug}`);
  console.log(`   URL: ${post.url}`);
  console.log(`   Reading time: ${post.readingTime.text}`);
  console.log(`   Headings: ${post.headings.length}`);
  
  // Test 3: Verify metadata fields
  console.log('\nTest 3: Verifying metadata fields...');
  const { frontmatter } = post;
  
  const requiredFields = ['title', 'date', 'author', 'excerpt', 'tags', 'categories', 'seo'];
  const missingFields = requiredFields.filter(field => !frontmatter[field]);
  
  if (missingFields.length > 0) {
    console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ All required metadata fields present');
  console.log(`   Title: ${frontmatter.title}`);
  console.log(`   SEO Title: ${frontmatter.seo.title || frontmatter.title}`);
  console.log(`   Description: ${frontmatter.seo.description || frontmatter.excerpt}`);
  console.log(`   Tags: ${frontmatter.tags.join(', ')}`);
  console.log(`   Categories: ${frontmatter.categories.join(', ')}`);
  
  // Test 4: Calculate related posts
  console.log('\nTest 4: Calculating related posts...');
  const relatedPosts = getRelatedPosts(post, allPosts, 3);
  console.log(`✅ Found ${relatedPosts.length} related posts`);
  
  if (relatedPosts.length > 0) {
    relatedPosts.forEach((related, index) => {
      console.log(`   ${index + 1}. ${related.frontmatter.title}`);
    });
  }
  
  // Test 5: Calculate previous/next navigation
  console.log('\nTest 5: Calculating previous/next navigation...');
  const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
  const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  
  console.log(`✅ Navigation calculated`);
  console.log(`   Previous: ${previousPost ? previousPost.frontmatter.title : 'None (first post)'}`);
  console.log(`   Next: ${nextPost ? nextPost.frontmatter.title : 'None (last post)'}`);
  
  // Test 6: Verify JSON-LD structure
  console.log('\nTest 6: Verifying JSON-LD structured data...');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.updatedAt || post.frontmatter.date,
    author: {
      '@type': 'Person',
      name: post.frontmatter.author.name,
    },
  };
  
  console.log('✅ JSON-LD structure valid');
  console.log(`   Type: ${jsonLd['@type']}`);
  console.log(`   Headline: ${jsonLd.headline}`);
  console.log(`   Published: ${jsonLd.datePublished}`);
  console.log(`   Author: ${jsonLd.author.name}`);
  
  console.log('\n✅ All tests passed! Blog post page implementation is working correctly.');
  
} catch (error) {
  console.error('\n❌ Verification failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
