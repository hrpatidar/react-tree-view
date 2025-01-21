import { useState, useEffect } from 'react';
import ForceTreeV2 from './ForceTreeV2';

const ExpandableTree = () => {
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    const fetchData = () => {
      // Define the dataset
      const nodes = [
        { id: 'parent', label: 'Parent Node', level: 0 },
        { id: 'child-1', label: 'Child 1', level: 1 },
        { id: 'child-2', label: 'Child 2', level: 1 },
        { id: 'child-3', label: 'Child 3', level: 1 },
        { id: 'grandchild-1-1', label: 'Grandchild 1-1', level: 2 },
        { id: 'grandchild-1-2', label: 'Grandchild 1-2', level: 2 },
        { id: 'grandchild-2-1', label: 'Grandchild 2-1', level: 2 },
        { id: 'grandchild-2-2', label: 'Grandchild 2-2', level: 2 },
        { id: 'grandchild-3-1', label: 'Grandchild 3-1', level: 2 },
        { id: 'grandchild-3-2', label: 'Grandchild 3-2', level: 2 },
        { id: 'child-4-1', label: 'Child 41', level: 3 },
        { id: 'child-4-2', label: 'Child 42', level: 3 },
        { id: 'child-5-1', label: 'Child 51', level: 3 },
        { id: 'child-5-2', label: 'Child 52', level: 3 },
        { id: 'child-6-1', label: 'Child 61', level: 3 },
        { id: 'child-6-2', label: 'Child 62', level: 3 },
      ];

      const links = [
        { source: 'parent', target: 'child-1' },
        { source: 'parent', target: 'child-2' },
        { source: 'parent', target: 'child-3' },
        { source: 'child-1', target: 'grandchild-1-1' },
        { source: 'child-1', target: 'grandchild-1-2' },
        { source: 'child-1', target: 'grandchild-2-1' },
        { source: 'child-1', target: 'grandchild-2-2' },
        { source: 'child-2', target: 'grandchild-1-1' },
        { source: 'child-2', target: 'grandchild-1-2' },
        { source: 'child-2', target: 'grandchild-2-1' },
        { source: 'child-2', target: 'grandchild-2-2' },
        { source: 'child-3', target: 'grandchild-3-1' },
        { source: 'child-3', target: 'grandchild-3-2' },
        { source: 'grandchild-1-1', target: 'child-4-1' },
        { source: 'grandchild-1-2', target: 'child-4-2' },
        { source: 'grandchild-2-1', target: 'child-5-1' },
        { source: 'grandchild-2-2', target: 'child-5-2' },
        { source: 'grandchild-3-1', target: 'child-6-1' },
        { source: 'grandchild-3-2', target: 'child-6-2' },
      ];

      setGraphData({ nodes, links });
    };

    fetchData();
  }, []);

  if (!graphData) return <div>Loading...</div>;
  return (
    <ForceTreeV2
      data={graphData}
      siblingSpacing={100} // Adjust the vertical spacing from the top
      levelHeight={120} // Customize the link length
    />
  );
};

export default ExpandableTree;
