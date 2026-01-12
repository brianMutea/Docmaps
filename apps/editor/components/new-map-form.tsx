'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileText, 
  Globe, 
  Link as LinkIcon, 
  Loader2, 
  AlertCircle,
  Layers,
  LayoutGrid,
  ArrowRight,
  Upload,
  X,
  ImageIcon
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { generateSlug, isValidUrl } from '@/lib/utils/validation';
import { analytics } from '@/lib/analytics';
import type { ViewType } from '@docmaps/database';

interface NewMapFormProps {
  userId: string;
}

interface FormErrors {
  title?: string;
  productName?: string;
  slug?: string;
  productUrl?: string;
  description?: string;
  logo?: string;
}

export function NewMapForm({ userId }: NewMapFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [viewType, setViewType] = useState<ViewType>('single');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) {
      setSlug(generateSlug(value));
    }
    if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugEdited(true);
    if (errors.slug) setErrors(prev => ({ ...prev, slug: undefined }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Please select an image file' }));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'Image must be less than 2MB' }));
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, logo: undefined }));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    setUploadingLogo(true);
    try {
      const supabase = createClient();
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      console.log('Uploading logo:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Logo upload error:', uploadError);
        // If bucket doesn't exist or other storage error, skip logo but don't fail
        if (uploadError.message?.includes('Bucket not found') || 
            uploadError.message?.includes('bucket') ||
            uploadError.message?.includes('storage')) {
          console.warn('Logo storage not configured. Skipping logo upload.');
          return null;
        }
        // For other errors, still continue without logo
        return null;
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (err) {
      console.error('Logo upload exception:', err);
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Upload logo if selected
      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const supabase = createClient();

      const { data, error: insertError } = await supabase
        .from('maps')
        // @ts-expect-error - Supabase type inference issue with JSONB columns
        .insert({
          user_id: userId,
          title: title.trim(),
          product_name: productName.trim(),
          product_url: productUrl.trim() || null,
          logo_url: logoUrl,
          description: description.trim() || null,
          slug: slug.trim(),
          nodes: [],
          edges: [],
          status: 'draft',
          view_type: viewType,
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

      // @ts-expect-error - Type inference issue
      analytics.trackMapCreated(data.id);
      // @ts-expect-error - Type inference issue
      router.push(`/editor/maps/${data.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create map';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Map Type Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Map Type</h3>
            <span className="text-red-500">*</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setViewType('single')}
              className={`relative rounded-xl border-2 p-5 text-left transition-all active:scale-[0.98] ${
                viewType === 'single'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {viewType === 'single' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <p className="font-semibold text-gray-900">Single View</p>
              <p className="text-sm text-gray-500 mt-1">One canvas for your documentation</p>
            </button>
            
            <button
              type="button"
              onClick={() => setViewType('multi')}
              className={`relative rounded-xl border-2 p-5 text-left transition-all active:scale-[0.98] ${
                viewType === 'multi'
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {viewType === 'multi' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <p className="font-semibold text-gray-900">Multi-View</p>
              <p className="text-sm text-gray-500 mt-1">Multiple canvases with navigation</p>
            </button>
          </div>
          {viewType === 'multi' && (
            <p className="mt-4 text-sm text-gray-500 bg-purple-50 rounded-lg px-4 py-3 border border-purple-100">
              💡 You&apos;ll configure views in the editor after creating the map.
            </p>
          )}
        </div>
      </div>

      {/* Map Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">Map Details</h3>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Map Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              maxLength={100}
              className={`block w-full rounded-xl border ${
                errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
              placeholder="e.g., LangChain Documentation Map"
            />
            <div className="mt-2 flex justify-between text-xs">
              <span className={errors.title ? 'text-red-600' : 'text-gray-500'}>
                {errors.title || ''}
              </span>
              <span className="text-gray-400">{title.length}/100</span>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                if (errors.productName) setErrors(prev => ({ ...prev, productName: undefined }));
              }}
              maxLength={100}
              className={`block w-full rounded-xl border ${
                errors.productName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
              placeholder="e.g., LangChain"
            />
            <div className="mt-2 flex justify-between text-xs">
              <span className={errors.productName ? 'text-red-600' : 'text-gray-500'}>
                {errors.productName || ''}
              </span>
              <span className="text-gray-400">{productName.length}/100</span>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                URL Slug <span className="text-red-500">*</span>
              </div>
            </label>
            <div className="flex items-center rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
              <span className="px-4 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-200 whitespace-nowrap">
                docmaps.io/maps/
              </span>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`flex-1 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none ${
                  errors.slug ? 'bg-red-50' : ''
                }`}
                placeholder="your-map-slug"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {errors.slug ? (
                <span className="text-red-600">{errors.slug}</span>
              ) : (
                'Auto-generated from title. Used in the public URL.'
              )}
            </p>
          </div>

          {/* Product URL */}
          <div>
            <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                Product URL <span className="text-gray-400 font-normal">(optional)</span>
              </div>
            </label>
            <input
              type="url"
              id="productUrl"
              value={productUrl}
              onChange={(e) => {
                setProductUrl(e.target.value);
                if (errors.productUrl) setErrors(prev => ({ ...prev, productUrl: undefined }));
              }}
              className={`block w-full rounded-xl border ${
                errors.productUrl ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all`}
              placeholder="https://langchain.com"
            />
            {errors.productUrl && (
              <p className="mt-2 text-xs text-red-600">{errors.productUrl}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
              }}
              maxLength={500}
              rows={3}
              className={`block w-full rounded-xl border ${
                errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              } px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-none transition-all`}
              placeholder="Brief description of what this map covers..."
            />
            <div className="mt-2 flex justify-between text-xs">
              <span className={errors.description ? 'text-red-600' : 'text-gray-500'}>
                {errors.description || ''}
              </span>
              <span className="text-gray-400">{description.length}/500</span>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-400" />
                Product Logo <span className="text-gray-400 font-normal">(optional)</span>
              </div>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoSelect}
              className="hidden"
            />
            {logoPreview ? (
              <div className="relative w-full h-32 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden group">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-contain p-4"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-gray-500 hover:text-red-500 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 transition-all"
              >
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload logo</span>
                <span className="text-xs text-gray-400">PNG, JPG up to 2MB</span>
              </button>
            )}
            {errors.logo && (
              <p className="mt-2 text-xs text-red-600">{errors.logo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Link
          href="/editor/dashboard"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create Map
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
