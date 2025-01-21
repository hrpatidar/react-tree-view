import React, { useState } from 'react';
import Tree, { RenderCustomNodeElementFn } from 'react-d3-tree';
import './styles.css';
import data from './data.json';

// Styles
const containerStyles: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  position: 'relative',
};

// Custom Node Renderer
const renderCustomNodeElement: RenderCustomNodeElementFn = ({
  nodeDatum,
  toggleNode,
}) => {
  const { nodeType } = nodeDatum.attributes || {};

  return (
    <g>
      {/* Custom icon/image for node */}
      {nodeType === 'switch' && (
        <image
          href="/icons/switch.png"
          width="30"
          height="30"
          x="-15"
          y="-15"
          onClick={toggleNode}
        />
      )}
      {nodeType === 'gateway' && (
        <image
          href="/icons/gateway.png"
          width="30"
          height="30"
          x="-15"
          y="-15"
          onClick={toggleNode}
        />
      )}
      {nodeType === 'access_point' && (
        <image
          href="/icons/ap.png"
          width="30"
          height="30"
          x="-15"
          y="-15"
          onClick={toggleNode}
        />
      )}

      {/* Node Label */}
      <text fill="black" x="25" dy="5">
        {nodeDatum.name}
      </text>
    </g>
  );
};

const ReactD3Tree: React.FC = () => {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  const handleMouseOverLink = (linkData: any) => {
    // Extract source and target names
    const sourceName = linkData?.parent?.data?.name || 'Unknown Source';
    const targetName = linkData?.data?.name || 'Unknown Target';

    setHoveredLinkId(linkData?.data?.__rd3t.id);
    // Set tooltip content
    setTooltip(`Source: ${sourceName}, Target: ${targetName}`);
  };

  const handleMouseOutLink = () => {
    setHoveredLinkId(null);
    setTooltip(null);
  };

  return (
    <div style={containerStyles}>
      <Tree
        data={data}
        translate={{ x: window.innerWidth / 2, y: 50 }}
        renderCustomNodeElement={renderCustomNodeElement}
        orientation="vertical"
        collapsible={true}
        zoomable={true}
        draggable={true}
        pathFunc="diagonal" // Simple straight lines
        pathClassFunc={(linkData: any) => {
          const connectionStatus =
            linkData.source?.data?.attributes?.connectionStatus;
          let baseClass = '';

          // Determine base class based on connection status
          switch (connectionStatus) {
            case 'good':
              baseClass = 'link-good';
              break;
            case 'poor':
              baseClass = 'link-poor';
              break;
            case 'fair':
              baseClass = 'link-fair';
              break;
            default:
              baseClass = 'link-default';
          }

          // Highlight on hover
          return linkData.source?.data?.__rd3t.id === hoveredLinkId
            ? `${baseClass} link-highlight`
            : baseClass;
        }}
        onLinkMouseOver={handleMouseOverLink}
        onLinkMouseOut={handleMouseOutLink}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="tooltip"
          style={{ position: 'absolute', top: 10, left: 10 }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default ReactD3Tree;
