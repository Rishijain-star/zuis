import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PDBLoader } from 'three/examples/jsm/loaders/PDBLoader.js';
import {
  CSS3DRenderer,
  CSS3DObject,
  CSS3DSprite,
} from 'three/examples/jsm/renderers/CSS3DRenderer.js';

const MoleculeBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const rootRef = useRef();
  const objectsRef = useRef([]);
  const colorSpriteMap = {};
  let mouseX = 0, mouseY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  useEffect(() => {
    const container = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent to show LandingPage background
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      5000
    );
    camera.position.z = 1000;
    cameraRef.current = camera;

    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const root = new THREE.Object3D();
    scene.add(root);
    rootRef.current = root;

    const loader = new PDBLoader();
    const baseSprite = document.createElement('img');
    const offset = new THREE.Vector3();
    const tmpVec1 = new THREE.Vector3();
    const tmpVec2 = new THREE.Vector3();
    const tmpVec3 = new THREE.Vector3();
    const tmpVec4 = new THREE.Vector3();

    // Image to canvas for sprite coloring
    const imageToCanvas = (image) => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      return canvas;
    };

    // Colorify canvas
    const colorify = (ctx, width, height, color) => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0, l = data.length; i < l; i += 4) {
        data[i + 0] *= color.r;
        data[i + 1] *= color.g;
        data[i + 2] *= color.b;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    // Load molecule
    const loadMolecule = () => {
      const url = 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/models/pdb/caffeine.pdb';
      objectsRef.current.forEach((object) => object.parent.remove(object));
      objectsRef.current = [];

      loader.load(url, (pdb) => {
        const geometryAtoms = pdb.geometryAtoms;
        const geometryBonds = pdb.geometryBonds;
        const json = pdb.json;

        geometryAtoms.computeBoundingBox();
        geometryAtoms.boundingBox.getCenter(offset).negate();
        geometryAtoms.translate(offset.x, offset.y, offset.z);
        geometryBonds.translate(offset.x, offset.y, offset.z);

        // Atoms
        const positionAtoms = geometryAtoms.getAttribute('position');
        const colorAtoms = geometryAtoms.getAttribute('color');
        const position = new THREE.Vector3();
        const color = new THREE.Color();

        for (let i = 0; i < positionAtoms.count; i++) {
          position.fromBufferAttribute(positionAtoms, i);
          color.fromBufferAttribute(colorAtoms, i);
          const atomJSON = json.atoms[i];
          const element = atomJSON[4];

          if (!colorSpriteMap[element]) {
            const canvas = imageToCanvas(baseSprite);
            const context = canvas.getContext('2d');
            colorify(context, canvas.width, canvas.height, color);
            colorSpriteMap[element] = canvas.toDataURL();
          }

          const atom = document.createElement('img');
          atom.src = colorSpriteMap[element];
          const object = new CSS3DSprite(atom);
          object.position.copy(position).multiplyScalar(50);
          object.matrixAutoUpdate = false;
          object.updateMatrix();
          root.add(object);
          objectsRef.current.push(object);
        }

        // Bonds
        const positionBonds = geometryBonds.getAttribute('position');
        const start = new THREE.Vector3();
        const end = new THREE.Vector3();

        for (let i = 0; i < positionBonds.count; i += 2) {
          start.fromBufferAttribute(positionBonds, i);
          end.fromBufferAttribute(positionBonds, i + 1);
          start.multiplyScalar(50);
          end.multiplyScalar(50);

          tmpVec1.subVectors(end, start);
          const bondLength = tmpVec1.length() - 30;

          // Bond
          let bond = document.createElement('div');
          bond.className = 'bond';
          bond.style.width = '4px';
          bond.style.height = bondLength + 'px';
          bond.style.background = '#ccc';

          let object = new CSS3DObject(bond);
          object.position.copy(start).lerp(end, 0.5);
          object.userData.bondLengthShort = bondLength + 'px';
          object.userData.bondLengthFull = (bondLength + 35) + 'px';

          const axis = tmpVec2.set(0, 1, 0).cross(tmpVec1);
          const radians = Math.acos(
            tmpVec3.set(0, 1, 0).dot(tmpVec4.copy(tmpVec1).normalize())
          );
          const objMatrix = new THREE.Matrix4().makeRotationAxis(
            axis.normalize(),
            radians
          );
          object.matrix.copy(objMatrix);
          object.quaternion.setFromRotationMatrix(object.matrix);
          object.matrixAutoUpdate = false;
          object.updateMatrix();
          root.add(object);
          objectsRef.current.push(object);

          // Joint
          const joint = new THREE.Object3D();
          joint.position.copy(start).lerp(end, 0.5);
          joint.matrix.copy(objMatrix);
          joint.quaternion.setFromRotationMatrix(joint.matrix);
          joint.matrixAutoUpdate = false;
          joint.updateMatrix();

          bond = document.createElement('div');
          bond.className = 'bond';
          bond.style.width = '4px';
          bond.style.height = bondLength + 'px';
          bond.style.background = '#ccc';

          object = new CSS3DObject(bond);
          object.rotation.y = Math.PI / 2;
          object.matrixAutoUpdate = false;
          object.updateMatrix();
          object.userData.bondLengthShort = bondLength + 'px';
          object.userData.bondLengthFull = (bondLength + 35) + 'px';
          object.userData.joint = joint;
          joint.add(object);
          root.add(joint);
          objectsRef.current.push(object);
        }
      });
    };

    // Load sprite and molecule
    baseSprite.onload = () => loadMolecule();
    baseSprite.src =
      'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/textures/sprites/ball.png';

    // Mouse movement handler
    const onPointerMove = (event) => {
      if (!event.isPrimary) return;
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    // Resize handler
    const handleResize = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      const time = Date.now() * 0.0004;
      root.rotation.x = time;
      root.rotation.y = time * 0.7;
      renderer.render(scene, camera);
    };

    // Event listeners
    document.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', handleResize);

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('pointermove', onPointerMove);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'auto',
      }}
    />
  );
};

export default MoleculeBackground;