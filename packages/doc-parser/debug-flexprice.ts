// Debug Flexprice docs structure
import { fetchWithBrowser } from './fetcher';
import * as cheerio from 'cheerio';

async function debugFlexprice() {
  const url = 'https://docs.flexprice.io/docs/welcome-to-flexprice';
  
  console.log(`Fetching: ${url}\n`);
  const result = await fetchWithBrowser(url);
  
  const $ = cheerio.load(result.html);
  
  console.log('=== All Divs with Classes ===');
  $('div[class]').slice(0, 20).each((i, div) => {
    const classes = $(div).attr('class');
    const text = $(div).text().trim().substring(0, 50);
    console.log(`${classes}: ${text}...`);
  });
  
  console.log('\n=== All Links ===');
  const allLinks = $('a[href]');
  console.log(`Total links: ${allLinks.length}\n`);
  
  allLinks.slice(0, 30).each((i, link) => {
    const text = $(link).text().trim();
    const href = $(link).attr('href');
    if (text && text.length > 2 && text.length < 50) {
      console.log(`  ${text} → ${href}`);
    }
  });
  
  console.log('\n=== All Headings ===');
  $('h1, h2, h3, h4').each((i, h) => {
    const text = $(h).text().trim();
    if (text) {
      console.log(`  ${h.tagName}: ${text}`);
    }
  });
}

debugFlexprice().catch(console.error);
