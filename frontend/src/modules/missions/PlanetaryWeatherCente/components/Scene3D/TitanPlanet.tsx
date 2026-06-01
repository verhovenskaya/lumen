import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { MethaneRain } from './WeatherEffects/MethaneRain';

interface TitanPlanetProps {
  activeEvent: string | null;
}

export const TitanPlanet: React.FC<TitanPlanetProps> = ({ activeEvent }) => {
  const planetRef = useRef<Mesh>(null);
  
  const titanTexture = useTexture('/assets/textures/8k_.jpg');

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001;
    }
  });

  const isMethaneRain = activeEvent === 'methaneRain' || activeEvent === 'methaneSnow';

  return (
    <>
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.8, 128, 128]} />
        <meshStandardMaterial
          map={titanTexture}
          roughness={0.6}
          metalness={0.05}
          color="#c4a86a"
        />
      </mesh>
      <MethaneRain active={isMethaneRain} />
    </>
  );
};