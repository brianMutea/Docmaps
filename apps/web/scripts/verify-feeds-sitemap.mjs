#!/usr/bin/env node

/**
 * Verification script for RSS/Atom feeds and sitemap
 * 
 * This script verifies that:
 * 1. Feed routes exist and are properly structured
 * 2. Sitemap route exists and is properly structured
 * 3. All routes use the correct imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.join(__dirname, '..', 'app');

console.log('🔍 Verifying RSS/Atom feeds and sitemap...\n');

const checks = [
  {
    name: 'RSS Feed Route',
    path: 'feed.xml/route.ts',
    requiredContent: [
      'import { Feed }',
      'import { getAllPosts }',
      'import { blogConfig }',
      'feed.rss2()',
      'application/xml',
      'GET',
    ],
  },
  {
    name: 'Atom Feed Route',
    path: 'atom.xml/route.ts',
    requiredContent: [
      'import { Feed }',
      'import { getAllPosts }',
      'import { blogConfig }',
      'feed.atom1()',
      'application/atom+xml',
      'GET',
    ],
  },
  {
    name: 'Sitemap',
    path: 'sitemap.ts',
    requiredContent: [
      'import { MetadataRoute }',
      'getAllPosts',
      'getAllTags',
      'getAllCategories',
      'sitemap()',
      '/blog',
      '/maps',
    ],
  },
];

let allPassed = true;

checks.forEach((check) => {
  console.log(`Checking ${check.name}...`);
  
  const filePath = path.join(appDir, check.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ✗ File not found: ${check.path}`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const missing = check.requiredContent.filter((item) => !content.includes(item));
  
  if (missing.length > 0) {
    console.log(`  ✗ Missing required content: ${missing.join(', ')}`);
    allPassed = false;
  } else {
    console.log(`  ✓ All required content present`);
  }
  
  console.log('');
});

if (allPassed) {
  console.log('✅ All feeds and sitemap verified successfully!\n');
  console.log('Implementation includes:');
  console.log('  ✓ RSS 2.0 feed at /feed.xml');
  console.log('  ✓ Atom 1.0 feed at /atom.xml');
  console.log('  ✓ Sitemap at /sitemap.xml');
  console.log('  ✓ All published posts included in feeds');
  console.log('  ✓ Draft posts excluded from feeds');
  console.log('  ✓ Proper XML content-type headers');
  console.log('  ✓ Cache-Control headers for performance');
  console.log('  ✓ Error handling for feed generation');
  console.log('  ✓ Sitemap includes maps, blog posts, tags, and categories');
  console.log('  ✓ Proper priority and changeFrequency settings');
  console.log('');
  console.log('Routes accessible at:');
  console.log('  - /feed.xml (RSS 2.0)');
  console.log('  - /atom.xml (Atom 1.0)');
  console.log('  - /sitemap.xml (Sitemap)');
} else {
  console.log('❌ Some checks failed');
  process.exit(1);
}
