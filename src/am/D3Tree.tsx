import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import d3Json from './d3Json.json';

// Define the data structure for TreeNode
interface TreeNode {
  name: string;
  children?: TreeNode[];
  _children?: TreeNode[]; // Hidden children for collapse/expand
  size?: number;
}

// Configuration options for TreeChart
interface TreeConfig {
  width?: number;
  height?: number;
  r?: number; // Circle radius
  fill?: string; // Node fill color
  stroke?: string; // Link stroke color
  strokeWidth?: number;
}

const data: TreeNode = d3Json;

const config: TreeConfig = {
  width: 900,
  height: 600,
  r: 5,
  fill: '#69b3a2',
  stroke: '#555',
  strokeWidth: 2,
};

const D3TreeChart: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !ref.current) return;

    ref.current.innerHTML = ''; // Clear previous content

    // Destructure configuration
    const {
      width = 900,
      height = 800,
      r = 5,
      fill = '#69b3a2',
      stroke = '#555',
      strokeWidth = 2,
    } = config;

    // Initialize tree layout
    const root = d3.hierarchy<TreeNode>(data);
    const treeLayout = d3.tree<TreeNode>().size([height, width - 160]);

    // Collapse all nodes initially except the root
    root.descendants().forEach((d: any) => {
      if (d.depth > 0) {
        d._children = d.children;
        d.children = undefined;
      }
    });

    const svg = d3
      .select(ref.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(80,0)');

    // Link generator
    const linkGenerator = d3
      .linkHorizontal()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    const update = (source: d3.HierarchyNode<TreeNode>) => {
      treeLayout(root);

      // DRAW LINKS
      const links = svg
        .selectAll<SVGPathElement, d3.HierarchyLink<TreeNode>>('path.link')
        .data(root.links());

      // Enter new links
      links
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
        .merge(links)
        .attr('d', (d: any) => linkGenerator(d));

      links.exit().remove();

      // DRAW NODES
      const nodes = svg
        .selectAll<SVGGElement, d3.HierarchyNode<TreeNode>>('g.node')
        .data(root.descendants());

      // Enter new nodes
      const nodeEnter = nodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', () => `translate(${source.y},${source.x})`)
        .on('click', (_, d) => {
          toggleChildren(d);
          update(d);
        });

      // Add circles
      nodeEnter
        .append('circle')
        .attr('r', r)
        .attr('fill', (d: any) => (d._children ? '#555' : fill));

      // Add labels
      nodeEnter
        .append('text')
        .attr('dy', '0.32em')
        .attr('x', (d: any) => (d.children || d._children ? -10 : 10))
        .attr('text-anchor', (d: any) =>
          d.children || d._children ? 'end' : 'start'
        )
        .text((d) => d.data.name);

      // Transition nodes to their new positions
      nodeEnter
        .merge(nodes)
        .transition()
        .duration(300)
        .attr('transform', (d) => `translate(${d.y},${d.x})`);

      nodes.exit().remove();
    };

    const toggleChildren = (node: any) => {
      if (node.children) {
        node._children = node.children;
        node.children = undefined;
      } else if (node._children) {
        node.children = node._children;
        node._children = undefined;
      }
    };

    // Initial rendering
    update(root);
  }, []);

  return <div ref={ref}></div>;
};

export default D3TreeChart;
