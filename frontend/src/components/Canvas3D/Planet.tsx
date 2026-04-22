import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, DoubleSide, TextureLoader } from 'three';
import { type PlanetConfig } from '../../config/planets.config';

interface PlanetProps {
  config: PlanetConfig;
}

export const Planet: React.FC<PlanetProps> = ({ config }) => {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  
  const planetTexture = useLoader(TextureLoader, config.texturePath);
  
  const ringTexture = config.hasRings && config.ringTexturePath 
    ? useLoader(TextureLoader, config.ringTexturePath)
    : null;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.0005;
    }
  });

  const getRingRotation = () => {
    if (config.id === 'uranus') {
      return [0.1, 0, 0.3];
    }
    return [Math.PI / 2.2, 0.2, 0];
  };

  return (
    <>
      <mesh ref={meshRef} scale={config.scale || 1}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          map={planetTexture} 
          roughness={0.5} 
          metalness={0.1} 
        />
      </mesh>
      
      {config.hasRings && (
        <mesh 
          ref={ringRef} 
          rotation={getRingRotation() as any}
        >
          <ringGeometry args={[
            config.id === 'uranus' ? 2.2 : 2.4,  
            config.id === 'uranus' ? 3.8 : 4.5,  
            128
          ]} />
          <meshStandardMaterial 
            map={ringTexture}
            color={!ringTexture && config.id === 'uranus' ? '#4a6a8a' : undefined}
            side={DoubleSide}
            transparent={true}
            opacity={config.id === 'uranus' ? 0.4 : 0.8}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
};