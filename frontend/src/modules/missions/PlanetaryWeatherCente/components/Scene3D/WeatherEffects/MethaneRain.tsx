import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface MethaneRainProps {
  active: boolean;
}

export const MethaneRain: React.FC<MethaneRainProps> = ({ active }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 800;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Случайное распределение вокруг планеты
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + Math.random() * 0.3;
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const velocities = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      y: -0.005 - Math.random() * 0.01,
    }));
  }, []);

  useFrame(() => {
    if (active && pointsRef.current) {
      const positionsAttr = pointsRef.current.geometry.attributes.position;
      const array = positionsAttr.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Обновляем позицию капли
        array[i * 3 + 1] += velocities[i].y;
        
        // Сброс, если упала слишком низко
        if (array[i * 3 + 1] < -2.5) {
          array[i * 3 + 1] = 2.5;
          // Случайное смещение по X и Z
          array[i * 3] = (Math.random() - 0.5) * 4;
          array[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
      }
      positionsAttr.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color="#7eb6ff"
        size={0.03}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};