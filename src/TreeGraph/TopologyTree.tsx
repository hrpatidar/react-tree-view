import React, { useEffect, useRef, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

const generateTreeData = (levels: any, maxChildrenPerLevel: any) => {
  const nodes: any = [];
  const links: any = [];

  let id = 0;

  const addNode = (level: any, parentId: any) => {
    const nodeId = id++;
    nodes.push({
      id: nodeId,
      name: `Node ${nodeId}`,
      connections: Math.floor(Math.random() * 10),
      level,
      collapsed: false, // Initially, no node is collapsed
    });

    if (parentId !== null) {
      links.push({ source: parentId, target: nodeId });
    }

    if (level < levels) {
      const numChildren = Math.ceil(Math.random() * maxChildrenPerLevel);
      for (let i = 0; i < numChildren; i++) {
        addNode(level + 1, nodeId);
      }
    }
  };

  addNode(0, null);
  return { nodes, links };
};

const TopologyTree = () => {
  const fgRef = useRef<ForceGraphMethods<any, any> | any>();
  const [data, setData] = useState({ nodes: [], links: [] });
  const [orientation, setOrientation] = useState('vertical');

  useEffect(() => {
    const treeData = generateTreeData(5, 4); // 5 levels deep, max 4 children per level
    console.log(treeData);
    setData(treeData);
  }, []);

  const handleNodeDrag = (node: any) => {
    if (node.level === 0) {
      // Move the whole tree by dragging the parent node
      const dx = node.fx - node.x;
      const dy = node.fy - node.y;
      data.nodes.forEach((n: any) => {
        n.x += dx;
        n.y += dy;
      });

      if (fgRef.current !== undefined && data.nodes.length > 0) {
        fgRef.current.d3Force('charge')!.initialize(data.nodes);
      }
    }
  };

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('link').distance(100); // Set link distance
      fgRef.current.d3Force('charge').strength(-50); // Adjust charge force
    }
  }, []);

  const handleNodeClick = (node: any) => {
    const newLinks = [...data.links];
    const newNodes = [...data.nodes];

    // Recursively toggle collapse/expand for the clicked node and its descendants
    const toggleNodeCollapse = (currentNode: any) => {
      const isCollapsed = !currentNode.collapsed;
      currentNode.collapsed = isCollapsed;

      // Toggle the visibility of the links connected to this node
      newLinks.forEach((link: any) => {
        if (link.source.id === currentNode.id) {
          link.hidden = isCollapsed;
        }
      });

      // Recursively collapse/expand child nodes
      newLinks.forEach((link: any) => {
        if (link.source.id === currentNode.id) {
          toggleNodeCollapse(link.target); // Toggle child node collapse
        }
      });
    };

    toggleNodeCollapse(node); // Toggle collapse/expand for the clicked node

    // Update the state to trigger re-render
    setData({ nodes: newNodes, links: newLinks });
  };

  const paintNode = (node: any, ctx: any, globalScale: any) => {
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;

    // Draw node icon (circle for demo, replace with icons as needed)
    ctx.beginPath();
    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.level === 0 ? 'blue' : 'green';
    ctx.fill();

    // Draw node label
    ctx.fillStyle = 'black';
    ctx.fillText(node.name, node.x + 10, node.y + 4);

    // Draw top-right number
    /* ctx.fillStyle = 'red';
    ctx.fillText(node.connections, node.x + 10, node.y - 10); */
  };

  const paintLink = (link: any, ctx: any) => {
    ctx.strokeStyle = link.hidden
      ? 'rgba(0,0,0,0)' // Invisible when collapsed
      : link.level > 3
      ? 'blue'
      : 'black';
    ctx.lineWidth = link.level > 3 ? 1.5 : 2; // Sets the width based on level
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <button
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 10,
          left: 10,
          padding: '10px',
          cursor: 'pointer',
        }}
        onClick={() =>
          setOrientation((prev) =>
            prev === 'vertical' ? 'horizontal' : 'vertical'
          )
        }
      >
        Toggle Orientation
      </button>

      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel="id"
        nodeCanvasObject={(node, ctx, globalScale) =>
          paintNode(node, ctx, globalScale)
        }
        linkCanvasObject={(link, ctx) => paintLink(link, ctx)}
        onNodeDragEnd={handleNodeDrag}
        onNodeClick={handleNodeClick}
        nodeId={'id'}
        enableNodeDrag
        width={window.innerWidth}
        height={window.innerHeight}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25} // For curved links (can vary based on connection styles)
        d3VelocityDecay={0.4}
        dagMode={orientation === 'vertical' ? 'td' : 'lr'} // Toggle vertical and horizontal layout
      />
    </div>
  );
};

export default TopologyTree;
