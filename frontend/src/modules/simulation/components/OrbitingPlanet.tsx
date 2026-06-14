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
  isSimulationRunning?: boolean;
}

export const OrbitingPlanet: React.FC<OrbitingPlanetProps> = ({ 
  planet, 
  speed = 1,
  onPlanetClick,
  isSelected = false,
  isSimulationRunning = true
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  
  useEffect(() => {
    if (!(planet.id in planetAngles)) {
      planetAngles[planet.id] = Math.random() * Math.PI * 2;
    }
    if (typeof window !== 'undefined') {
      (window as any).__planetAngles = planetAngles;
    }
  }, [planet.id]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    if (!isSimulationRunning || isSelected) {
      return;
    }

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
      planetAngles[planet.id] += effectiveDelta * planet.orbitSpeed;
      const angle = planetAngles[planet.id];
      
      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius;
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
      {/* Искусственная подсветка для выбранной планеты */}
      {isSelected && (
        <>
          {/* Rim light - контражур сбоку */}
          <pointLight
            ref={rimLightRef}
            position={[1.5, 1, 1.5]}
            intensity={2.5}
            color={planet.color || '#ffffff'}
            distance={5}
            decay={1}
          />
          {/* Дополнительный свет спереди */}
          <pointLight
            position={[1, 0.5, 2]}
            intensity={1.5}
            color="#ffffff"
            distance={4}
            decay={1}
          />
          {/* Мягкий свет снизу */}
          <pointLight
            position={[0, -1.5, 0]}
            intensity={1}
            color={planet.color || '#ffffff'}
            distance={3}
            decay={1}
          />
        </>
      )}
      
      {/* Эффект свечения (для визуального выделения) */}
      {isSelected && (
        <>
          {/* Внешнее большое свечение */}
          <mesh>
            <sphereGeometry args={[planet.scale + 0.25, 32, 32]} />
            <meshBasicMaterial 
              color={planet.color || '#ffffff'} 
              transparent 
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Среднее свечение */}
          <mesh>
            <sphereGeometry args={[planet.scale + 0.15, 32, 32]} />
            <meshBasicMaterial 
              color={planet.color || '#ffffff'} 
              transparent 
              opacity={0.25}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Внутреннее свечение */}
          <mesh ref={glowRef}>
            <sphereGeometry args={[planet.scale + 0.08, 32, 32]} />
            <meshBasicMaterial 
              color={planet.color || '#ffffff'} 
              transparent 
              opacity={0.4}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}
      
      <group onClick={handleClick}>
        <Planet config={planet} />
      </group>
    </group>
  );
};

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