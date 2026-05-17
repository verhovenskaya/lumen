import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Planet } from '../../planets/components/Planet';
import { type SimulationPlanet } from '../simulation.config';
import * as THREE from 'three';

const planetAngles: Record<string, number> = {};

interface OrbitingPlanetProps {
  planet: SimulationPlanet;
  speed?: number;  
}

export const OrbitingPlanet: React.FC<OrbitingPlanetProps> = ({ planet, speed = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  if (!(planet.id in planetAngles)) {
    planetAngles[planet.id] = Math.random() * Math.PI * 2;
  }

  useFrame((_, delta) => {
    if (!groupRef.current || speed === 0) return;

    const effectiveDelta = delta * speed; 

    if (planet.isMoon && planet.parentPlanet) {
      const earthAngle = planetAngles['earth'] || 0;
      const earthOrbitRadius = 6.5;
      const earthX = Math.cos(earthAngle) * earthOrbitRadius;
      const earthZ = Math.sin(earthAngle) * earthOrbitRadius;
      
      planetAngles[planet.id] += effectiveDelta * (planet.orbitSpeed || 1.0);
      const moonAngle = planetAngles[planet.id];
      const moonOrbitRadius = planet.orbitRadius || 1.5;
      const moonX = Math.cos(moonAngle) * moonOrbitRadius;
      const moonZ = Math.sin(moonAngle) * moonOrbitRadius;
      
      groupRef.current.position.set(earthX + moonX, 0, earthZ + moonZ);
    } else if (planet.orbitRadius && planet.orbitSpeed) {
      planetAngles[planet.id] += effectiveDelta * planet.orbitSpeed;
      const angle = planetAngles[planet.id];
      
      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
    }
  });

  if (!planet.orbitRadius) return null;

  return (
    <group ref={groupRef}>
      <Planet config={planet} />
    </group>
  );
};