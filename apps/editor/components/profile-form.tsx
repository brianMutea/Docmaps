'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { User, Mail, FileText, Loader2, Camera } from 'lucide-react';
import { createClient } from '@docmaps/auth';
import type { Profile } from '@docmaps/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileFormProps {
  user: SupabaseUser;
  profile: Profile | null;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState(
    profile?.display_name || user.user_metadata?.display_name || ''
  );
  const [bio, setBio] = useState(profile?.bio || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // @ts-expect-error - Supabase type inference issue with upsert
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Profile updated', {
        description: 'Your profile has been saved successfully',
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const bioLength = bio.length;
  const maxBioLength = 500;
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0] || 'U').toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Cover Gradient */}
        <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
            {/* Avatar */}
            <div className="relative group">
              <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-xl ring-4 ring-white">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName || user.email || 'User'}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              {/* Avatar overlay hint */}
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-not-allowed">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 sm:mb-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {displayName || user.email?.split('@')[0]}
              </h2>
              <p className="text-gray-500">{user.email}</p>
              {avatarUrl && (
                <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  </svg>
                  Synced from Google
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-500 mt-1">
            Update your personal details and how others see you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={user.email || ''}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your email address cannot be changed
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 text-gray-400" />
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <p className="mt-2 text-xs text-gray-400">
              This is how your name will appear on your maps and profile
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 text-gray-400" />
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              maxLength={maxBioLength}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                A brief description about yourself and your work
              </p>
              <span
                className={`text-xs font-medium ${
                  bioLength > maxBioLength * 0.9 ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {bioLength}/{maxBioLength}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/editor/dashboard')}
              className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
