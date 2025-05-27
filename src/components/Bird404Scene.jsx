import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';

const Bird404Scene = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null); // Store renderer to prevent duplicates
  const sceneRef = useRef(null); // Store scene to prevent duplicates

  useEffect(() => {
    let scene, camera, renderer;
    let bird1, bird2, bird3;
    let mousePos = { x: 0, y: 0 };
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    // Bird Class
    class Bird {
      constructor() {
        this.rSegments = 4;
        this.hSegments = 3;
        this.cylRay = 120;
        this.bodyBirdInitPositions = [];
        this.vAngle = this.hAngle = 0;
        this.normalSkin = { r: 255 / 255, g: 222 / 255, b: 121 / 255 };
        this.shySkin = { r: 255 / 255, g: 157 / 255, b: 101 / 255 };
        this.color = { r: this.normalSkin.r, g: this.normalSkin.g, b: this.normalSkin.b };
        this.side = "left";

        this.shyAngles = { h: 0, v: 0 };
        this.behaviourInterval;
        this.intervalRunning = false;

        this.threegroup = new THREE.Group();

        // Materials
        this.yellowMat = new THREE.MeshLambertMaterial({
          color: 0xffde79,
          flatShading: true,
        });
        this.whiteMat = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          flatShading: true,
        });
        this.blackMat = new THREE.MeshLambertMaterial({
          color: 0x000000,
          flatShading: true,
        });
        this.orangeMat = new THREE.MeshLambertMaterial({
          color: 0xff5535,
          flatShading: true,
        });

        // Wings
        this.wingLeftGroup = new THREE.Group();
        this.wingRightGroup = new THREE.Group();

        const wingGeom = new THREE.BoxGeometry(60, 60, 5);
        const wingLeft = new THREE.Mesh(wingGeom, this.yellowMat);
        this.wingLeftGroup.add(wingLeft);
        this.wingLeftGroup.position.set(70, 0, 0);
        this.wingLeftGroup.rotation.y = Math.PI / 2;
        wingLeft.rotation.x = -Math.PI / 4;

        const wingRight = new THREE.Mesh(wingGeom, this.yellowMat);
        this.wingRightGroup.add(wingRight);
        this.wingRightGroup.position.set(-70, 0, 0);
        this.wingRightGroup.rotation.y = -Math.PI / 2;
        wingRight.rotation.x = -Math.PI / 4;

        // Body
        const bodyGeom = new THREE.CylinderGeometry(40, 70, 200, this.rSegments, this.hSegments);
        this.bodyBird = new THREE.Mesh(bodyGeom, this.yellowMat);
        this.bodyBird.position.y = 70;

        // Initialize body vertices using attributes.position
        const positions = bodyGeom.attributes.position.array;
        this.bodyVerticesLength = positions.length / 3;
        this.bodyBirdInitPositions = [];
        for (let i = 0; i < this.bodyVerticesLength; i++) {
          this.bodyBirdInitPositions.push({
            x: positions[i * 3],
            y: positions[i * 3 + 1],
            z: positions[i * 3 + 2],
          });
        }

        this.threegroup.add(this.bodyBird);
        this.threegroup.add(this.wingLeftGroup);
        this.threegroup.add(this.wingRightGroup);

        // Eyes
        this.face = new THREE.Group();
        const eyeGeom = new THREE.BoxGeometry(60, 60, 10);
        const irisGeom = new THREE.BoxGeometry(10, 10, 10);

        this.leftEye = new THREE.Mesh(eyeGeom, this.whiteMat);
        this.leftEye.position.set(-30, 120, 35);
        this.leftEye.rotation.y = -Math.PI / 4;

        this.leftIris = new THREE.Mesh(irisGeom, this.blackMat);
        this.leftIris.position.set(-30, 120, 40);
        this.leftIris.rotation.y = -Math.PI / 4;

        this.rightEye = new THREE.Mesh(eyeGeom, this.whiteMat);
        this.rightEye.position.set(30, 120, 35);
        this.rightEye.rotation.y = Math.PI / 4;

        this.rightIris = new THREE.Mesh(irisGeom, this.blackMat);
        this.rightIris.position.set(30, 120, 40);
        this.rightIris.rotation.y = Math.PI / 4;

        // Beak
        const beakGeom = new THREE.CylinderGeometry(0, 20, 20, 4, 1);
        this.beak = new THREE.Mesh(beakGeom, this.orangeMat);
        this.beak.position.set(0, 70, 65);
        this.beak.rotation.x = Math.PI / 2;

        this.face.add(this.rightEye);
        this.face.add(this.rightIris);
        this.face.add(this.leftEye);
        this.face.add(this.leftIris);
        this.face.add(this.beak);

        // Feathers
        const featherGeom = new THREE.BoxGeometry(10, 20, 5);
        this.feather1 = new THREE.Mesh(featherGeom, this.yellowMat);
        this.feather1.position.set(0, 185, 55);
        this.feather1.rotation.x = Math.PI / 4;
        this.feather1.scale.set(1.5, 1.5, 1);

        this.feather2 = new THREE.Mesh(featherGeom, this.yellowMat);
        this.feather2.position.set(20, 180, 50);
        this.feather2.rotation.x = Math.PI / 4;
        this.feather2.rotation.z = -Math.PI / 8;

        this.feather3 = new THREE.Mesh(featherGeom, this.yellowMat);
        this.feather3.position.set(-20, 180, 50);
        this.feather3.rotation.x = Math.PI / 4;
        this.feather3.rotation.z = Math.PI / 8;

        this.face.add(this.feather1);
        this.face.add(this.feather2);
        this.face.add(this.feather3);
        this.threegroup.add(this.face);

        this.threegroup.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
      }

      look(hAngle, vAngle) {
        this.hAngle = hAngle;
        this.vAngle = vAngle;

        this.leftIris.position.y = 120 - this.vAngle * 30;
        this.leftIris.position.x = -30 + this.hAngle * 10;
        this.leftIris.position.z = 40 + this.hAngle * 10;

        this.rightIris.position.y = 120 - this.vAngle * 30;
        this.rightIris.position.x = 30 + this.hAngle * 10;
        this.rightIris.position.z = 40 - this.hAngle * 10;

        this.leftEye.position.y = this.rightEye.position.y = 120 - this.vAngle * 10;

        this.beak.position.y = 70 - this.vAngle * 20;
        this.beak.rotation.x = Math.PI / 2 + this.vAngle / 3;

        this.feather1.rotation.x = Math.PI / 4 + this.vAngle / 2;
        this.feather1.position.y = 185 - this.vAngle * 10;
        this.feather1.position.z = 55 + this.vAngle * 10;

        this.feather2.rotation.x = Math.PI / 4 + this.vAngle / 2;
        this.feather2.position.y = 180 - this.vAngle * 10;
        this.feather2.position.z = 50 + this.vAngle * 10;

        this.feather3.rotation.x = Math.PI / 4 + this.vAngle / 2;
        this.feather3.position.y = 180 - this.vAngle * 10;
        this.feather3.position.z = 50 + this.vAngle * 10;

        const positions = this.bodyBird.geometry.attributes.position.array;
        for (let i = 0; i < this.bodyVerticesLength; i++) {
          const line = Math.floor(i / (this.rSegments + 1));
          const tvInitPos = this.bodyBirdInitPositions[i];
          let a;
          if (line >= this.hSegments - 1) {
            a = 0;
          } else {
            a = this.hAngle / (line + 1);
          }
          const tx = tvInitPos.x * Math.cos(a) + tvInitPos.z * Math.sin(a);
          const tz = -tvInitPos.x * Math.sin(a) + tvInitPos.z * Math.cos(a);

          positions[i * 3] = tx;
          positions[i * 3 + 2] = tz;
        }

        this.face.rotation.y = this.hAngle;
        this.bodyBird.geometry.attributes.position.needsUpdate = true;
      }

      lookAway(fastMove) {
        const speed = fastMove ? 0.4 : 2;
        const ease = fastMove ? "power2.out" : "power2.inOut";
        const delay = fastMove ? 0.2 : 0;
        const col = fastMove ? this.shySkin : this.normalSkin;
        const tv = (-1 + Math.random() * 2) * Math.PI / 3;
        const beakScaleX = 0.75 + Math.random() * 0.25;
        const beakScaleZ = 0.5 + Math.random() * 0.5;

        const th = this.side === "right" ? (-1 + Math.random()) * Math.PI / 4 : Math.random() * Math.PI / 4;

        gsap.killTweensOf(this.shyAngles);
        gsap.to(this.shyAngles, { duration: speed, v: tv, h: th, ease: ease, delay: delay });
        gsap.to(this.color, { duration: speed, r: col.r, g: col.g, b: col.b, ease: ease, delay: delay });
        gsap.to(this.beak.scale, { duration: speed, z: beakScaleZ, x: beakScaleX, ease: ease, delay: delay });
      }

      stare() {
        const col = this.normalSkin;
        const th = this.side === "right" ? Math.PI / 3 : -Math.PI / 3;
        gsap.to(this.shyAngles, { duration: 2, v: -0.5, h: th, ease: "power2.inOut" });
        gsap.to(this.color, { duration: 2, r: col.r, g: col.g, b: col.b, ease: "power2.inOut" });
        gsap.to(this.beak.scale, { duration: 2, z: 0.8, x: 1.5, ease: "power2.inOut" });
      }
    }

    const init = () => {
      // Prevent duplicate initialization
      if (rendererRef.current || sceneRef.current) return;

      scene = new THREE.Scene();
      sceneRef.current = scene; // Store scene in ref
      const HEIGHT = window.innerHeight;
      const WIDTH = window.innerWidth;
      const aspectRatio = WIDTH / HEIGHT;
      const fieldOfView = 60;
      const nearPlane = 1;
      const farPlane = 2000;
      camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
      camera.position.set(0, 200, 1000); // Adjusted camera position to center the scene
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      rendererRef.current = renderer; // Store renderer in ref
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(WIDTH, HEIGHT);
      renderer.shadowMap.enabled = true;

      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      windowHalfX = WIDTH / 2;
      windowHalfY = HEIGHT / 2;

      window.addEventListener('resize', onWindowResize, false);
      document.addEventListener('mousemove', handleMouseMove, false);
      document.addEventListener('touchstart', handleTouchStart, false);
      document.addEventListener('touchend', handleTouchEnd, false);
      document.addEventListener('touchmove', handleTouchMove, false);

      createLights();
      createFloor();
      createBirds();
      loop();
    };

    const onWindowResize = () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      if (rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
      if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    };

    const handleMouseMove = (event) => {
      mousePos = { x: event.clientX, y: event.clientY };
    };

    const handleTouchStart = (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
        mousePos = { x: event.touches[0].pageX, y: event.touches[0].pageY };
      }
    };

    const handleTouchEnd = (event) => {
      mousePos = { x: windowHalfX, y: windowHalfY };
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 1) {
        event.preventDefault();
        mousePos = { x: event.touches[0].pageX, y: event.touches[0].pageY };
      }
    };

    const createLights = () => {
      const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
      const shadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
      shadowLight.position.set(200, 200, 200);
      shadowLight.castShadow = true;
      shadowLight.shadow.darkness = 0.2;

      const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
      backLight.position.set(-100, 200, 50);
      backLight.shadow.darkness = 0.1;
      backLight.castShadow = true;

      sceneRef.current.add(backLight);
      sceneRef.current.add(light);
      sceneRef.current.add(shadowLight);
    };

    const createFloor = () => {
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshBasicMaterial({ color: 0xe0dacd })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -33;
      floor.receiveShadow = true;
      sceneRef.current.add(floor);
    };

    const createBirds = () => {
      bird1 = new Bird();
      bird1.threegroup.position.x = 0;
      bird1.threegroup.position.y = 50; // Adjusted to center vertically
      sceneRef.current.add(bird1.threegroup);

      bird2 = new Bird();
      bird2.threegroup.position.x = -250;
      bird2.threegroup.position.y = 42; // Adjusted to center vertically (scaled)
      bird2.side = "right";
      bird2.threegroup.scale.set(0.8, 0.8, 0.8);
      sceneRef.current.add(bird2.threegroup);

      bird3 = new Bird();
      bird3.threegroup.position.x = 250;
      bird3.threegroup.position.y = 42; // Adjusted to center vertically (scaled)
      bird3.side = "left";
      bird3.threegroup.scale.set(0.8, 0.8, 0.8);
      sceneRef.current.add(bird3.threegroup);
    };

    const loop = () => {
      const tempHA = (mousePos.x - windowHalfX) / 200;
      const tempVA = (mousePos.y - windowHalfY) / 200;
      const userHAngle = Math.min(Math.max(tempHA, -Math.PI / 3), Math.PI / 3);
      const userVAngle = Math.min(Math.max(tempVA, -Math.PI / 3), Math.PI / 3);
      bird1.look(userHAngle, userVAngle);

      if (bird1.hAngle < -Math.PI / 5 && !bird2.intervalRunning) {
        bird2.lookAway(true);
        bird2.intervalRunning = true;
        bird2.behaviourInterval = setInterval(() => {
          bird2.lookAway(false);
        }, 1500);
      } else if (bird1.hAngle > 0 && bird2.intervalRunning) {
        bird2.stare();
        clearInterval(bird2.behaviourInterval);
        bird2.intervalRunning = false;
      } else if (bird1.hAngle > Math.PI / 5 && !bird3.intervalRunning) {
        bird3.lookAway(true);
        bird3.intervalRunning = true;
        bird3.behaviourInterval = setInterval(() => {
          bird3.lookAway(false);
        }, 1500);
      } else if (bird1.hAngle < 0 && bird3.intervalRunning) {
        bird3.stare();
        clearInterval(bird3.behaviourInterval);
        bird3.intervalRunning = false;
      }

      bird2.look(bird2.shyAngles.h, bird2.shyAngles.v);
      bird2.bodyBird.material.color.setRGB(bird2.color.r, bird2.color.g, bird2.color.b);

      bird3.look(bird3.shyAngles.h, bird3.shyAngles.v);
      bird3.bodyBird.material.color.setRGB(bird3.color.r, bird3.color.g, bird3.color.b);

      if (rendererRef.current && sceneRef.current && camera) {
        rendererRef.current.render(sceneRef.current, camera);
        requestAnimationFrame(loop);
      }
    };

    init();

    return () => {
      // Cleanup
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);

      // Clear intervals for bird2 and bird3
      if (bird2?.behaviourInterval) clearInterval(bird2.behaviourInterval);
      if (bird3?.behaviourInterval) clearInterval(bird3.behaviourInterval);

      // Dispose of Three.js objects
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            object.material.dispose();
          }
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }

      rendererRef.current = null;
      sceneRef.current = null;
    };
  }, []);

return (
  <>
    <style>
      {`
        #world {
          background: #e0dacd;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
        #errorText {
          position: absolute;
          width: 100%;
          top: 15%;
          text-align: center;
          font-family: 'Open Sans', sans-serif;
          color: #b75505;
        }
        #errorText h1 {
          font-size: 10em;
          margin: 0;
          line-height: 1em;
          text-transform: uppercase;
        }
        #errorText p {
          font-size: 2em;
          margin: 10px 0;
          text-transform: uppercase;
        }
        #bottomText {
          position: absolute;
          bottom: 60px;
          width: 100%;
          text-align: center;
          font-family: 'Open Sans', sans-serif;
          font-size: 1.5em;
          color: #b75505;
          text-transform: uppercase;
        }
        #credits {
          position: absolute;
          width: 100%;
          bottom: 20px;
          font-family: 'Open Sans', sans-serif;
          color: #b59b63;
          font-size: 0.7em;
          text-transform: uppercase;
          text-align: center;
        }
        #credits a {
          color: #b59b63;
          text-decoration: none;
        }
      `}
    </style>
    <div id="world" ref={mountRef}>
      
      <div id="bottomText">  
      <h1>404</h1>
      <p > Page Not Found</p>
      </div>

    </div>
  </>
);
}
export default Bird404Scene;