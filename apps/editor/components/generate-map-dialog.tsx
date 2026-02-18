'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Globe, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from '@/lib/utils/toast';

interface GenerateMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function GenerateMapDialog({ open, onOpenChange, userId }: GenerateMapDialogProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (urlString: string): boolean => {
    if (!urlString) {
      setError('Please enter a URL');
      return false;
    }

    try {
      const urlObj = new URL(urlString);
      if (urlObj.protocol !== 'https:') {
        setError('URL must use HTTPS protocol');
        return false;
      }
      setError(null);
      return true;
    } catch {
      setError('Please enter a valid URL');
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (error && newUrl) {
      validateUrl(newUrl);
    }
  };

  const handleGenerate = async () => {
    if (!validateUrl(url)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429) {
          setError(data.message || 'Rate limit exceeded. Please try again later.');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to start generation');
      }

      // SSE stream started successfully
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      let mapId: string | null = null;
      let buffer = ''; // Buffer for incomplete chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append to buffer and decode
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              console.log('SSE event received:', data);

              if (data.type === 'complete') {
                mapId = data.data?.mapId;
                console.log('Map ID received:', mapId);
                if (mapId) {
                  // Success! Close dialog and redirect to editor
                  toast.success('Map generated successfully!');
                  onOpenChange(false);
                  router.push(`/editor/maps/${mapId}?generated=true`);
                  return; // Exit early
                }
              } else if (data.type === 'error') {
                throw new Error(data.data?.message || 'Generation failed');
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError, 'Line:', line);
            }
          }
        }
      }

      // If we get here, stream ended without receiving mapId
      if (!mapId) {
        throw new Error('Generation completed but no map ID received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setUrl('');
      setError(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Generate Map from URL</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm text-gray-600">
          Enter a documentation URL to automatically generate a visual map. Works best with
          structured documentation sites like AWS, Stripe, or GitHub.
        </p>

        {/* URL Input */}
        <div className="mb-4">
          <label htmlFor="doc-url" className="mb-2 block text-sm font-medium text-gray-700">
            Documentation URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="doc-url"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://docs.example.com"
              disabled={loading}
              className={`w-full rounded-lg border ${
                error ? 'border-red-300' : 'border-gray-300'
              } py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500`}
            />
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mb-6 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-medium">What happens next:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-blue-700">
            <li>We&apos;ll fetch and analyze the documentation structure</li>
            <li>Extract products, features, and components</li>
            <li>Create a visual map with automatic layout</li>
            <li>You can edit and customize the generated map</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !url}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Map
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
