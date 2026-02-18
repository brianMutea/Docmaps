# Test URLs for Map Generation

## Good Test URLs (Should Work)

These URLs have clear hierarchical structure and should generate maps successfully:

1. **Stripe API** - https://docs.stripe.com/api
   - Well-structured API documentation with clear product/feature hierarchy
   - Expected: 20-50 nodes

2. **AWS S3** - https://docs.aws.amazon.com/s3/
   - Complex service with multiple features and components
   - Expected: 15-40 nodes

3. **GitHub REST API** - https://docs.github.com/en/rest
   - Clear API structure with resources and endpoints
   - Expected: 25-60 nodes

4. **Supabase** - https://supabase.com/docs
   - Modern docs with good structure
   - Expected: 15-35 nodes

## Poor Test URLs (Will Fail)

These URLs lack sufficient structure for map generation:

1. **Resend Introduction** - https://resend.com/docs/introduction
   - Single introduction page with minimal hierarchy
   - Expected: 0-2 nodes (TOO_FEW_NODES error)

2. **Simple Getting Started Pages** - Most "introduction" or "getting started" pages
   - Usually just text content without structural hierarchy
   - Expected: Insufficient nodes

## Why Some URLs Fail

The map generation feature is designed for:
- Documentation with clear product/feature/component hierarchy
- Multiple interconnected pages or sections
- Structured content (headings, lists, navigation)

It will fail for:
- Single-page introductions
- Blog posts or articles
- Unstructured text content
- Pages with fewer than 3 extractable nodes

## Testing the Feature

1. Use one of the "Good Test URLs" above
2. The generation should take 10-30 seconds
3. You should see progress in the browser console
4. Upon completion, you'll be redirected to the editor with the generated map

## If You Still Get Errors

1. Check browser console for the actual error message
2. Look for "SSE event received:" logs to see what's happening
3. Check server logs for "Sending complete event with mapId:" message
4. Verify the database has the new map: `SELECT id, title FROM maps ORDER BY created_at DESC LIMIT 1;`
