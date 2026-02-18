// Quick test for Weaviate docs
import { fetchWithBrowser } from './fetcher';
import { parseHybrid } from './strategies/hybrid';

async function testWeaviate() {
  const url = 'https://docs.weaviate.io/weaviate';
  
  console.log(`Testing: ${url}\n`);
  
  try {
    console.log('1. Fetching...');
    const fetchResult = await fetchWithBrowser(url);
    console.log(`   ✓ Fetched ${fetchResult.html.length} bytes\n`);
    
    console.log('2. Testing hybrid strategy...');
    const result = parseHybrid(fetchResult.html, fetchResult.url);
    
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Nodes: ${result.nodes.length}\n`);
    
    console.log('3. Extracted nodes:');
    result.nodes.forEach((node, i) => {
      console.log(`   ${i + 1}. [${node.type.padEnd(10)}] ${node.data.label}`);
    });
    
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

testWeaviate().catch(console.error);
