'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';
import { User, Mail, FileText } from 'lucide-react';
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

      // @ts-ignore - Supabase type inference issue with upsert
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
      {/* Profile Picture Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative h-28 w-28 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-xl">
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
            </div>

            {/* User Info */}
            <div className="flex-1 sm:mb-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {displayName || user.email}
              </h2>
              <p className="text-base text-gray-700 font-medium mb-1.5">{user.email}</p>
              {avatarUrl && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Profile picture synced from Google
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          <p className="text-base text-gray-600 mt-1.5">
            Update your personal details and how others see you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2.5">
              <Mail className="h-4 w-4 text-gray-400" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={user.email || ''}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 cursor-not-allowed font-medium"
            />
            <p className="mt-2.5 text-sm text-gray-500 flex items-center gap-1.5">
              <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your email address cannot be changed
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2.5">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <p className="mt-2.5 text-sm text-gray-500">
              This is how your name will appear on your maps and profile
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2.5">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
            />
            <div className="mt-2.5 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                A brief description about yourself and your work
              </p>
              <span
                className={`text-sm font-semibold ${
                  bioLength > maxBioLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
                }`}
              >
                {bioLength}/{maxBioLength}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/editor/dashboard')}
              className="w-full sm:w-auto rounded-lg border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
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
