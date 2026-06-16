import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'

interface GreatDarkSpotProps {
  active: boolean;
}

export const GreatDarkSpot: React.FC<GreatDarkSpotProps> = ({ active }) => {
  const spotRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (active && spotRef.current) {
      spotRef.current.rotation.z += 0.005;
      spotRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.05);
    }
  });

  if (!active) return null;

  return (
    <mesh ref={spotRef} position={[1.2, 0.8, 1.5]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial
        transparent
        opacity={0.7}
        color="#1a2a4a"
        emissive="#0a1a3a"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
};