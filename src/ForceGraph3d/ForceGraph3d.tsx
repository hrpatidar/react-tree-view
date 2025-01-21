import React from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';

// Define types for the nodes and links
interface Node {
  id: number;
  img: string;
}

interface Link {
  source: number;
  target: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const imgs = [
  'cat.jpg',
  'dog.jpg',
  'eagle.jpg',
  'elephant.jpg',
  'grasshopper.jpg',
  'octopus.jpg',
  'owl.jpg',
  'panda.jpg',
  'squirrel.jpg',
  'tiger.jpg',
  'whale.jpg',
];

// Random connected graph
const gData = {
  nodes: imgs.map((img, id) => ({ id, img })),
  links: [...Array(imgs.length).keys()]
    .filter((id) => id)
    .map((id) => ({
      source: id,
      target: Math.round(Math.random() * (id - 1)),
    })),
};

const ForceGraphComponent: React.FC = () => {
  const nodeThreeObject = React.useCallback(
    (node: Node) => {
      // Create a group to combine image and label
      const group = new THREE.Group();

      // Create the image sprite
      const imgTexture = new THREE.TextureLoader().load(`/imgs/${node.img}`);
      imgTexture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.SpriteMaterial({ map: imgTexture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(6, 6, 1);

      group.add(sprite); // Add the image sprite to the group

      // Create the text label using SpriteText
      const label = new SpriteText(`${node.img}`);
      label.color = 'white'; // Text color
      label.backgroundColor = 'rgba(0,0,0,0.5)'; // Optional background
      label.textHeight = 4; // Adjust text size
      label.position.set(0, -10, 0); // Position below the node

      group.add(label); // Add the label to the group

      return group;
    },
    [] // Dependencies, leave empty since we don't want it to recompute
  );

  /*  const data = useMemo(() => {
    // cross-link node objects
    gData.links.forEach((link: any) => {
      const a: any = gData.nodes[link.source];
      const b: any = gData.nodes[link.target];
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });

    return gData;
  }, []); */

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ForceGraph3D graphData={gData} nodeThreeObject={nodeThreeObject} />
    </div>
  );
};

export default ForceGraphComponent;
