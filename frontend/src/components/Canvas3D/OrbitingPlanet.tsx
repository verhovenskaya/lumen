import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Planet } from './Planet';
import { type PlanetConfig } from '../../config/planets.config';
import * as THREE from 'three';

interface OrbitingPlanetProps {
  planet: PlanetConfig;
}

export const OrbitingPlanet: React.FC<OrbitingPlanetProps> = ({ planet }) => {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (groupRef.current && planet.orbitRadius && planet.orbitSpeed) {
      angleRef.current += delta * planet.orbitSpeed;
      groupRef.current.position.x = Math.cos(angleRef.current) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angleRef.current) * planet.orbitRadius;
    }
  });

  if (!planet.orbitRadius) return null;

  return (
    <group ref={groupRef}>
      <Planet config={planet} />
    </group>
  );
};