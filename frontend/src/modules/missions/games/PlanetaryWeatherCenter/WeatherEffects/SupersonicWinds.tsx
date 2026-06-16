import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'

interface SupersonicWindsProps {
  active: boolean;
}

export const SupersonicWinds: React.FC<SupersonicWindsProps> = ({ active }) => {
  const windLayerRef = useRef<THREE.Mesh>(null);
  const windLayerRef2 = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (active) {
      if (windLayerRef.current) windLayerRef.current.rotation.y += 0.02;
      if (windLayerRef2.current) windLayerRef2.current.rotation.x += 0.015;
    }
  });

  if (!active) return null;

  return (
    <>
      <mesh ref={windLayerRef} scale={1.08}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          transparent
          opacity={0.25}
          color="#6aaee6"
          emissive="#2a5a9a"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh ref={windLayerRef2} scale={1.12}>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshStandardMaterial
          transparent
          opacity={0.15}
          color="#8ac4ff"
        />
      </mesh>
    </>
  );
};