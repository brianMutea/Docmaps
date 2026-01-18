'use client';

import { useEffect } from 'react';
import { createClient } from '@docmaps/auth';
import { analytics } from '@docmaps/analytics';

interface ViewTrackerProps {
  mapId: string;
  userId: string | null;
  mapSlug?: string;
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export function ViewTracker({ mapId, userId, mapSlug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      // Check localStorage for last view time
      const storageKey = `map_view_${mapId}`;
      const lastViewed = localStorage.getItem(storageKey);
      const now = Date.now();

      // If viewed within last 24 hours, don't track
      if (lastViewed && (now - parseInt(lastViewed)) < TWENTY_FOUR_HOURS) {
        return;
      }

      // Track the view
      const supabase = createClient();
      
      try {
        // Insert view record
        const { error: viewError } = await supabase
          .from('map_views')
          // @ts-ignore - Supabase type inference issue
          .insert({ map_id: mapId, user_id: userId });

        if (viewError) {
          console.error('Error tracking view:', viewError);
          return;
        }

        // Increment view count
        // @ts-ignore - Supabase RPC type inference issue
        const { error: countError } = await supabase.rpc('increment_map_view_count', {
          map_id: mapId,
        });

        if (countError) {
          console.error('Error incrementing view count:', countError);
        }

        // Update localStorage with current timestamp
        localStorage.setItem(storageKey, now.toString());
        
        // Track analytics event
        analytics.trackMapViewed(mapId, mapSlug || '');
      } catch (error) {
        console.error('Error in view tracking:', error);
      }
    };

    trackView();
  }, [mapId, userId, mapSlug]);

  return null;
}
