import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@docmaps/auth/server';
import { fetchDocumentation, parseDocumentation, sleep } from '@docmaps/doc-parser';
import { applyLayout } from '@docmaps/graph/layout';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import type { NodeData, EdgeData } from '@docmaps/database';
import type { ExtractedNode, ExtractedEdge } from '@docmaps/doc-parser';

/**
 * POST /api/generate-map
 * Generate a map from a documentation URL using SSE streaming
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;

    // Validate request body
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid url field' },
        { status: 400 }
      );
    }

    // Authenticate user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check rate limits
    const userRateLimit = checkRateLimit(`user:${userId}`, {
      maxAttempts: 10,
      windowMs: 60 * 1000, // 10 requests per minute
    });

    if (!userRateLimit.allowed) {
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
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests from this IP. Please try again later.',
          resetTime: ipRateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Helper to send SSE events
          const sendEvent = (type: string, data?: unknown) => {
            const event = JSON.stringify({ type, data });
            controller.enqueue(encoder.encode(`data: ${event}\n\n`));
          };

          // Step 1: Fetch documentation
          sendEvent('status', { message: 'Fetching documentation...' });
          
          const fetchResult = await fetchDocumentation(url);
          
          if (fetchResult.statusCode !== 200) {
            sendEvent('error', {
              code: 'FETCH_FAILED',
              message: `Failed to fetch documentation (HTTP ${fetchResult.statusCode})`,
              recoverable: false,
            });
            controller.close();
            return;
          }

          // Step 2: Parse and extract
          sendEvent('status', { message: 'Analyzing structure...' });
          
          const parseResult = await parseDocumentation(fetchResult.html, fetchResult.url);

          if (parseResult.nodes.length === 0) {
            sendEvent('error', {
              code: 'NO_CONTENT',
              message: 'No content could be extracted from the documentation',
              recoverable: false,
            });
            controller.close();
            return;
          }

          if (parseResult.nodes.length < 3) {
            sendEvent('error', {
              code: 'TOO_FEW_NODES',
              message: 'Not enough content found to create a meaningful map',
              recoverable: false,
            });
            controller.close();
            return;
          }

          // Step 3: Stream nodes
          sendEvent('status', { message: 'Extracting nodes...' });
          
          for (const node of parseResult.nodes) {
            sendEvent('node', node);
            await sleep(100); // Throttle for visual effect
          }

          // Step 4: Stream edges
          sendEvent('status', { message: 'Extracting relationships...' });
          
          for (const edge of parseResult.edges) {
            sendEvent('edge', edge);
            await sleep(50); // Throttle for visual effect
          }

          // Step 5: Calculate layout
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

          sendEvent('layout', { nodes: layoutedNodes });

          // Step 6: Save to database
          sendEvent('status', { message: 'Saving map...' });

          // Generate slug from URL
          const urlObj = new URL(url);
          const hostname = urlObj.hostname.replace(/^www\./, '');
          const slug = `${hostname.split('.')[0]}-${Date.now()}`;

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
              metadata: {
                generation_metadata: {
                  source_url: url,
                  generated_at: new Date().toISOString(),
                  strategy: parseResult.metadata.strategy,
                  confidence: parseResult.metadata.confidence,
                  warnings: parseResult.metadata.warnings,
                  stats: parseResult.metadata.stats,
                  auto_generated_node_ids: parseResult.nodes.map((n: ExtractedNode) => n.id),
                },
              },
              published_at: null,
            })
            .select()
            .single();

          if (insertError || !map) {
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
          // @ts-ignore - Type inference issue
          sendEvent('complete', { mapId: map.id });
          controller.close();

        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const sendEvent = (type: string, data?: unknown) => {
            const event = JSON.stringify({ type, data });
            controller.enqueue(encoder.encode(`data: ${event}\n\n`));
          };
          sendEvent('error', {
            code: 'GENERATION_FAILED',
            message: 'An error occurred during map generation',
            details: errorMessage,
            recoverable: false,
          });
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
