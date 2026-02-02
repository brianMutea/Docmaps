import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph direction (TB = top-bottom, LR = left-right)
  dagreGraph.setGraph({ rankdir: direction });

  // Add nodes to the graph with their dimensions
  nodes.forEach((node) => {
    // Different node types have different sizes
    const width = node.type === 'product' ? 250 : node.type === 'component' ? 200 : 180;
    const height = node.type === 'product' ? 100 : node.type === 'component' ? 80 : 60;
    
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Map nodes with new positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = nodeWithPosition.width;
    const height = nodeWithPosition.height;

    return {
      ...node,
      position: {
        // Center the node at the calculated position
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return layoutedNodes;
}
