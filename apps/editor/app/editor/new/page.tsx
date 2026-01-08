'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { generateSlug, isValidUrl } from '@/lib/utils/validation';
import { analytics } from '@/lib/analytics';
import { EditorNav } from '@/components/editor-nav';
import { TemplateSelector } from '@/components/template-selector';
import type { Template } from '@docmaps/database';

export default function NewMapPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    getUser();
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugEdited(true);
  };

  const handleTemplateSelect = (template: Template | null) => {
    setSelectedTemplate(template);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (productName.length > 100) {
      newErrors.productName = 'Product name must be 100 characters or less';
    }

    if (!slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (productUrl && !isValidUrl(productUrl)) {
      newErrors.productUrl = 'Please enter a valid URL';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('maps')
        // @ts-expect-error - Supabase type inference issue with JSONB columns
        .insert({
          user_id: user.id,
          title: title.trim(),
          product_name: productName.trim(),
          product_url: productUrl.trim() || null,
          description: description.trim() || null,
          slug: slug.trim(),
          nodes: selectedTemplate?.nodes || [],
          edges: selectedTemplate?.edges || [],
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          setErrors({ slug: 'This slug is already taken. Please choose another.' });
          return;
        }
        throw insertError;
      }

      // Track map creation
      // @ts-expect-error - Type inference issue
      analytics.trackMapCreated(data.id);

      // @ts-expect-error - Type inference issue
      router.push(`/editor/maps/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create map');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorNav userEmail={userEmail} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Map</h1>
          <p className="mt-2 text-gray-600">
            Create a visual documentation map for a product or framework
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start from Template
            </label>
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              {selectedTemplate ? (
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedTemplate.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedTemplate.description}</p>
                  <p className="text-xs text-blue-600 mt-2">Click to change template</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-gray-900">Choose a Template</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Start with a pre-built structure or blank canvas
                  </p>
                </div>
              )}
            </button>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Map Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              maxLength={100}
              className={`mt-1 block w-full rounded-md border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="e.g., LangChain Documentation Map"
            />
            <div className="mt-1 flex justify-between text-sm">
              <span className={errors.title ? 'text-red-600' : 'text-gray-500'}>
                {errors.title || ''}
              </span>
              <span className="text-gray-500">{title.length}/100</span>
            </div>
          </div>

          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              maxLength={100}
              className={`mt-1 block w-full rounded-md border ${
                errors.productName ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="e.g., LangChain"
            />
            <div className="mt-1 flex justify-between text-sm">
              <span className={errors.productName ? 'text-red-600' : 'text-gray-500'}>
                {errors.productName || ''}
              </span>
              <span className="text-gray-500">{productName.length}/100</span>
            </div>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                errors.slug ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="langchain-docs"
            />
            <p className="mt-1 text-sm text-gray-500">
              {errors.slug ? (
                <span className="text-red-600">{errors.slug}</span>
              ) : (
                'Auto-generated from title. Used in the public URL.'
              )}
            </p>
          </div>

          <div>
            <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700">
              Product URL (optional)
            </label>
            <input
              type="url"
              id="productUrl"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                errors.productUrl ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="https://langchain.com"
            />
            {errors.productUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.productUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              className={`mt-1 block w-full rounded-md border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Brief description of what this map covers..."
            />
            <div className="mt-1 flex justify-between text-sm">
              <span className={errors.description ? 'text-red-600' : 'text-gray-500'}>
                {errors.description || ''}
              </span>
              <span className="text-gray-500">{description.length}/500</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/editor/dashboard"
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Map'}
            </button>
          </div>
        </form>
      </main>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}
