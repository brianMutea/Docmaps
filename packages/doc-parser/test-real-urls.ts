// Test script to debug real URL parsing with browser fetching
import { fetchWithBrowser } from './fetcher';
import { parseDocumentation } from './parser';

async function testRealUrls() {
  const testUrls = [
    'https://resend.com/docs/introduction',
    'https://docs.stripe.com/api',
    'https://supabase.com/docs',
    'https://docs.langchain.com/',
    'https://docs.flexprice.io/docs/welcome-to-flexprice',
    'https://docs.weaviate.io/weaviate',
  ];

  for (const url of testUrls) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${url}`);
    console.log('='.repeat(60));
    
    try {
      // Fetch with browser
      console.log('1. Fetching documentation with browser...');
      const fetchResult = await fetchWithBrowser(url);
      console.log(`   ✓ Fetched ${fetchResult.html.length} bytes`);
      console.log(`   ✓ Content type: ${fetchResult.contentType}`);
      
      // Parse
      console.log('\n2. Parsing documentation...');
      const parseResult = await parseDocumentation(fetchResult.html, fetchResult.url);
      
      console.log(`   ✓ Strategy used: ${parseResult.metadata.strategy}`);
      console.log(`   ✓ Confidence: ${parseResult.metadata.confidence.toFixed(2)}`);
      console.log(`   ✓ Nodes extracted: ${parseResult.metadata.stats.nodes_extracted}`);
      console.log(`   ✓ Nodes final: ${parseResult.metadata.stats.nodes_final}`);
      console.log(`   ✓ Edges extracted: ${parseResult.metadata.stats.edges_extracted}`);
      console.log(`   ✓ Duration: ${parseResult.metadata.stats.duration_ms}ms`);
      
      if (parseResult.nodes.length > 0) {
        console.log('\n3. Sample nodes:');
        parseResult.nodes.slice(0, 5).forEach((node, i) => {
          console.log(`   ${i + 1}. [${node.type.padEnd(10)}] ${node.data.label}`);
        });
      } else {
        console.log('\n3. ⚠️  NO NODES EXTRACTED!');
      }
      
      if (parseResult.metadata.warnings && parseResult.metadata.warnings.length > 0) {
        console.log('\n4. Warnings:');
        parseResult.metadata.warnings.forEach(w => console.log(`   - ${w}`));
      }
      
      // Check if it would pass the API validation
      const wouldPass = parseResult.nodes.length >= 3;
      console.log(`\n5. Would pass API validation (>=3 nodes): ${wouldPass ? '✓ YES' : '✗ NO'}`);
      
    } catch (error) {
      console.error(`\n✗ Error: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.stack) {
        console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n   ')}`);
      }
    }
  }
}

testRealUrls().catch(console.error);
