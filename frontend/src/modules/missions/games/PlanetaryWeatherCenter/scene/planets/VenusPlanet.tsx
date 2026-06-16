import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { VenusAtmosphere } from '../../WeatherEffects/VenusAtmosphere';

interface VenusPlanetProps {
  activeEvent: string | null;
}

export const VenusPlanet: React.FC<VenusPlanetProps> = ({ activeEvent }) => {
  const planetRef = useRef<Mesh>(null);
  const cloudLayerRef = useRef<Mesh>(null);
  
  const surfaceTexture = useTexture('/assets/textures/8k_mars.jpg');
  const cloudTexture = useTexture('/assets/textures/8k_mars.jpg');

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.0005;
    }
    if (cloudLayerRef.current) {
      cloudLayerRef.current.rotation.y += 0.002;
    }
  });

  const isAcidClouds = activeEvent === 'acidClouds';
  const isLightning = activeEvent === 'lightning';

  return (
    <>
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.85, 128, 128]} />
        <meshStandardMaterial
          map={surfaceTexture}
          roughness={0.9}
          metalness={0.05}
          color="#c4884a"
          emissive="#8b5a2a"
          emissiveIntensity={0.08}
        />
      </mesh>

      <mesh ref={cloudLayerRef}>
        <sphereGeometry args={[1.92, 128, 128]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.35}
          color="#f0d090"
          emissive="#d4a040"
          emissiveIntensity={0.05}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.98, 96, 96]} />
        <meshStandardMaterial
          transparent
          opacity={0.2}
          color="#f8e0a0"
          emissive="#ccaa66"
          emissiveIntensity={0.03}
        />
      </mesh>

      <VenusAtmosphere 
        activeAcidClouds={isAcidClouds}
        activeLightning={isLightning}
      />
    </>
  );
};