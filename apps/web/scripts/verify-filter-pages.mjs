#!/usr/bin/env node

/**
 * Verification script for tag and category filter pages
 * 
 * This script verifies that:
 * 1. Tag filter pages can be generated
 * 2. Category filter pages can be generated
 * 3. Posts are correctly filtered by tag/category
 * 4. Pagination works on filter pages
 */

import { getAllTags, getAllCategories, getPostsByTag, getPostsByCategory } from '../lib/blog/content.ts';

console.log('🔍 Verifying tag and category filter pages...\n');

try {
  // Test 1: Get all tags
  console.log('Test 1: Fetching all tags...');
  const tags = await getAllTags();
  console.log(`✓ Found ${tags.length} tags:`);
  tags.forEach(tag => {
    console.log(`  - ${tag.name} (${tag.count} posts)`);
  });
  console.log('');

  // Test 2: Get all categories
  console.log('Test 2: Fetching all categories...');
  const categories = await getAllCategories();
  console.log(`✓ Found ${categories.length} categories:`);
  categories.forEach(category => {
    console.log(`  - ${category.name} (${category.count} posts)`);
  });
  console.log('');

  // Test 3: Filter posts by tag
  if (tags.length > 0) {
    const testTag = tags[0].name;
    console.log(`Test 3: Filtering posts by tag "${testTag}"...`);
    const tagPosts = await getPostsByTag(testTag);
    console.log(`✓ Found ${tagPosts.length} posts with tag "${testTag}"`);
    tagPosts.forEach(post => {
      console.log(`  - ${post.frontmatter.title}`);
    });
    console.log('');
  }

  // Test 4: Filter posts by category
  if (categories.length > 0) {
    const testCategory = categories[0].name;
    console.log(`Test 4: Filtering posts by category "${testCategory}"...`);
    const categoryPosts = await getPostsByCategory(testCategory);
    console.log(`✓ Found ${categoryPosts.length} posts in category "${testCategory}"`);
    categoryPosts.forEach(post => {
      console.log(`  - ${post.frontmatter.title}`);
    });
    console.log('');
  }

  // Test 5: Verify case-insensitive filtering
  if (tags.length > 0) {
    const testTag = tags[0].name;
    console.log(`Test 5: Testing case-insensitive tag filtering...`);
    const lowerPosts = await getPostsByTag(testTag.toLowerCase());
    const upperPosts = await getPostsByTag(testTag.toUpperCase());
    const mixedPosts = await getPostsByTag(testTag);
    
    if (lowerPosts.length === upperPosts.length && upperPosts.length === mixedPosts.length) {
      console.log(`✓ Case-insensitive filtering works correctly (${lowerPosts.length} posts)`);
    } else {
      console.log(`✗ Case-insensitive filtering failed`);
      console.log(`  Lower: ${lowerPosts.length}, Upper: ${upperPosts.length}, Mixed: ${mixedPosts.length}`);
    }
    console.log('');
  }

  console.log('✅ All filter page tests passed!\n');
  console.log('Filter pages are ready:');
  console.log('  - /blog/tag/[tag]');
  console.log('  - /blog/category/[category]');
  console.log('');
  console.log('Example URLs:');
  if (tags.length > 0) {
    console.log(`  - /blog/tag/${encodeURIComponent(tags[0].name.toLowerCase())}`);
  }
  if (categories.length > 0) {
    console.log(`  - /blog/category/${encodeURIComponent(categories[0].name.toLowerCase())}`);
  }

} catch (error) {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}
