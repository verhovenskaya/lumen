import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'

interface MethaneIceCloudsProps {
  active: boolean;
}

export const MethaneIceClouds: React.FC<MethaneIceCloudsProps> = ({ active }) => {
  const cloudRef = useRef<THREE.Mesh>(null);
  const cloudRef2 = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (active) {
      if (cloudRef.current) cloudRef.current.rotation.y += 0.003;
      if (cloudRef2.current) cloudRef2.current.rotation.y -= 0.002;
    }
  });

  if (!active) return null;

  return (
    <>
      <mesh ref={cloudRef} scale={1.06}>
        <sphereGeometry args={[2.2, 96, 96]} />
        <meshStandardMaterial
          transparent
          opacity={0.3}
          color="#aaddff"
          emissive="#4488aa"
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh ref={cloudRef2} scale={1.1}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          transparent
          opacity={0.2}
          color="#cceeff"
        />
      </mesh>
    </>
  );
};