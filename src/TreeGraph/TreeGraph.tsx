import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

// Define the Node structure
interface Node {
  id: string;
  label: string;
  children?: Node[];
  _children?: Node[];
  number?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type: 'good' | 'poor' | 'fair';
  label: string;
}

const TreeGraph: React.FC = () => {
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal');
  const [data, setData] = useState<Node | null>(null);

  useEffect(() => {
    const rootNode: Node = generateData();
    setData(rootNode);
  }, []);

  useEffect(() => {
    if (data) {
      renderTree(data);
    }
  }, [data, layout]);

  const generateData = (): Node => {
    const root: Node = {
      id: 'root',
      label: 'Root Node',
      children: Array.from({ length: 5 }).map((_, i) => ({
        id: `parent-${i}`,
        label: `Parent ${i}`,
        number: i,
        children: Array.from({ length: 5 }).map((_, j) => ({
          id: `child-${i}-${j}`,
          label: `Child ${i}-${j}`,
          number: Math.floor(Math.random() * 100),
        })),
      })),
    };
    return root;
  };

  const toggleCollapse = (node: Node) => {
    if (node.children) {
      node._children = node.children;
      node.children = undefined;
    } else if (node._children) {
      node.children = node._children;
      node._children = undefined;
    }
    setData({ ...data! });
  };

  const renderTree = (rootData: Node) => {
    const width = 1000;
    const height = 600;

    d3.select('#tree-container').selectAll('*').remove();

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid black')
      .style('border-radius', '5px')
      .style('padding', '5px')
      .style('visibility', 'hidden')
      .style('pointer-events', 'none');

    const svg = d3
      .select('#tree-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(50,50)');

    const root = d3.hierarchy(rootData, (d) => d.children);

    const treeLayout = d3
      .tree<Node>()
      .size(
        layout === 'vertical'
          ? [height - 100, width - 200]
          : [width - 200, height - 100]
      );
    treeLayout(root);

    // Prepare links with labels
    const links = root.links().map((link) => ({
      ...link,
      type: ['good', 'poor', 'fair'][Math.floor(Math.random() * 3)],
      label: `Link: ${link.source.data.label} -> ${link.target.data.label}`,
    }));

    // Draw links
    svg
      .selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        d.type === 'good' ? 'green' : d.type === 'fair' ? 'yellow' : 'red'
      )
      .attr('stroke-width', 2)
      .attr('d', (d) => {
        const source = { x: d.source.x || 0, y: d.source.y || 0 };
        const target = { x: d.target.x || 0, y: d.target.y || 0 };

        if (layout === 'vertical') {
          return `M ${source.y} ${source.x} L ${target.y} ${target.x}`;
        } else {
          return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
        }
      })
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .attr('stroke', 'blue') // Change link color on hover
          .attr('stroke-width', 4);

        tooltip.style('visibility', 'visible').text(d.label);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', `${event.pageY + 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .attr('stroke', (d: any) =>
            d.type === 'good' ? 'green' : d.type === 'fair' ? 'yellow' : 'red'
          )
          .attr('stroke-width', 2);

        tooltip.style('visibility', 'hidden');
      });

    // Draw nodes
    const node = svg
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr(
        'transform',
        (d) =>
          `translate(${layout === 'vertical' ? d.y : d.x},${
            layout === 'vertical' ? d.x : d.y
          })`
      )
      .on('click', (_, d) => toggleCollapse(d.data));

    node
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d: any) =>
        d.children || d._children ? 'lightblue' : 'lightgreen'
      )
      .attr('stroke', 'blue')
      .attr('stroke-width', 2);

    node
      .append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .text((d) => d.data.label);

    node
      .append('text')
      .attr('dx', 10)
      .attr('dy', -10)
      .attr('fill', 'red')
      .text((d: any) => d.data.number);
  };

  return (
    <div>
      <h2>Tree Graph with Expand/Collapse & Link Tooltip</h2>
      <button
        onClick={() =>
          setLayout(layout === 'vertical' ? 'horizontal' : 'vertical')
        }
      >
        Toggle Layout ({layout === 'vertical' ? 'Horizontal' : 'Vertical'})
      </button>
      <div
        id="tree-container"
        style={{ width: '1000px', height: '600px' }}
      ></div>
    </div>
  );
};

export default TreeGraph;
