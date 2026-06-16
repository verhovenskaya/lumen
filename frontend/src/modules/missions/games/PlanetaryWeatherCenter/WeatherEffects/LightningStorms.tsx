import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightningStormsProps {
  active: boolean;
}

export const LightningStorms: React.FC<LightningStormsProps> = ({ active }) => {
  const lightningRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  
  const lightningPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 12; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.95;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push({ x, y, z, delay: Math.random() * Math.PI * 2 });
    }
    return positions;
  }, []);

  useFrame(() => {
    if (active && lightningRef.current) {
      timeRef.current += 0.05;
      
      const intensity = 0.3 + Math.sin(timeRef.current * 8) * 0.25;
      const material = lightningRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = intensity;
      
      lightningRef.current.rotation.y += 0.005;
      lightningRef.current.rotation.x += 0.002;
    }
  });

  if (!active) return null;

  return (
    <group>
      <mesh ref={lightningRef}>
        <sphereGeometry args={[1.96, 64, 64]} />
        <meshStandardMaterial
          transparent
          opacity={0.4}
          color="#ffdd88"
          emissive="#ffaa44"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {lightningPositions.map((pos, idx) => (
        <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
          <coneGeometry args={[0.08, 0.4, 4]} />
          <meshStandardMaterial
            color="#ffeeaa"
            emissive="#ffcc66"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};