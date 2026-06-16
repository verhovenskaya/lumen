import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, DoubleSide, TextureLoader } from 'three';
import { ProceduralRings } from '../../../simulation/components/ProceduralRings';
import { type PlanetConfig } from '../../config/planets.config';
import { type SimulationPlanet } from '../../../simulation/config/simulation.config';

interface PlanetProps {
  config: PlanetConfig | SimulationPlanet;
}

export const Planet: React.FC<PlanetProps> = ({ config }) => {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);

  const planetTexture = useLoader(TextureLoader, config.texturePath);
  const hasTextureRings = config.hasRings && 'ringTexturePath' in config && !!config.ringTexturePath;
  
  const ringTexture = hasTextureRings
    ? useLoader(TextureLoader, config.ringTexturePath!)
    : null;

  const hasProceduralRings = config.hasRings && 
    'ringInnerRadius' in config && 
    !!config.ringInnerRadius && 
    !('ringTexturePath' in config && config.ringTexturePath);

  const isSun = config.id === 'sun';

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.002;
    if (ringRef.current) ringRef.current.rotation.y += 0.0005;
  });

  const getProceduralRingProps = () => {
    if (!hasProceduralRings) return null;
    const simConfig = config as SimulationPlanet;
    return {
      innerRadius: (simConfig.ringInnerRadius || 1.0) * 2,
      outerRadius: (simConfig.ringOuterRadius || 1.5) * 2,
      color: simConfig.ringColor || '#ffffff',
      opacity: simConfig.ringOpacity || 0.5,
      rotation: simConfig.ringRotation || [0.4, 0, 0.2] as [number, number, number],
    };
  };

  const proceduralProps = getProceduralRingProps();

  return (
    <>
      <mesh ref={meshRef} scale={config.scale || 1}>
        <sphereGeometry args={[2, 64, 64]} />
        {isSun ? (
          <meshBasicMaterial map={planetTexture} />
        ) : (
          <meshStandardMaterial 
            map={planetTexture} 
            roughness={0.5} 
            metalness={0.1} 
          />
        )}
      </mesh>
      
      {hasTextureRings && ringTexture && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0.2, 0]}>
          <ringGeometry args={[1, 1.4, 128]} />
          <meshStandardMaterial 
            map={ringTexture}
            side={DoubleSide}
            transparent={true}
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {proceduralProps && (
        <ProceduralRings
          innerRadius={proceduralProps.innerRadius}
          outerRadius={proceduralProps.outerRadius}
          color={proceduralProps.color}
          opacity={proceduralProps.opacity}
          rotation={proceduralProps.rotation}
        />
      )}
    </>
  );
};