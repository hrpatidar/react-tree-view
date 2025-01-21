import React from 'react';
// import TreeView from './TreeView/TreeView';
import ForceGraphComponent from './ForceGraph3d/ForceGraph3d';
import ExpandableGraph from './ForceGraph3d/ExpandableGraph';
import ExpandableGraphV2 from './ForceGraph3d/ExpandableGraphV2';
import ExpandableGraphV3 from './ForceGraph3d/ExpandableGraphV3';
import ExpandableGraphV4 from './ForceGraph3d/ExpandableGraphV4';
import TopologyTree from './TreeGraph/TopologyTree';
import TreeGraph from './TreeGraph/TreeGraph';
import AMTree from './am/AMTree';
import D3TreeChart from './am/D3Tree';
import ReactD3Tree from './react-d3-tree/ReactD3Tree';
import ExpandableTree from './TreeGraph/ExpandableTree';

const App: React.FC = () => {
  return (
    <div>
      {/*  <AMTree /> */}
      {/* <ForceGraphComponent />  For Image as node .. */}
      {/* <ExpandableGraph /> */}
      {/* <ExpandableGraphV2 /> */}
      {/* <ExpandableGraphV3 /> */}
      {/*  <TopologyTree />  */}
      {/* <TreeGraph /> */}

      {/* <D3TreeChart /> */}

      {/* <ReactD3Tree /> */}

      <ExpandableTree />
    </div>
  );
};

export default App;
