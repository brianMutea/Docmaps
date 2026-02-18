// Test deep crawl strategy
import { fetchWithBrowser } from './fetcher';
import { deepCrawl } from './strategies/deep-crawl';

async function testDeepCrawl() {
  const url = 'https://docs.flexprice.io/docs/welcome-to-flexprice';
  
  console.log(`Testing deep crawl: ${url}\n`);
  
  try {
    const result = await deepCrawl(fetchWithBrowser, url, 5);
    
    console.log(`\nResults:`);
    console.log(`  Pages crawled: ${result.pagesCrawled}`);
    console.log(`  Confidence: ${result.confidence}`);
    console.log(`  Nodes: ${result.nodes.length}`);
    console.log(`  Edges: ${result.edges.length}\n`);
    
    console.log('Extracted nodes:');
    result.nodes.forEach((node, i) => {
      console.log(`  ${i + 1}. [${node.type.padEnd(10)}] ${node.data.label}`);
    });
    
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

testDeepCrawl().catch(console.error);
