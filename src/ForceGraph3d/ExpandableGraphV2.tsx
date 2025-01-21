import React, { useState, useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

interface Node {
  id: number;
  collapsed: boolean; // Indicates whether the node is collapsed
  childLinks: Link[]; // Links to child nodes
  label: string;
}

interface Link {
  source: number | Node;
  target: number | Node;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const ExpandableGraphV2: React.FC = () => {
  const rootId = 0;
  const NODE_R = 4;

  // Function to generate random tree data
  const genRandomTree = (N = 300, reverse = false): GraphData => {
    const nodes: Node[] = [...Array(N).keys()].map((i) => ({
      id: i,
      label: 'Aruba Device ' + i,
      collapsed: i !== rootId, // collapsed: i !== rootId // All nodes are collapsed except the root
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

  // const graphData = useMemo(() => genRandomTree(600, true), []);

  const data = useMemo(() => {
    const gData = genRandomTree(600, true);

    // cross-link node objects
    gData.links.forEach((link: any) => {
      const a: any = gData.nodes[link.source];
      const b: any = gData.nodes[link.target];
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });

    return gData;
  }, []);

  // Helper to calculate the visible tree structure
  const getPrunedTree = useCallback((): GraphData => {
    const visibleNodes: Node[] = [];
    const visibleLinks: Link[] = [];

    (function traverseTree(node = data.nodes[rootId]) {
      visibleNodes.push(node);
      if (node.collapsed) return;

      visibleLinks.push(...node.childLinks);
      node.childLinks
        .map((link) =>
          typeof link.target === 'object'
            ? link.target
            : data.nodes[link.target as number]
        )
        .forEach(traverseTree);
    })();

    return { nodes: visibleNodes, links: visibleLinks };
  }, [data]);

  const [prunedTree, setPrunedTree] = useState<GraphData>(getPrunedTree());

  const handleNodeClick = useCallback(
    (node: Node) => {
      node.collapsed = !node.collapsed; // Toggle collapse state
      setPrunedTree(getPrunedTree()); // Update pruned tree
    },
    [getPrunedTree]
  );

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = (node: any) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach((neighbor: any) => highlightNodes.add(neighbor));
      node.links.forEach((link: any) => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = (link: any) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  const paintRing3D = React.useCallback(
    (node: Node) => {
      // Create a group to combine the node, label, and ring
      const group = new THREE.Group();

      // Add the label (text) to the group
      const label = new SpriteText(`${node.id}`);
      label.color = 'white';
      label.backgroundColor = 'rgba(0,0,0,0.5)';
      label.textHeight = 4;
      label.position.set(0, -8, 2); // Position below the node
      group.add(label);

      // Add a ring if the node is highlighted
      if (highlightNodes.has(node)) {
        const ringGeometry = new THREE.RingGeometry(
          NODE_R * 1.5,
          NODE_R * 1.8,
          32
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: node === hoverNode ? 'red' : 'orange',
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);

        // Ensure the ring is oriented correctly
        ring.rotation.set(Math.PI / 2, 0, 0); // Align with the XY plane
        ring.position.set(0, 0, 0); // Center the ring at the node's origin
        group.add(ring); // Add ring to the node's group
      }

      return group;
    },
    [hoverNode, highlightNodes]
  );
  /* 
  const nodeThreeObject = React.useCallback(
    (node: Node) => {
      // Create a group to combine image and label
      const group = new THREE.Group();

      // Create the text label using SpriteText
      const label = new SpriteText(`${node.id}`);
      label.color = 'white'; // Text color
      label.backgroundColor = 'rgba(0,0,0,0.5)'; // Optional background
      label.textHeight = 4; // Adjust text size
      label.position.set(0, -8, 2); // Position below the node

      group.add(label); // Add the label to the group

      return group;
    },
    [] // Dependencies, leave empty since we don't want it to recompute
  ); */

  return (
    <ForceGraph3D
      graphData={prunedTree}
      nodeRelSize={NODE_R}
      linkDirectionalParticles={4}
      nodeColor={(node: Node) =>
        !node.childLinks.length ? 'green' : node.collapsed ? 'red' : 'yellow'
      }
      onNodeClick={handleNodeClick}
      linkDirectionalParticleWidth={(link) =>
        highlightLinks.has(link) ? 3 : 0
      }
      onNodeHover={handleNodeHover}
      onLinkHover={handleLinkHover}
      nodeLabel="label"
      nodeAutoColorBy="group"
      onNodeDragEnd={(node) => {
        node.fx = node.x;
        node.fy = node.y;
        node.fz = node.z;
      }}
      nodeThreeObjectExtend={true}
      nodeThreeObject={paintRing3D}
    />
  );
};

export default ExpandableGraphV2;
