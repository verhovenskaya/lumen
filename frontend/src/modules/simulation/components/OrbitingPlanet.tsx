// src/simulation/components/OrbitingPlanet.tsx

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Planet } from '../../planets/components/Planet';
import { type SimulationPlanet } from '../simulation.config';
import * as THREE from 'three';

const planetAngles: Record<string, number> = {};

interface OrbitingPlanetProps {
  planet: SimulationPlanet;
  speed?: number;
  onPlanetClick?: (planet: SimulationPlanet, groupRef: THREE.Group) => void;
  isSelected?: boolean;
}

export const OrbitingPlanet: React.FC<OrbitingPlanetProps> = ({ 
  planet, 
  speed = 1,
  onPlanetClick,
  isSelected = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  if (!(planet.id in planetAngles)) {
    planetAngles[planet.id] = Math.random() * Math.PI * 2;
  }

  useFrame((_, delta) => {
    if (!groupRef.current || speed === 0) return;

    const effectiveDelta = delta * speed;

    if (planet.isMoon && planet.parentPlanet) {
      const parentAngle = planetAngles[planet.parentPlanet] || 0;
      const parentPlanetData = getParentPlanetData(planet.parentPlanet);
      const parentOrbitRadius = parentPlanetData?.orbitRadius || 6.5;
      const parentX = Math.cos(parentAngle) * parentOrbitRadius;
      const parentZ = Math.sin(parentAngle) * parentOrbitRadius;
      
      planetAngles[planet.id] += effectiveDelta * (planet.orbitSpeed || 1.0);
      const moonAngle = planetAngles[planet.id];
      const moonOrbitRadius = planet.orbitRadius || 1.5;
      const moonX = Math.cos(moonAngle) * moonOrbitRadius;
      const moonZ = Math.sin(moonAngle) * moonOrbitRadius;
      
      groupRef.current.position.set(parentX + moonX, 0, parentZ + moonZ);
    } else if (planet.orbitRadius && planet.orbitSpeed) {
      // Если планета выбрана, не обновляем её позицию
      if (!isSelected) {
        planetAngles[planet.id] += effectiveDelta * planet.orbitSpeed;
        const angle = planetAngles[planet.id];
        
        groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
        groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onPlanetClick && groupRef.current) {
      onPlanetClick(planet, groupRef.current);
    }
  };

  if (!planet.orbitRadius) return null;

  return (
    <group ref={groupRef}>
      {/* Эффект свечения для выбранной планеты */}
      {isSelected && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[planet.scale + 0.15, 32, 32]} />
          <meshBasicMaterial 
            color={planet.color || '#ffffff'} 
            transparent 
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      <group onClick={handleClick}>
        <Planet config={planet} />
      </group>
    </group>
  );
};

// Вспомогательная функция для получения данных родительской планеты
function getParentPlanetData(parentId: string) {
  const planetsData: Record<string, { orbitRadius: number }> = {
    earth: { orbitRadius: 6.5 },
    mars: { orbitRadius: 8.0 },
    jupiter: { orbitRadius: 10.5 },
    saturn: { orbitRadius: 13.0 },
    uranus: { orbitRadius: 15.5 },
    neptune: { orbitRadius: 18.0 },
  };
  return planetsData[parentId];
}