// Analytics tracking utilities for DocMaps
// This package provides unified analytics tracking across all apps

import { track } from '@vercel/analytics';

/**
 * Analytics utility for tracking user events
 */
export const analytics = {
  // Editor events
  trackSignUp: (method: 'email' | 'google') => {
    track('sign_up', { method });
  },

  trackMapCreated: (mapId: string) => {
    track('map_created', { map_id: mapId });
  },

  trackMapPublished: (mapId: string) => {
    track('map_published', { map_id: mapId });
  },

  trackNodeAdded: (nodeType: 'product' | 'feature' | 'component' | 'textBlock' | 'group') => {
    track('node_added', { node_type: nodeType });
  },

  trackMapSaved: (mapId: string) => {
    track('map_saved', { map_id: mapId });
  },

  trackMapDuplicated: (originalMapId: string, newMapId: string) => {
    track('map_duplicated', {
      original_map_id: originalMapId,
      new_map_id: newMapId
    });
  },

  trackMapDeleted: (mapId: string) => {
    track('map_deleted', { map_id: mapId });
  },

  trackAutoLayout: (direction: 'TB' | 'LR') => {
    track('auto_layout_used', { direction });
  },

  trackMapExported: (mapId: string, format: 'svg') => {
    track('map_exported', { map_id: mapId, format });
  },

  // Viewer events
  trackMapViewed: (mapId: string, mapSlug: string) => {
    track('map_viewed', {
      map_id: mapId,
      map_slug: mapSlug
    });
  },

  trackSearch: (query: string, resultsCount: number) => {
    track('search_performed', {
      query,
      results_count: resultsCount
    });
  },

  trackNodeClicked: (nodeType: string, mapId: string) => {
    track('node_clicked', {
      node_type: nodeType,
      map_id: mapId
    });
  },

  trackMapShared: (mapId: string) => {
    track('map_shared', { map_id: mapId });
  },

  trackEmbedCopied: (mapId: string) => {
    track('embed_copied', { map_id: mapId });
  },

  trackFilterUsed: (filterType: 'views' | 'date' | 'title') => {
    track('filter_used', { filter_type: filterType });
  },
};
