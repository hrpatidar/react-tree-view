import React, { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import amTreeData from './amTree.json';

interface NodeData {
  id?: string; // Added unique ID for cross-linking
  parentId?: string | null; // Reference to parent node
  name: string;
  children?: NodeData[];
  value?: number;
  linkLabel?: string;
  linkType?: 'good' | 'poor' | 'fair' | undefined;
}

const AMTree: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const zoomableContainer = root.container.children.push(
      am5.ZoomableContainer.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        wheelable: true,
        pinchZoom: true,
        minZoomLevel: 0.5,
        maxZoomLevel: 2,
      })
    );

    const series = zoomableContainer.contents.children.push(
      am5hierarchy.Tree.new(root, {
        singleBranchOnly: false,
        downDepth: 1, // Visible depth
        initialDepth: 5, // Collapsed depth
        valueField: 'value',
        categoryField: 'name',
        childDataField: 'children',
        layout: root.horizontalLayout,
        orientation: 'vertical',
        linkWithField: 'link',
        idField: 'name',
      })
    );

    // Set tooltips for links
    series.links.template.setAll({
      strokeWidth: 2,
      strokeOpacity: 0.7,
      tooltipText: '{linkLabel}', // Tooltip content
      tooltipPosition: 'pointer', // Tooltip near the pointer (default behavior)
    });

    // Adjust node size to prevent overlapping
    // Set padding to ensure spacing between nodes
    series.nodes.template.setAll({
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 10,
      paddingRight: 10,
      width: 100, // Fixed node width
      height: 50, // Fixed node height
      draggable: true,
    });

    series.links.template.adapters.add('stroke', (stroke, target) => {
      const dataContext = target.dataItem?.dataContext as NodeData | undefined;
      if (dataContext?.linkType === 'good') return am5.color('#28a745'); // Green
      if (dataContext?.linkType === 'poor') return am5.color('#dc3545'); // Red
      if (dataContext?.linkType === 'fair') return am5.color('#ffc107'); // Yellow
      return stroke; // Default stroke
    });

    // Ensure tooltips appear near the link
    series.links.template.set(
      'tooltip',
      am5.Tooltip.new(root, {
        pointerOrientation: 'horizontal', // Tooltip aligns horizontally with the link
        labelText: '{linkLabel}', // Use the linkLabel property for the tooltip
      })
    );

    // Update link styles on hover for clarity
    series.links.template.states.create('hover', {
      strokeWidth: 4,
      strokeOpacity: 1,
      // strokeDasharray: [3, 3], // Add dashed style on hover
    });

    // Generate smaller data set
    const data: any = {
      id: 'root',
      parentId: null,
      name: 'Root',
      children: [],
    };
    generateNodes(data, 'root', 0, 100);

    // Function to generate nodes with unique IDs and parent IDs
    function generateNodes(
      parent: NodeData,
      parentId: string | null, // Parent ID
      level: number,
      maxNodes: number
    ) {
      if (level > 5 || maxNodes <= 0) return; // Limit recursion depth
      parent.children = [];

      for (let i = 0; i < 3 && maxNodes > 0; i++) {
        const childId = `${parentId}-${level}-${i}`; // Generate unique ID for child
        const child: NodeData = {
          id: childId,
          parentId: parentId, // Reference to the parent node
          name: `Node ${level}-${i}`,
          value: Math.floor(Math.random() * 100),
          linkLabel: `Link to Node ${level}-${i}`,
          linkType: ['good', 'poor', 'fair'][Math.floor(Math.random() * 3)] as
            | 'good'
            | 'poor'
            | 'fair',
        };

        parent.children.push(child);
        generateNodes(child, childId, level + 1, maxNodes - 1); // Recursive call
      }
    }

    console.log(data);

    // Set data with delay to allow UI rendering
    setTimeout(() => {
      series.data.setAll([data]);
      series.appear(1000, 100);
    }, 0);

    // Cleanup
    return () => root.dispose();
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '1000px',
      }}
    ></div>
  );
};

export default AMTree;
