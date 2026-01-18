'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2, Upload, ImageIcon, Globe, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { createClient } from '@docmaps/auth';
import { isValidUrl } from '@docmaps/graph';
import { toast } from '@/lib/utils/toast';
import type { Map as MapType } from '@docmaps/database';

interface EditMapModalProps {
  map: MapType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedMap: MapType) => void;
}

interface FormErrors {
  title?: string;
  productName?: string;
  slug?: string;
  productUrl?: string;
  description?: string;
  logo?: string;
}

export function EditMapModal({ map, open, onOpenChange, onUpdate }: EditMapModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(map.title);
  const [productName, setProductName] = useState(map.product_name);
  const [productUrl, setProductUrl] = useState(map.product_url || '');
  const [description, setDescription] = useState(map.description || '');
  const [slug, setSlug] = useState(map.slug);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(map.logo_url);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when map changes or modal opens
  useEffect(() => {
    if (open) {
      setTitle(map.title);
      setProductName(map.product_name);
      setProductUrl(map.product_url || '');
      setDescription(map.description || '');
      setSlug(map.slug);
      setLogoPreview(map.logo_url);
      setLogoFile(null);
      setErrors({});
    }
  }, [map, open]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, logo: 'Please select an image file' }));
      return;
    }

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
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return logoPreview; // Keep existing logo if no new file

    try {
      const formData = new FormData();
      formData.append('file', logoFile);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'BUCKET_NOT_FOUND') {
          setErrors(prev => ({ ...prev, logo: 'Logo storage not configured' }));
        } else {
          setErrors(prev => ({ ...prev, logo: result.error || 'Failed to upload logo' }));
        }
        return logoPreview; // Keep existing logo on error
      }

      return result.url;
    } catch (err) {
      console.error('Logo upload error:', err);
      setErrors(prev => ({ ...prev, logo: 'Network error uploading logo' }));
      return logoPreview;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length > 100) newErrors.title = 'Title must be 100 characters or less';

    if (!productName.trim()) newErrors.productName = 'Product name is required';
    else if (productName.length > 100) newErrors.productName = 'Product name must be 100 characters or less';

    if (!slug.trim()) newErrors.slug = 'Slug is required';

    if (productUrl && !isValidUrl(productUrl)) newErrors.productUrl = 'Please enter a valid URL';

    if (description && description.length > 500) newErrors.description = 'Description must be 500 characters or less';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const logoUrl = await uploadLogo();
      const supabase = createClient();

      const { error } = await supabase
        .from('maps')
        // @ts-expect-error - Supabase type inference issue with JSONB columns
        .update({
          title: title.trim(),
          product_name: productName.trim(),
          product_url: productUrl.trim() || null,
          logo_url: logoUrl,
          description: description.trim() || null,
          slug: slug.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', map.id);

      if (error) {
        if (error.code === '23505') {
          setErrors({ slug: 'This slug is already taken' });
          return;
        }
        throw error;
      }

      const updatedMap: MapType = {
        ...map,
        title: title.trim(),
        product_name: productName.trim(),
        product_url: productUrl.trim() || null,
        logo_url: logoUrl,
        description: description.trim() || null,
        slug: slug.trim(),
        updated_at: new Date().toISOString(),
      };

      onUpdate(updatedMap);
      toast.success('Map updated successfully');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update map';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Map Details</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Map Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })); }}
              maxLength={100}
              className={`w-full rounded-lg border ${errors.title ? 'border-red-300' : 'border-gray-200'} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => { setProductName(e.target.value); setErrors(p => ({ ...p, productName: undefined })); }}
              maxLength={100}
              className={`w-full rounded-lg border ${errors.productName ? 'border-red-300' : 'border-gray-200'} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
            {errors.productName && <p className="mt-1 text-xs text-red-600">{errors.productName}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-gray-400" />
                URL Slug <span className="text-red-500">*</span>
              </div>
            </label>
            <div className="flex items-center rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 overflow-hidden">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">/maps/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setErrors(p => ({ ...p, slug: undefined })); }}
                className={`flex-1 px-3 py-2.5 text-sm focus:outline-none ${errors.slug ? 'bg-red-50' : ''}`}
              />
            </div>
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
          </div>

          {/* Product URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                Product URL <span className="text-gray-400 font-normal">(optional)</span>
              </div>
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => { setProductUrl(e.target.value); setErrors(p => ({ ...p, productUrl: undefined })); }}
              placeholder="https://example.com"
              className={`w-full rounded-lg border ${errors.productUrl ? 'border-red-300' : 'border-gray-200'} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
            />
            {errors.productUrl && <p className="mt-1 text-xs text-red-600">{errors.productUrl}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors(p => ({ ...p, description: undefined })); }}
              maxLength={500}
              rows={3}
              className={`w-full rounded-lg border ${errors.description ? 'border-red-300' : 'border-gray-200'} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none`}
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className={errors.description ? 'text-red-600' : 'text-gray-500'}>{errors.description || ''}</span>
              <span className="text-gray-400">{description.length}/500</span>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-gray-400" />
                Product Logo <span className="text-gray-400 font-normal">(optional)</span>
              </div>
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
            {logoPreview ? (
              <div className="relative w-full h-24 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden group">
                <Image src={logoPreview} alt="Logo preview" fill unoptimized className="object-contain p-3" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-gray-500 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-xs text-gray-500">Click to upload</span>
              </button>
            )}
            {errors.logo && <p className="mt-1 text-xs text-red-600">{errors.logo}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
