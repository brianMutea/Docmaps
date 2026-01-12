'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be less than 2MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Check for specific error types
      if (uploadError.message?.includes('Bucket not found') || 
          uploadError.message?.includes('bucket')) {
        return NextResponse.json({ 
          error: 'Logo storage not configured. Please create a "logos" bucket in Supabase Storage Dashboard.',
          code: 'BUCKET_NOT_FOUND'
        }, { status: 503 });
      }
      
      if (uploadError.message?.includes('row-level security') ||
          uploadError.message?.includes('policy')) {
        return NextResponse.json({ 
          error: 'Storage permissions not configured. Please set up RLS policies for the logos bucket.',
          code: 'PERMISSION_DENIED'
        }, { status: 403 });
      }

      return NextResponse.json({ 
        error: uploadError.message || 'Failed to upload logo',
        code: 'UPLOAD_FAILED'
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      url: publicUrl,
      path: uploadData.path 
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
