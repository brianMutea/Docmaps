import { track } from '@vercel/analytics';

/**
 * Analytics utility for tracking user events
 */

export const analytics = {
  /**
   * Track user sign up
   */
  trackSignUp: (method: 'email' | 'google') => {
    track('sign_up', { method });
  },

  /**
   * Track map creation
   */
  trackMapCreated: (mapId: string) => {
    track('map_created', { map_id: mapId });
  },

  /**
   * Track map published
   */
  trackMapPublished: (mapId: string) => {
    track('map_published', { map_id: mapId });
  },

  /**
   * Track node added
   */
  trackNodeAdded: (nodeType: 'product' | 'feature' | 'component') => {
    track('node_added', { node_type: nodeType });
  },

  /**
   * Track map saved
   */
  trackMapSaved: (mapId: string) => {
    track('map_saved', { map_id: mapId });
  },

  /**
   * Track map duplicated
   */
  trackMapDuplicated: (originalMapId: string, newMapId: string) => {
    track('map_duplicated', { 
      original_map_id: originalMapId,
      new_map_id: newMapId 
    });
  },

  /**
   * Track map deleted
   */
  trackMapDeleted: (mapId: string) => {
    track('map_deleted', { map_id: mapId });
  },

  /**
   * Track auto-layout used
   */
  trackAutoLayout: (direction: 'TB' | 'LR') => {
    track('auto_layout_used', { direction });
  },

  /**
   * Track map exported
   */
  trackMapExported: (mapId: string, format: 'svg') => {
    track('map_exported', { map_id: mapId, format });
  },
};
