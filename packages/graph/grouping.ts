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
  const newCollapsed = !isCurrentlyCollapsed;

  // Store original positions when collapsing for the first time
  const childPositions: Record<string, { x: number; y: number }> = {};
  if (!isCurrentlyCollapsed && !groupNode.data.childPositions) {
    nodes.forEach(node => {
      if (childNodeIds.includes(node.id)) {
        childPositions[node.id] = { ...node.position };
      }
    });
  }

  return nodes.map(node => {
    if (node.id === groupId) {
      // Toggle the group's collapsed state and resize
      return {
        ...node,
        data: {
          ...node.data,
          collapsed: newCollapsed,
          // Store child positions when collapsing
          childPositions: !isCurrentlyCollapsed ? childPositions : node.data.childPositions,
        },
        // When collapsed, make it a small card; when expanded, restore original size
        style: {
          ...node.style,
          width: newCollapsed ? 220 : (node.data.originalWidth || 400),
          height: newCollapsed ? 60 : (node.data.originalHeight || 300),
        },
      };
    }
    
    // Show/hide child nodes and restore positions when expanding
    if (childNodeIds.includes(node.id)) {
      const storedPositions = groupNode.data.childPositions || {};
      return {
        ...node,
        hidden: newCollapsed,
        // Restore original position when expanding
        position: !newCollapsed && storedPositions[node.id] 
          ? storedPositions[node.id] 
          : node.position,
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
/**
 * Move group and all its child nodes together
 */
export function moveGroupWithChildren(
  nodes: Node[], 
  groupId: string, 
  deltaX: number, 
  deltaY: number
): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) return nodes;

  const childNodeIds = groupNode.data.childNodeIds || [];

  return nodes.map(node => {
    if (node.id === groupId) {
      // Move the group
      return {
        ...node,
        position: {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY,
        },
      };
    }
    
    // Move child nodes with the group
    if (childNodeIds.includes(node.id)) {
      return {
        ...node,
        position: {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY,
        },
      };
    }
    
    return node;
  });
}

/**
 * Check if a node is being moved outside its parent group bounds
 */
export function constrainNodeToGroup(
  nodes: Node[], 
  nodeId: string, 
  newPosition: { x: number; y: number }
): { x: number; y: number } {
  const parentGroup = getParentGroup(nodes, nodeId);
  if (!parentGroup) return newPosition;

  const node = nodes.find(n => n.id === nodeId);
  if (!node) return newPosition;

  const nodeWidth = node.width || 200;
  const nodeHeight = node.height || 100;
  const groupWidth = Number(parentGroup.style?.width) || parentGroup.width || 400;
  const groupHeight = Number(parentGroup.style?.height) || parentGroup.height || 300;
  const padding = 20;

  // Calculate group boundaries with proper padding
  const groupLeft = parentGroup.position.x + padding;
  const groupTop = parentGroup.position.y + padding + 60; // Extra space for group header
  const groupRight = parentGroup.position.x + groupWidth - padding;
  const groupBottom = parentGroup.position.y + groupHeight - padding;

  // Constrain node position to stay within group boundaries
  const constrainedX = Math.max(
    groupLeft, 
    Math.min(groupRight - nodeWidth, newPosition.x)
  );
  
  const constrainedY = Math.max(
    groupTop, 
    Math.min(groupBottom - nodeHeight, newPosition.y)
  );

  return {
    x: constrainedX,
    y: constrainedY,
  };
}

/**
 * Ensure all child nodes are properly positioned within their parent group
 */
export function ensureChildrenWithinGroup(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) return nodes;

  const childNodeIds = groupNode.data.childNodeIds || [];
  
  return nodes.map(node => {
    if (childNodeIds.includes(node.id)) {
      const constrainedPosition = constrainNodeToGroup(nodes, node.id, node.position);
      return {
        ...node,
        position: constrainedPosition,
      };
    }
    return node;
  });
}

/**
 * Recalculate group bounds to fit all child nodes with proper padding
 */
export function recalculateGroupBounds(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
  if (!groupNode) return nodes;

  const childNodeIds = groupNode.data.childNodeIds || [];
  const childNodes = nodes.filter(n => childNodeIds.includes(n.id));
  
  if (childNodes.length === 0) return nodes;

  const padding = 40;
  const headerHeight = 60;
  
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

  const newGroupWidth = maxX - minX + (padding * 2);
  const newGroupHeight = maxY - minY + (padding * 2) + headerHeight;

  return nodes.map(node => {
    if (node.id === groupId) {
      return {
        ...node,
        position: {
          x: minX - padding,
          y: minY - padding - headerHeight,
        },
        style: {
          ...node.style,
          width: newGroupWidth,
          height: newGroupHeight,
        },
        data: {
          ...node.data,
          originalWidth: newGroupWidth,
          originalHeight: newGroupHeight,
        },
      };
    }
    return node;
  });
}