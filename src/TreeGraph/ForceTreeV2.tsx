import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface Node {
  id: string;
  label: string;
  level: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  collapsed?: boolean;
  childLinks?: Link[];
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const calculateTreeLayout = (
  nodes: Node[],
  links: Link[],
  levelHeight = 100,
  siblingSpacing = 150,
  layout: 'vertical' | 'horizontal' = 'vertical'
): GraphData => {
  const nodesById: Record<string, Node> = Object.fromEntries(
    nodes.map((node) => [node.id, node])
  );

  const childrenMap: Record<string, string[]> = {};

  // Create a map of children for each node
  links.forEach(({ source, target }) => {
    if (!childrenMap[source]) childrenMap[source] = [];
    childrenMap[source].push(target);
  });

  const assignPositions = (nodeId: string, level = 0, offset = 0): number => {
    const node = nodesById[nodeId];
    if (!node) return offset;

    // Set node position based on the layout
    if (layout === 'vertical') {
      node.level = level;
      node.y = 20 + level * levelHeight;
      node.x = offset;
    } else {
      node.level = level;
      node.x = 20 + level * levelHeight;
      node.y = offset;
    }

    const children = childrenMap[nodeId] || [];
    if (children.length === 0) {
      return offset + siblingSpacing; // Leaf node
    }

    // Non-leaf node: Center parent above its children
    let currentOffset = offset;
    const childPositions = children.map((childId) => {
      currentOffset = assignPositions(childId, level + 1, currentOffset);
      return layout === 'vertical'
        ? nodesById[childId].x!
        : nodesById[childId].y!;
    });

    // Center parent based on its children
    if (layout === 'vertical') {
      node.x = (Math.min(...childPositions) + Math.max(...childPositions)) / 2;
    } else {
      node.y = (Math.min(...childPositions) + Math.max(...childPositions)) / 2;
    }

    return currentOffset;
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

const ForceTreeV2: React.FC<{
  data: GraphData;
  levelHeight?: number;
  siblingSpacing?: number;
}> = ({ data, levelHeight = 100, siblingSpacing = 150 }) => {
  const [localGraphData, setLocalGraphData] = useState<GraphData | null>(null);
  const [prunedTree, setPrunedTree] = useState<GraphData | null>(null);
  const fgRef = useRef<any>();
  const [layout] = useState<'vertical' | 'horizontal'>('vertical');

  // Calculate tree layout
  useEffect(() => {
    if (data) {
      const updatedGraphData = calculateTreeLayout(
        data.nodes,
        data.links,
        levelHeight,
        siblingSpacing,
        layout
      );

      console.log(updatedGraphData);
      setLocalGraphData(updatedGraphData);
    }
  }, [data, levelHeight, siblingSpacing, layout]);

  const nodesById = useMemo(() => {
    if (!localGraphData) return {};
    const nodesById: Record<string, Node> = Object.fromEntries(
      localGraphData.nodes.map((node) => [node.id, node])
    );

    // Initialize childLinks for each node
    localGraphData.nodes.forEach((node) => {
      node.childLinks = [];
    });
    localGraphData.links.forEach((link) => {
      nodesById[link.source]?.childLinks!.push(link);
    });

    return nodesById;
  }, [localGraphData]);

  const getPrunedTree = useCallback((): GraphData => {
    if (!localGraphData) return { nodes: [], links: [] };
    const visibleNodes: Node[] = [];
    const visibleLinks: Link[] = [];

    (function traverseTree(node = nodesById['parent']) {
      if (!node) {
        console.error("Root node 'parent' not found in nodesById.");
        return;
      }
      visibleNodes.push(node);
      if (node.collapsed) return;
      visibleLinks.push(...node.childLinks!);
      node
        .childLinks!.map((link) =>
          typeof link.target === 'object' ? link.target : nodesById[link.target]
        )
        .forEach(traverseTree);
    })();

    return { nodes: visibleNodes, links: visibleLinks };
  }, [localGraphData, nodesById]);

  // Update prunedTree whenever localGraphData changes
  useEffect(() => {
    setPrunedTree(getPrunedTree());
  }, [getPrunedTree]);

  // Center the tree view initially
  useEffect(() => {
    if (fgRef.current && prunedTree) {
      // Ensure tree starts at the top
      const { nodes } = prunedTree;
      const minX = Math.min(...nodes.map((node) => node.fx ?? 0));
      const maxX = Math.max(...nodes.map((node) => node.fx ?? 0));

      fgRef.current.zoom(1); // Reset zoom level
      fgRef.current.centerAt((minX + maxX) / 2, 150); // Center horizontally and at the top
    }
  }, [prunedTree]);

  const handleNodeClick = useCallback(
    (node: Node) => {
      node.collapsed = !node.collapsed; // Toggle collapse state
      setPrunedTree(getPrunedTree()); // Recalculate the visible tree
    },
    [getPrunedTree]
  );

  if (!prunedTree) return null;

  return (
    <>
      <ForceGraph2D
        ref={fgRef}
        backgroundColor="#101020"
        linkColor={() => 'white'}
        graphData={prunedTree}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        nodeVal={() => 14}
        nodeColor={(node) =>
          !node.childLinks?.length ? 'green' : node.collapsed ? 'red' : 'yellow'
        }
        nodeAutoColorBy="id"
        nodeLabel="id"
        onNodeClick={handleNodeClick}
        d3VelocityDecay={0} // Prevent motion
        d3AlphaDecay={0} // Stop motion decay
        onNodeDragEnd={(node) => {
          node.fx = node.x; // Fix x position after dragging
          node.fy = node.y; // Fix y position after dragging
        }}
      />
    </>
  );
};

export default ForceTreeV2;
