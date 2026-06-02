import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface DustStormProps {
  active: boolean;
}

export const DustStorm: React.FC<DustStormProps> = ({ active }) => {
  const dustCloudRef = useRef<Mesh>(null);

  useFrame(() => {
    if (active && dustCloudRef.current) {
      dustCloudRef.current.rotation.y += 0.01;
      dustCloudRef.current.rotation.x += 0.005;
    }
  });

  if (!active) return null;

  return (
    <mesh ref={dustCloudRef} scale={1.05}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        transparent
        opacity={0.35}
        color="#d98c4d"
        emissive="#8b3a1a"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};