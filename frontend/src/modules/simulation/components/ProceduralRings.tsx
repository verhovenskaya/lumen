import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProceduralRingsProps {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity: number;
  rotation?: [number, number, number];
}

export const ProceduralRings: React.FC<ProceduralRingsProps> = ({
  innerRadius,
  outerRadius,
  color,
  opacity,
  rotation = [0.4, 0, 0.2],
}) => {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.0005;
    }
  });
  const ringCount = 5;
  
  return (
    <group ref={ringsRef} rotation={rotation}>
      {Array.from({ length: ringCount }).map((_, i) => {
        const t = i / (ringCount - 1); // 0 до 1
        const radius = innerRadius + (outerRadius - innerRadius) * t;
        const thickness = 0.01 + Math.random() * 0.02;
        const alpha = opacity * (0.4 + Math.random() * 0.6);
        
        return (
          <mesh key={i}>
            <ringGeometry args={[radius, radius + thickness, 128]} />
            <meshBasicMaterial
              color={color}
              side={THREE.DoubleSide}
              transparent
              opacity={alpha}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};