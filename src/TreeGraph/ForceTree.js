import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

/**
 * Calculates a fixed tree layout for nodes.
 * @param {Array} nodes - List of nodes.
 * @param {Array} links - List of links connecting the nodes.
 * @param {number} levelHeight - Vertical distance between levels.
 * @param {number} siblingSpacing - Horizontal distance between sibling nodes.
 * @returns Updated graph data with node positions.
 */
const calculateTreeLayout = (
  nodes,
  links,
  levelHeight = 100,
  siblingSpacing = 150
) => {
  const nodesById = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const childrenMap = {};

  // Create a map of children for each node
  links.forEach((link) => {
    const { source, target } = link;
    if (!childrenMap[source]) childrenMap[source] = [];
    childrenMap[source].push(target);
  });

  const assignPositions = (nodeId, level = 0, xOffset = 0) => {
    const node = nodesById[nodeId];
    if (!node) return xOffset;

    // Set node position
    node.level = level;
    node.y = level * levelHeight;

    const children = childrenMap[nodeId] || [];
    if (children.length === 0) {
      // Leaf node: Assign current xOffset and return next position
      node.x = xOffset;
      return xOffset + siblingSpacing;
    }

    // Non-leaf node: Position children and center parent above them
    let currentXOffset = xOffset;
    const childPositions = children.map((childId) => {
      currentXOffset = assignPositions(childId, level + 1, currentXOffset);
      return nodesById[childId].x;
    });

    // Center parent above its children
    node.x = (Math.min(...childPositions) + Math.max(...childPositions)) / 2;

    return currentXOffset;
  };

  assignPositions('parent'); // Start from the root node

  return {
    nodes: nodes.map((node) => ({
      ...node,
      fx: node.x, // Fix x position
      fy: node.y, // Fix y position
    })),
    links,
  };
};

const ForceTree = ({ data, levelHeight = 100, siblingSpacing = 150 }) => {
  const fgRef = useRef();
  const [localGraphData, setLocalGraphData] = useState(null);

  useEffect(() => {
    if (data) {
      const updatedGraphData = calculateTreeLayout(
        data.nodes,
        data.links,
        levelHeight,
        siblingSpacing
      );
      setLocalGraphData(updatedGraphData);
    }
  }, [data, levelHeight, siblingSpacing]);

  if (!localGraphData) return null;

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={localGraphData}
      backgroundColor="#101020"
      linkColor={() => 'rgba(255,255,255,0.5)'}
      nodeRelSize={1}
      nodeId="id"
      nodeVal={() => 61}
      nodeLabel="label"
      nodeAutoColorBy="label"
      d3VelocityDecay={0} // Prevent motion
      d3AlphaDecay={0} // Stop motion decay
      d3Force="null" // Disable physics
      onNodeDragEnd={(node) => {
        node.fx = node.x; // Fix x position after dragging
        node.fy = node.y; // Fix y position after dragging
      }}
    />
  );
};

export default ForceTree;
