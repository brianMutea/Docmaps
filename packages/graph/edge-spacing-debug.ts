/**
 * Debug utilities for edge spacing
 * Add this temporarily to debug edge spacing issues
 */

import { Edge } from 'reactflow';
import { groupEdgesByConnection, calculateEdgeOffset, getEdgeOffset } from './edge-spacing';

export function debugEdgeSpacing(edges: Edge[]): void {
  console.group('🔍 Edge Spacing Debug');
  
  console.log('Total edges:', edges.length);
  
  const groups = groupEdgesByConnection(edges);
  console.log('Edge groups:', groups.size);
  
  groups.forEach((group, key) => {
    if (group.length > 1) {
      console.group(`📍 Group: ${key} (${group.length} edges)`);
      group.forEach((edge, index) => {
        const offset = calculateEdgeOffset(edge.id, group);
        console.log(`  Edge ${index}: ${edge.id}`);
        console.log(`    Type: ${edge.type || 'default'}`);
        console.log(`    Source: ${edge.source} (handle: ${edge.sourceHandle || 'none'})`);
        console.log(`    Target: ${edge.target} (handle: ${edge.targetHandle || 'none'})`);
        console.log(`    Calculated offset: ${offset}px`);
      });
      console.groupEnd();
    }
  });
  
  console.groupEnd();
}

export function logEdgeRender(edgeId: string, edges: Edge[], offset: number): void {
  console.log(`🎨 Rendering edge ${edgeId} with offset: ${offset}px (total edges: ${edges.length})`);
}
