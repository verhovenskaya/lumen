import React from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { Stars, useGLTF } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface RoverSceneProps {
  rover: { lat: number; lon: number; angle: number };
  craters: { id: number; lat: number; lon: number; collected: boolean }[];
}

const latLonToVec3 = (lat: number, lon: number, r: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
};

const FollowCamera: React.FC<{ rover: { lat: number; lon: number; angle: number } }> = ({ rover }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    const pos = latLonToVec3(rover.lat, rover.lon, 2.04);
    const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
    const angleRad = (rover.angle * Math.PI) / 180;
    
    const forwardX = Math.sin(angleRad);
    const forwardZ = Math.cos(angleRad);
    
    const camPos = new THREE.Vector3(
      pos.x - forwardX * 1.5 + normal.x * 1.5, 
      pos.y - forwardZ * 0 + normal.y * 1.5,
      pos.z - forwardZ * 1.5 + normal.z * 1.5,
    );
    

    const lookAt = new THREE.Vector3(pos.x, pos.y, pos.z);
    
    camera.position.lerp(camPos, 0.05);
    camera.lookAt(lookAt);
  });
  
  return null;
};

const RoverModel: React.FC = () => {
  const { scene } = useGLTF('/assets/models/rover.glb');
  return (
    <primitive 
      object={scene.clone()} 
      scale={[0.05, 0.05, 0.05]}
      rotation={[- Math.PI / 2, 0, 0]}  
    />
  );
};

const SceneContent: React.FC<RoverSceneProps> = ({ rover, craters }) => {
  const marsTexture = useLoader(TextureLoader, '/assets/textures/8k_mars.jpg');
  const roverPos = latLonToVec3(rover.lat, rover.lon, 2.04);
  const normal = new THREE.Vector3(roverPos.x, roverPos.y, roverPos.z).normalize();
  const up = normal.clone().multiplyScalar(0);

  const quaternion = new THREE.Quaternion();
  const matrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), normal, new THREE.Vector3(0, 1, 0));
  quaternion.setFromRotationMatrix(matrix);
  const angleQuat = new THREE.Quaternion().setFromAxisAngle(normal, (rover.angle * Math.PI) / 180);
  quaternion.multiply(angleQuat);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 3]} intensity={1.2} color="#ffccaa" />

      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={marsTexture} roughness={0.7} />
      </mesh>

      {craters.filter(c => !c.collected).map(c => {
        const pos = latLonToVec3(c.lat, c.lon, 2.03);
        const cNormal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
        const cQuat = new THREE.Quaternion();
        const cMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), cNormal, new THREE.Vector3(0, 1, 0));
        cQuat.setFromRotationMatrix(cMatrix);
        return (
          <mesh key={c.id} position={[pos.x, pos.y, pos.z]} quaternion={cQuat}>
            <torusGeometry args={[0.12, 0.025, 6, 12]} />
            <meshStandardMaterial color="#3A1A0A" roughness={0.9} />
          </mesh>
        );
      })}

      <group position={[roverPos.x + up.x, roverPos.y + up.y, roverPos.z + up.z]} quaternion={quaternion}>
        <RoverModel />
      </group>

      <FollowCamera rover={rover} />
      <Stars radius={30} depth={20} count={400} factor={2} />
    </>
  );
};

export const RoverScene: React.FC<RoverSceneProps> = (props) => (
  <Canvas camera={{ position: [0, 2, 4], fov: 50 }} shadows={false}>
    <SceneContent {...props} />
  </Canvas>
);