import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader} from 'three';
import * as THREE from 'three'
import { SupersonicWinds } from '../../WeatherEffects/SupersonicWinds';
import { GreatDarkSpot } from '../../WeatherEffects/GreatDarkSpot';
import { MethaneIceClouds } from '../../WeatherEffects/MethaneIceClouds';

interface NeptunePlanetProps {
  activeEvent: string | null;
}

export const NeptunePlanet: React.FC<NeptunePlanetProps> = ({ activeEvent }) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, '/assets/textures/2k_neptune.jpg');

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.0025;
    }
  });

  const isSupersonicWinds = activeEvent === 'supersonicWinds';
  const isGreatDarkSpot = activeEvent === 'greatDarkSpot';
  const isMethaneIceClouds = activeEvent === 'methaneIceClouds';

  return (
    <group>
      <mesh ref={planetRef}>
        <sphereGeometry args={[2.2, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          color="#4a80c4"
          roughness={0.4}
          metalness={0.1}
          emissive="#1a3a6a"
          emissiveIntensity={0.08}
        />
      </mesh>
      {isSupersonicWinds && <SupersonicWinds active={true} />}
      {isGreatDarkSpot && <GreatDarkSpot active={true} />}
      {isMethaneIceClouds && <MethaneIceClouds active={true} />}
    </group>
  );
};