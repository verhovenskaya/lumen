import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { DustStorm } from '../../WeatherEffects/DustStorm';

interface MarsPlanetProps {
  activeEvent: string | null;
}

export const MarsPlanet: React.FC<MarsPlanetProps> = ({ activeEvent }) => {
  const planetRef = useRef<Mesh>(null);
  
  const marsTexture = useTexture('/assets/textures/8k_mars.jpg');
  const marsNormalMap = useTexture('/assets/textures/8k_mars.jpg');

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.002;
    }
  });

  const isDustStorm = activeEvent === 'dustStorm' || activeEvent === 'dustDevil';

  return (
    <>
      <mesh ref={planetRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={marsTexture}
          normalMap={marsNormalMap}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      <DustStorm active={isDustStorm} />
    </>
  );
};