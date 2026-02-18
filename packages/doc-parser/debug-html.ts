// Debug script to inspect HTML structure
import { fetchWithBrowser } from './fetcher';
import * as cheerio from 'cheerio';

async function debugHtml() {
  const url = 'https://resend.com/docs/introduction';
  
  console.log(`Fetching: ${url}\n`);
  const result = await fetchWithBrowser(url);
  
  const $ = cheerio.load(result.html);
  
  // Check for common documentation structures
  console.log('=== Navigation/Sidebar Structure ===');
  const navSelectors = [
    'nav',
    '[role="navigation"]',
    '.sidebar',
    '.navigation',
    '.nav',
    '.menu',
    'aside',
  ];
  
  navSelectors.forEach(selector => {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`\n${selector}: ${elements.length} found`);
      elements.slice(0, 2).each((i, el) => {
        const links = $(el).find('a');
        console.log(`  - Contains ${links.length} links`);
        links.slice(0, 5).each((j, link) => {
          const text = $(link).text().trim();
          const href = $(link).attr('href');
          if (text) console.log(`    • ${text} → ${href}`);
        });
      });
    }
  });
  
  console.log('\n=== Main Content Structure ===');
  const contentSelectors = [
    'main',
    '[role="main"]',
    'article',
    '.content',
    '.main-content',
  ];
  
  contentSelectors.forEach(selector => {
    const elements = $(selector);
    if (elements.length > 0) {
      console.log(`\n${selector}: ${elements.length} found`);
      elements.slice(0, 1).each((i, el) => {
        const headings = $(el).find('h1, h2, h3');
        console.log(`  - Contains ${headings.length} headings`);
        headings.slice(0, 10).each((j, h) => {
          const text = $(h).text().trim();
          const tag = h.tagName;
          if (text) console.log(`    ${tag}: ${text}`);
        });
      });
    }
  });
  
  console.log('\n=== All Links ===');
  const allLinks = $('a[href*="/docs"], a[href*="/api"]');
  console.log(`Found ${allLinks.length} documentation links`);
  allLinks.slice(0, 20).each((i, link) => {
    const text = $(link).text().trim();
    const href = $(link).attr('href');
    if (text && text.length < 50) {
      console.log(`  • ${text} → ${href}`);
    }
  });
}

debugHtml().catch(console.error);
