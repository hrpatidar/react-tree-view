import React, { useState, useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

interface Node {
  id: number;
  collapsed: boolean; // Indicates whether the node is collapsed
  childLinks: Link[]; // Links to child nodes
}

interface Link {
  source: number | Node;
  target: number | Node;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const ExpandableGraph: React.FC = () => {
  const rootId = 0;

  // Function to generate random tree data
  const genRandomTree = (N = 300, reverse = false): GraphData => {
    const nodes: Node[] = [...Array(N).keys()].map((i) => ({
      id: i,
      collapsed: i !== rootId, // All nodes are collapsed except the root
      childLinks: [], // Placeholder for child links
    }));

    const links: any = [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => ({
        [reverse ? 'target' : 'source']: id,
        [reverse ? 'source' : 'target']: Math.round(Math.random() * (id - 1)),
      }));

    // Link parent and children nodes
    const nodesById: Record<number, Node> = Object.fromEntries(
      nodes.map((node) => [node.id, node])
    );

    links.forEach((link: any) => {
      const source =
        typeof link.source === 'number' ? nodesById[link.source] : link.source;
      source.childLinks.push(link);
    });

    return { nodes, links };
  };

  const graphData = useMemo(() => genRandomTree(600, true), []);

  // Helper to calculate the visible tree structure
  const getPrunedTree = useCallback((): GraphData => {
    const visibleNodes: Node[] = [];
    const visibleLinks: Link[] = [];

    (function traverseTree(node = graphData.nodes[rootId]) {
      visibleNodes.push(node);
      if (node.collapsed) return;

      visibleLinks.push(...node.childLinks);
      node.childLinks
        .map((link) =>
          typeof link.target === 'object'
            ? link.target
            : graphData.nodes[link.target as number]
        )
        .forEach(traverseTree);
    })();

    return { nodes: visibleNodes, links: visibleLinks };
  }, [graphData]);

  const [prunedTree, setPrunedTree] = useState<GraphData>(getPrunedTree());

  const handleNodeClick = useCallback(
    (node: Node) => {
      node.collapsed = !node.collapsed; // Toggle collapse state
      setPrunedTree(getPrunedTree()); // Update pruned tree
    },
    [getPrunedTree]
  );

  return (
    <ForceGraph3D
      graphData={prunedTree}
      linkDirectionalParticles={2}
      nodeColor={(node: Node) =>
        !node.childLinks.length ? 'green' : node.collapsed ? 'red' : 'yellow'
      }
      onNodeClick={handleNodeClick}
    />
  );
};

export default ExpandableGraph;
