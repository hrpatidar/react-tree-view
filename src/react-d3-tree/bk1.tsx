import React, { useCallback, useState } from 'react';
import Tree, { RawNodeDatum, RenderCustomNodeElementFn } from 'react-d3-tree';
import orgChartJson from './data.json';
import './styles.css';

// Define the type for dimensions
interface Dimensions {
  width: number;
  height: number;
}

// Custom hook to center the tree
const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState(defaultTranslate);
  const [dimensions, setDimensions] = useState<Dimensions | undefined>();
  const containerRef = useCallback((containerElem: HTMLDivElement | null) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: 50 });
    }
  }, []);
  return [dimensions, translate, containerRef] as const;
};

// Define container styles
const containerStyles: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
};

// Type for Custom Node Element Props
interface CustomNodeProps {
  nodeDatum: RawNodeDatum;
  toggleNode: () => void;
}

// Custom Node Renderer
const renderRectSvgNode: RenderCustomNodeElementFn = ({
  nodeDatum,
  toggleNode,
}: CustomNodeProps) => (
  <g>
    <rect
      width="20"
      height="20"
      x="-10"
      onClick={toggleNode}
      fill="lightblue"
    />
    <text fill="black" strokeWidth="1" x="20" dy="5">
      {nodeDatum.name}
    </text>
    {nodeDatum.attributes?.department && (
      <text fill="black" x="20" dy="20" strokeWidth="1">
        Department: {nodeDatum.attributes.department}
      </text>
    )}
  </g>
);

// Main App Component
const ReactD3Tree: React.FC = () => {
  const [dimensions, translate, containerRef] = useCenteredTree();

  return (
    <div style={containerStyles} ref={containerRef}>
      {dimensions && (
        <Tree
          data={orgChartJson}
          dimensions={dimensions}
          translate={translate}
          renderCustomNodeElement={renderRectSvgNode}
          orientation="vertical"
        />
      )}
    </div>
  );
};

export default ReactD3Tree;
