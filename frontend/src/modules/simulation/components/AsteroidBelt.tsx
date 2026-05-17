import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidBeltProps {
  radius: number;
  width?: number;
  count?: number;
  color?: string;
}

export const AsteroidBelt: React.FC<AsteroidBeltProps> = ({ 
  radius, 
  width = 0.8, 
  count = 1500, 
  color = '#8B7355' 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      
      const r = radius + (Math.random() - 0.5) * width;
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = (Math.random() - 0.5) * 0.3; 
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      const shade = 0.6 + Math.random() * 0.4;
      colors[i * 3] = baseColor.r * shade;
      colors[i * 3 + 1] = baseColor.g * shade;
      colors[i * 3 + 2] = baseColor.b * shade;
    }
    
    return { positions, colors };
  }, [radius, width, count, color]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        vertexColors 
        transparent 
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
};