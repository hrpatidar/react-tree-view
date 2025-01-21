import React, { useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import data from './miserables.json';

interface NodeObject {
  id: string;
  group: number;
  x?: number;
  y?: number;
  z?: number;
  fx?: number;
  fy?: number;
  fz?: number;
}

interface LinkObject {
  source: string;
  target: string;
}

interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

export const DragEndComponent: React.FC = () => {
  const [graphData] = useState<GraphData | null>(data);

  if (!graphData) {
    return <div>Loading...</div>;
  }

  return (
    <ForceGraph3D
      graphData={graphData}
      nodeLabel="id"
      nodeAutoColorBy="group"
      onNodeDragEnd={(node: NodeObject) => {
        node.fx = node.x;
        node.fy = node.y;
        node.fz = node.z;
      }}
    />
  );
};
