import { track } from '@vercel/analytics';

/**
 * Analytics utility for tracking user events on public site
 */

export const analytics = {
  /**
   * Track map viewed
   */
  trackMapViewed: (mapId: string, mapSlug: string) => {
    track('map_viewed', { 
      map_id: mapId,
      map_slug: mapSlug 
    });
  },

  /**
   * Track search performed
   */
  trackSearch: (query: string, resultsCount: number) => {
    track('search_performed', { 
      query,
      results_count: resultsCount 
    });
  },

  /**
   * Track node clicked in viewer
   */
  trackNodeClicked: (nodeType: string, mapId: string) => {
    track('node_clicked', { 
      node_type: nodeType,
      map_id: mapId 
    });
  },

  /**
   * Track map shared
   */
  trackMapShared: (mapId: string) => {
    track('map_shared', { map_id: mapId });
  },

  /**
   * Track embed code copied
   */
  trackEmbedCopied: (mapId: string) => {
    track('embed_copied', { map_id: mapId });
  },

  /**
   * Track filter used on browse page
   */
  trackFilterUsed: (filterType: 'views' | 'date' | 'title') => {
    track('filter_used', { filter_type: filterType });
  },
};
