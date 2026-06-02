import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AcidCloudsProps {
  active: boolean;
}

export const AcidClouds: React.FC<AcidCloudsProps> = ({ active }) => {
  const cloudLayerRef = useRef<THREE.Mesh>(null);
  const innerCloudRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (active) {
      if (cloudLayerRef.current) cloudLayerRef.current.rotation.y += 0.0008;
      if (innerCloudRef.current) innerCloudRef.current.rotation.y -= 0.0005;
    }
  });

  if (!active) return null;

  return (
    <>
      {/* Внутренний плотный слой кислотных облаков */}
      <mesh ref={innerCloudRef}>
        <sphereGeometry args={[1.96, 96, 96]} />
        <meshStandardMaterial
          transparent
          opacity={0.55}
          color="#d4c088"
          emissive="#b89848"
          emissiveIntensity={0.06}
          roughness={0.3}
        />
      </mesh>
      
      {/* Внешний разреженный слой */}
      <mesh ref={cloudLayerRef}>
        <sphereGeometry args={[2.0, 80, 80]} />
        <meshStandardMaterial
          transparent
          opacity={0.25}
          color="#e8d4a0"
          emissive="#c8a860"
          emissiveIntensity={0.04}
        />
      </mesh>
    </>
  );
};