import React from 'react';

interface OrbitLineProps {
  radius: number;
  color: string;
}

export const OrbitLine: React.FC<OrbitLineProps> = ({ radius, color }) => {
  const points: [number, number, number][] = [];
  const segments = 64;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
  }

  return (
    <lineLoop>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flat()), 3]}
          count={points.length}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} opacity={0.3} transparent />
    </lineLoop>
  );
};