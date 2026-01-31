/**
 * Floating edge utilities for dynamic edge positioning
 * Based on ReactFlow's floating edges example
 */

import { Node, Position, XYPosition } from 'reactflow';

/**
 * Calculate the intersection point between two nodes
 */
function getNodeIntersection(intersectionNode: Node, targetNode: Node): XYPosition {
  const intersectionNodeWidth = intersectionNode.width ?? 0;
  const intersectionNodeHeight = intersectionNode.height ?? 0;
  const intersectionNodePosition = intersectionNode.position;
  
  const targetPosition = targetNode.position;
  
  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;
  
  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + (targetNode.width ?? 0) / 2;
  const y1 = targetPosition.y + (targetNode.height ?? 0) / 2;
  
  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;
  
  return { x, y };
}

/**
 * Determine which side of the node the edge should connect to
 */
function getEdgePosition(node: Node, intersectionPoint: XYPosition): Position {
  const nx = Math.round(node.position.x);
  const ny = Math.round(node.position.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);
  const width = node.width ?? 0;
  const height = node.height ?? 0;
  
  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny + height - 1) {
    return Position.Bottom;
  }
  
  return Position.Top;
}

/**
 * Get floating edge parameters for dynamic positioning
 */
export function getFloatingEdgeParams(source: Node, target: Node) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);
  
  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);
  
  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
