// Simple test for deep crawl strategy
import { fetchWithBrowser } from './fetcher';
import { deepCrawl } from './strategies/deep-crawl';

async function testDeepCrawl() {
  const url = 'https://docs.flexprice.io/docs/welcome-to-flexprice';
  
  console.log(`Testing deep crawl: ${url}\n`);
  
  try {
    const result = await deepCrawl(fetchWithBrowser, url, 5);
    
    console.log(`✓ Pages crawled: ${result.pagesCrawled}`);
    console.log(`✓ Nodes extracted: ${result.nodes.length}`);
    console.log(`✓ Edges extracted: ${result.edges.length}`);
    console.log(`✓ Confidence: ${result.confidence}\n`);
    
    console.log('Nodes by type:');
    const byType = result.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(byType);
    
    console.log('\nSample nodes:');
    result.nodes.slice(0, 15).forEach((node, i) => {
      console.log(`  ${i + 1}. [${node.type.padEnd(9)}] ${node.data.label}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDeepCrawl();
