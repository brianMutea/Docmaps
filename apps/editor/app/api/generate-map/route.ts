import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@docmaps/auth/server';
import { fetchWithBrowser, parseDocumentation, sleep } from '@docmaps/doc-parser';
import { applyLayout } from '@docmaps/graph/layout';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import type { NodeData, EdgeData } from '@docmaps/database';
import type { ExtractedNode, ExtractedEdge } from '@docmaps/doc-parser';

/**
 * POST /api/generate-map
 * Generate a map from a documentation URL using SSE streaming
 */
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/generate-map called');
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;
    console.log('[API] Request URL:', url);

    // Validate request body
    if (!url || typeof url !== 'string') {
      console.log('[API] Invalid URL provided');
      return NextResponse.json(
        { error: 'Missing or invalid url field' },
        { status: 400 }
      );
    }

    // Authenticate user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[API] Authentication failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log('[API] User authenticated:', userId);

    // Check rate limits
    const userRateLimit = checkRateLimit(`user:${userId}`, {
      maxAttempts: 10,
      windowMs: 60 * 1000, // 10 requests per minute
    });

    if (!userRateLimit.allowed) {
      console.log('[API] User rate limit exceeded');
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many generation requests. Please try again later.',
          resetTime: userRateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // Get client IP for additional rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ipRateLimit = checkRateLimit(`ip:${ip}`, {
      maxAttempts: 20,
      windowMs: 60 * 1000, // 20 requests per minute
    });

    if (!ipRateLimit.allowed) {
      console.log('[API] IP rate limit exceeded');
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests from this IP. Please try again later.',
          resetTime: ipRateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    console.log('[API] Rate limits passed, starting SSE stream');

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send SSE events
        const sendEvent = (type: string, data?: unknown) => {
          try {
            const event = JSON.stringify({ type, data });
            console.log('[SSE] Sending event:', type, data);
            controller.enqueue(encoder.encode(`data: ${event}\n\n`));
          } catch (e) {
            console.error('[SSE] Error sending event:', e);
          }
        };

        // Set a timeout for the entire generation process (5 minutes max)
        const timeoutId = setTimeout(() => {
          console.log('[API] Generation timeout after 5 minutes');
          sendEvent('error', {
            code: 'TIMEOUT',
            message: 'Generation took too long. Please try again with a simpler documentation page.',
            recoverable: false,
          });
          controller.close();
        }, 5 * 60 * 1000);

        try {
          // Step 1: Fetch documentation with browser
          console.log('[API] Step 1: Fetching documentation');
          sendEvent('status', { message: 'Launching browser and fetching documentation...' });
          
          const fetchStartTime = Date.now();
          const fetchResult = await fetchWithBrowser(url);
          const fetchDuration = Date.now() - fetchStartTime;
          console.log('[API] Fetch result:', { statusCode: fetchResult.statusCode, htmlLength: fetchResult.html.length, duration: fetchDuration });
          
          if (fetchResult.statusCode !== 200) {
            console.log('[API] Fetch failed with status:', fetchResult.statusCode);
            sendEvent('error', {
              code: 'FETCH_FAILED',
              message: `Failed to fetch documentation (HTTP ${fetchResult.statusCode})`,
              recoverable: false,
            });
            controller.close();
            return;
          }

          // Step 2: Parse and extract
          console.log('[API] Step 2: Parsing documentation');
          sendEvent('status', { message: 'Analyzing structure...' });
          
          const parseStartTime = Date.now();
          // Disable deep crawl by default to avoid timeouts - use faster strategies
          const parseResult = await parseDocumentation(fetchResult.html, fetchResult.url, false);
          const parseDuration = Date.now() - parseStartTime;
          console.log('[API] Parse result:', { nodesCount: parseResult.nodes.length, edgesCount: parseResult.edges.length, duration: parseDuration, strategy: parseResult.metadata.strategy });

          if (parseResult.nodes.length === 0) {
            console.log('[API] No nodes extracted');
            sendEvent('error', {
              code: 'NO_CONTENT',
              message: 'No content could be extracted from the documentation. The page may not have a clear hierarchical structure.',
              recoverable: false,
            });
            controller.close();
            return;
          }

          // Step 3: Stream nodes
          console.log('[API] Step 3: Streaming nodes');
          sendEvent('status', { message: 'Extracting nodes...' });
          
          for (const node of parseResult.nodes) {
            sendEvent('node', node);
            await sleep(100); // Throttle for visual effect
          }

          // Step 4: Stream edges
          console.log('[API] Step 4: Streaming edges');
          sendEvent('status', { message: 'Extracting relationships...' });
          
          for (const edge of parseResult.edges) {
            sendEvent('edge', edge);
            await sleep(50); // Throttle for visual effect
          }

          // Step 5: Calculate layout
          console.log('[API] Step 5: Calculating layout');
          sendEvent('status', { message: 'Calculating layout...' });

          // Convert ExtractedNode to NodeData format for layout
          const nodesForLayout = parseResult.nodes.map((node: ExtractedNode) => ({
            id: node.id,
            type: node.type,
            position: { x: 0, y: 0 }, // Will be calculated by layout
            data: node.data,
          }));

          // Convert ExtractedEdge to EdgeData format for layout
          const edgesForLayout = parseResult.edges.map((edge: ExtractedEdge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            label: edge.label,
            floating: edge.floating,
            style: edge.style,
          }));

          const layoutedNodes = applyLayout(nodesForLayout, edgesForLayout);
          console.log('[API] Layout calculated:', { nodesCount: layoutedNodes.length });

          sendEvent('layout', { nodes: layoutedNodes });

          // Step 6: Save to database
          console.log('[API] Step 6: Saving to database');
          sendEvent('status', { message: 'Saving map...' });

          // Generate slug from URL
          const urlObj = new URL(url);
          const hostname = urlObj.hostname.replace(/^www\./, '');
          const slug = `${hostname.split('.')[0]}-${Date.now()}`;

          console.log('[API] Generated slug:', slug);

          // Create map record
          // @ts-ignore - Supabase type inference issue with JSONB columns
          const { data: map, error: insertError } = await supabase
            .from('maps')
            // @ts-ignore - Type inference issue
            .insert({
              user_id: userId,
              slug,
              title: `Generated from ${hostname}`,
              product_name: hostname,
              product_url: url,
              description: `Auto-generated map from ${url}`,
              status: 'draft',
              view_type: 'single',
              nodes: layoutedNodes as NodeData[],
              edges: edgesForLayout as EdgeData[],
              metadata: {},
              generation_metadata: {
                source_url: url,
                generated_at: new Date().toISOString(),
                strategy: parseResult.metadata.strategy,
                confidence: parseResult.metadata.confidence,
                warnings: parseResult.metadata.warnings,
                stats: parseResult.metadata.stats,
                auto_generated_node_ids: parseResult.nodes.map((n: ExtractedNode) => n.id),
              },
              published_at: null,
            })
            .select()
            .single();

          console.log('[API] Database insert result:', { mapId: (map as any)?.id, error: insertError?.message });

          if (insertError || !map) {
            console.log('[API] Database insert failed:', insertError);
            sendEvent('error', {
              code: 'DATABASE_ERROR',
              message: 'Failed to save map to database',
              details: insertError?.message,
              recoverable: false,
            });
            controller.close();
            return;
          }

          // Step 7: Complete
          const mapId = (map as any).id as string;
          console.log('[API] Generation complete, mapId:', mapId);
          sendEvent('complete', { mapId });
          clearTimeout(timeoutId);
          controller.close();

        } catch (error: unknown) {
          console.log('[API] Error in SSE stream:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const errorStack = error instanceof Error ? error.stack : '';
          console.log('[API] Error stack:', errorStack);
          
          sendEvent('error', {
            code: 'GENERATION_FAILED',
            message: 'An error occurred during map generation',
            details: errorMessage,
            recoverable: false,
          });
          clearTimeout(timeoutId);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.log('[API] Error in POST handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
