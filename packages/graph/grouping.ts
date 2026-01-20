import type { Node } from 'reactflow';

/**
 * Group management utilities for DocMaps editor
 */

/**
 * Add nodes to an existing group
 */
export function addToGroup(
  nodes: Node[],
  groupId: string,
  nodeIdsToAdd: string[]
): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) {
    throw new Error('Group node not found');
  }

  const currentChildIds = groupNode.data.childNodeIds || [];
  const newChildIds = [...new Set([...currentChildIds, ...nodeIdsToAdd])];

  // Calculate new bounding box
  const childNodes = nodes.filter(n => newChildIds.includes(n.id));
  const padding = 40;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  childNodes.forEach(node => {
    const nodeWidth = node.width || 200;
    const nodeHeight = node.height || 100;
    
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  return nodes.map(node => {
    if (node.id === groupId) {
      return {
        ...node,
        position: {
          x: minX - padding,
          y: minY - padding,
        },
        data: {
          ...node.data,
          childNodeIds: newChildIds,
          childCount: newChildIds.length,
        },
        style: {
          ...node.style,
          width: maxX - minX + (padding * 2),
          height: maxY - minY + (padding * 2),
        },
      };
    }
    // Hide newly added nodes if group is collapsed
    if (nodeIdsToAdd.includes(node.id) && groupNode.data.collapsed) {
      return {
        ...node,
        hidden: true,
      };
    }
    return node;
  });
}

/**
 * Remove nodes from a group
 */
export function removeFromGroup(
  nodes: Node[],
  groupId: string,
  nodeIdsToRemove: string[]
): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) {
    throw new Error('Group node not found');
  }

  const currentChildIds = groupNode.data.childNodeIds || [];
  const newChildIds = currentChildIds.filter((id: string) => !nodeIdsToRemove.includes(id));

  // If no children left, could optionally delete the group
  if (newChildIds.length === 0) {
    return nodes.filter(n => n.id !== groupId);
  }

  // Recalculate bounding box
  const childNodes = nodes.filter(n => newChildIds.includes(n.id));
  const padding = 40;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  childNodes.forEach(node => {
    const nodeWidth = node.width || 200;
    const nodeHeight = node.height || 100;
    
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  return nodes.map(node => {
    if (node.id === groupId) {
      return {
        ...node,
        position: {
          x: minX - padding,
          y: minY - padding,
        },
        data: {
          ...node.data,
          childNodeIds: newChildIds,
          childCount: newChildIds.length,
        },
        style: {
          ...node.style,
          width: maxX - minX + (padding * 2),
          height: maxY - minY + (padding * 2),
        },
      };
    }
    // Show removed nodes
    if (nodeIdsToRemove.includes(node.id)) {
      return {
        ...node,
        hidden: false,
      };
    }
    return node;
  });
}

/**
 * Ungroup all nodes - removes the group and shows all children
 */
export function ungroupAll(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) {
    throw new Error('Group node not found');
  }

  const childNodeIds = groupNode.data.childNodeIds || [];

  return nodes
    .filter(n => n.id !== groupId) // Remove the group node
    .map(node => {
      // Show all child nodes
      if (childNodeIds.includes(node.id)) {
        return {
          ...node,
          hidden: false,
        };
      }
      return node;
    });
}

/**
 * Validate group operations
 */
export function validateGroupOperation(
  nodes: Node[],
  operation: 'create' | 'add' | 'remove',
  nodeIds: string[]
): { isValid: boolean; reason?: string } {
  // Prevent nested groups
  const hasGroupNode = nodeIds.some(id => {
    const node = nodes.find(n => n.id === id);
    return node?.type === 'group';
  });

  if (hasGroupNode && operation === 'create') {
    return {
      isValid: false,
      reason: 'Cannot create a group containing another group',
    };
  }

  if (hasGroupNode && operation === 'add') {
    return {
      isValid: false,
      reason: 'Cannot add a group to another group',
    };
  }

  // Check if nodes exist
  const allNodesExist = nodeIds.every(id => nodes.find(n => n.id === id));
  if (!allNodesExist) {
    return {
      isValid: false,
      reason: 'One or more nodes do not exist',
    };
  }

  return { isValid: true };
}

/**
 * Get all child nodes of a group (recursively if nested groups are supported in future)
 */
export function getGroupChildren(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) return [];

  const childNodeIds = groupNode.data.childNodeIds || [];
  return nodes.filter(n => childNodeIds.includes(n.id));
}

/**
 * Check if a node is part of any group
 */
export function isNodeInGroup(nodes: Node[], nodeId: string): boolean {
  return nodes.some(n => {
    if (n.type === 'group') {
      const childNodeIds = n.data.childNodeIds || [];
      return childNodeIds.includes(nodeId);
    }
    return false;
  });
}

/**
 * Get the parent group of a node (if any)
 */
export function getParentGroup(nodes: Node[], nodeId: string): Node | null {
  return nodes.find(n => {
    if (n.type === 'group') {
      const childNodeIds = n.data.childNodeIds || [];
      return childNodeIds.includes(nodeId);
    }
    return false;
  }) || null;
}

/**
 * Toggle group collapse state
 */
export function toggleGroupCollapse(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) {
    throw new Error('Group node not found');
  }

  const isCurrentlyCollapsed = groupNode.data.collapsed || false;
  const childNodeIds = groupNode.data.childNodeIds || [];

  return nodes.map(node => {
    if (node.id === groupId) {
      // Toggle the group's collapsed state and resize
      const newCollapsed = !isCurrentlyCollapsed;
      return {
        ...node,
        data: {
          ...node.data,
          collapsed: newCollapsed,
        },
        // When collapsed, make it a small card; when expanded, restore original size
        style: {
          ...node.style,
          width: newCollapsed ? 220 : (node.data.originalWidth || 400),
          height: newCollapsed ? 60 : (node.data.originalHeight || 300),
        },
      };
    }
    
    // Show/hide child nodes based on new collapsed state
    if (childNodeIds.includes(node.id)) {
      return {
        ...node,
        hidden: !isCurrentlyCollapsed, // If group was collapsed, show nodes; if expanded, hide nodes
      };
    }
    
    return node;
  });
}

/**
 * Collapse a group (hide all child nodes and shrink container)
 */
export function collapseGroup(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) {
    throw new Error('Group node not found');
  }

  const childNodeIds = groupNode.data.childNodeIds || [];

  return nodes.map(node => {
    if (node.id === groupId) {
      return {
        ...node,
        data: {
          ...node.data,
          collapsed: true,
          // Store original dimensions
          originalWidth: node.style?.width || node.width || 400,
          originalHeight: node.style?.height || node.height || 300,
        },
        // Make it a small card
        style: {
          ...node.style,
          width: 220,
          height: 60,
        },
      };
    }
    
    // Hide child nodes
    if (childNodeIds.includes(node.id)) {
      return {
        ...node,
        hidden: true,
      };
    }
    
    return node;
  });
}

/**
 * Expand a group (show all child nodes and restore container size)
 */
export function expandGroup(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) {
    throw new Error('Group node not found');
  }

  const childNodeIds = groupNode.data.childNodeIds || [];

  return nodes.map(node => {
    if (node.id === groupId) {
      return {
        ...node,
        data: {
          ...node.data,
          collapsed: false,
        },
        // Restore original size
        style: {
          ...node.style,
          width: node.data.originalWidth || 400,
          height: node.data.originalHeight || 300,
        },
      };
    }
    
    // Show child nodes
    if (childNodeIds.includes(node.id)) {
      return {
        ...node,
        hidden: false,
      };
    }
    
    return node;
  });
}
