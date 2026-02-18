// Quick test script to debug parser issues
const { fetchDocumentation, parseDocumentation } = require('./packages/doc-parser/dist/index.js');

async function testParser() {
  const testUrls = [
    'https://resend.com/docs/introduction',
    'https://docs.stripe.com/api',
    'https://supabase.com/docs',
  ];

  for (const url of testUrls) {
    console.log(`\n========== Testing: ${url} ==========`);
    
    try {
      // Fetch
      console.log('Fetching...');
      const fetchResult = await fetchDocumentation(url);
      console.log(`✓ Fetched ${fetchResult.html.length} bytes`);
      
      // Parse
      console.log('Parsing...');
      const parseResult = await parseDocumentation(fetchResult.html, fetchResult.url);
      
      console.log(`✓ Strategy: ${parseResult.metadata.strategy}`);
      console.log(`✓ Confidence: ${parseResult.metadata.confidence}`);
      console.log(`✓ Nodes extracted: ${parseResult.nodes.length}`);
      console.log(`✓ Edges extracted: ${parseResult.edges.length}`);
      
      if (parseResult.nodes.length > 0) {
        console.log('\nFirst 3 nodes:');
        parseResult.nodes.slice(0, 3).forEach((node, i) => {
          console.log(`  ${i + 1}. [${node.type}] ${node.data.label}`);
        });
      }
      
      if (parseResult.metadata.warnings && parseResult.metadata.warnings.length > 0) {
        console.log('\nWarnings:');
        parseResult.metadata.warnings.forEach(w => console.log(`  - ${w}`));
      }
      
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
    }
  }
}

testParser().catch(console.error);
